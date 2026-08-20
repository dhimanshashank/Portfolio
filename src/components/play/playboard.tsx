"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";

/**
 * <Playboard> — the drafting table.
 *
 * A spare sheet on the desk: visitors draw with a speed-sensitive graphite
 * pencil, an ink pen, a signal-orange marker, or erase — the same media the
 * rest of the site is drawn in.
 *
 * Engine notes:
 *   - Strokes are stored in NORMALIZED coordinates (0..1 of the sheet) with
 *     a per-point width factor baked at capture time, so undo / reload /
 *     resize all replay identically at any sheet size.
 *   - The pencil maps pointer speed → width & darkness (slow press = dark
 *     wide graphite, fast flick = thin light line).
 *   - Eraser uses destination-out at <1 alpha — leaves the faint ghosting
 *     a real eraser leaves on graphite.
 *   - Clear crumples the sheet: snapshot → ball → tossed off-page (skipped
 *     for prefers-reduced-motion).
 *   - The sketch persists in localStorage ("pinned to the wall") and can be
 *     downloaded as a PNG with the paper texture + site stamp baked in.
 */

type Tool = "pencil" | "pen" | "marker" | "eraser";

type StrokePoint = { x: number; y: number; w: number };
type Stroke = { tool: Tool; pts: StrokePoint[] };

const STORAGE_KEY = "playboard-sketch-v1";
const MAX_STROKES = 400;

const TOOL_STYLE: Record<
  Tool,
  { stroke: string; alpha: number; base: number; composite: GlobalCompositeOperation }
> = {
  pencil: { stroke: "#2A2A2A", alpha: 0.5, base: 2.2, composite: "multiply" },
  pen: { stroke: "#0E0E0E", alpha: 0.92, base: 2.0, composite: "source-over" },
  marker: { stroke: "#FF5B1F", alpha: 0.85, base: 3.2, composite: "source-over" },
  eraser: { stroke: "#000", alpha: 0.8, base: 26, composite: "destination-out" },
};

const TOOLS: { id: Tool; label: string; hint: string }[] = [
  { id: "pencil", label: "pencil", hint: "graphite — speed changes the line" },
  { id: "pen", label: "pen", hint: "ink — clean and confident" },
  { id: "marker", label: "marker", hint: "the site's signal orange" },
  { id: "eraser", label: "eraser", hint: "leaves a little ghost, like real ones" },
];

export function Playboard() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const crumpleRef = useRef<HTMLDivElement>(null);

  const strokesRef = useRef<Stroke[]>([]);
  const liveStroke = useRef<Stroke | null>(null);
  const lastPt = useRef<{ x: number; y: number; t: number; w: number } | null>(null);

  const [tool, setTool] = useState<Tool>("pencil");
  const [hasInk, setHasInk] = useState(false);
  const [crumpling, setCrumpling] = useState(false);
  const toolRef = useRef<Tool>("pencil");
  toolRef.current = tool;

  // ── Canvas plumbing ─────────────────────────────────────────────────

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const sheetSize = () => {
    const el = sheetRef.current;
    return el ? { w: el.clientWidth, h: el.clientHeight } : { w: 1, h: 1 };
  };

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, s: Stroke) => {
    const { w: sw, h: sh } = sheetSize();
    const style = TOOL_STYLE[s.tool];
    if (s.pts.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = style.composite;
    ctx.globalAlpha = style.alpha;
    ctx.strokeStyle = style.stroke;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (s.pts.length === 1) {
      const p = s.pts[0];
      ctx.beginPath();
      ctx.arc(p.x * sw, p.y * sh, (style.base * p.w) / 2, 0, Math.PI * 2);
      ctx.fillStyle = style.stroke;
      ctx.fill();
      ctx.restore();
      return;
    }
    for (let i = 1; i < s.pts.length; i++) {
      const a = s.pts[i - 1];
      const b = s.pts[i];
      ctx.beginPath();
      ctx.lineWidth = style.base * ((a.w + b.w) / 2);
      ctx.moveTo(a.x * sw, a.y * sh);
      ctx.lineTo(b.x * sw, b.y * sh);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  const redrawAll = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    for (const s of strokesRef.current) drawStroke(ctx, s);
  }, [drawStroke]);

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    const { w, h } = sheetSize();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redrawAll();
  }, [redrawAll]);

  const persist = useCallback(() => {
    try {
      const strokes = strokesRef.current.slice(-MAX_STROKES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(strokes));
    } catch {
      /* storage full / blocked — sketch just won't survive reload */
    }
  }, []);

  // Mount: restore + size + observe
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Stroke[];
        if (Array.isArray(parsed)) {
          strokesRef.current = parsed;
          setHasInk(parsed.length > 0);
        }
      }
    } catch {
      /* corrupt storage — start fresh */
    }
    sizeCanvas();
    const ro = new ResizeObserver(() => sizeCanvas());
    if (sheetRef.current) ro.observe(sheetRef.current);
    return () => ro.disconnect();
  }, [sizeCanvas]);

  // ── Drawing ─────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pointFromEvent = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    /** Speed → width factor. Slow deliberate strokes press harder. */
    const widthFor = (dist: number, dt: number, prev: number) => {
      if (toolRef.current !== "pencil") return 1;
      const v = dist / Math.max(dt, 1); // px per ms
      const target = Math.min(Math.max(1.55 - v * 1.35, 0.45), 1.55);
      return prev + (target - prev) * 0.35; // smooth, no jitter
    };

    const drawSegment = (
      ctx: CanvasRenderingContext2D,
      s: Stroke,
      ia: number,
      ib: number
    ) => {
      if (ia < 0) return;
      const { w: sw, h: sh } = sheetSize();
      const style = TOOL_STYLE[s.tool];
      const a = s.pts[ia];
      const b = s.pts[ib];
      ctx.save();
      ctx.globalCompositeOperation = style.composite;
      ctx.globalAlpha = style.alpha;
      ctx.strokeStyle = style.stroke;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = style.base * ((a.w + b.w) / 2);
      ctx.beginPath();
      ctx.moveTo(a.x * sw, a.y * sh);
      ctx.lineTo(b.x * sw, b.y * sh);
      ctx.stroke();
      ctx.restore();
    };

    const onDown = (e: PointerEvent) => {
      if (crumpling) return;
      canvas.setPointerCapture(e.pointerId);
      const { x, y } = pointFromEvent(e);
      const w = toolRef.current === "pencil" ? 1.1 : 1;
      liveStroke.current = { tool: toolRef.current, pts: [{ x, y, w }] };
      lastPt.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, w };
    };

    const onMove = (e: PointerEvent) => {
      const stroke = liveStroke.current;
      const last = lastPt.current;
      if (!stroke || !last) return;
      const events =
        "getCoalescedEvents" in e ? (e.getCoalescedEvents() as PointerEvent[]) : [e];
      const ctx = getCtx();
      if (!ctx) return;
      for (const ev of events) {
        const dist = Math.hypot(ev.clientX - last.x, ev.clientY - last.y);
        if (dist < 1.2) continue;
        const w = widthFor(dist, ev.timeStamp - last.t, last.w);
        const { x, y } = pointFromEvent(ev);
        stroke.pts.push({ x, y, w });
        lastPt.current = { x: ev.clientX, y: ev.clientY, t: ev.timeStamp, w };
        const n = stroke.pts.length;
        drawSegment(ctx, stroke, n - 2, n - 1);
      }
    };

    const onUp = () => {
      const stroke = liveStroke.current;
      if (!stroke) return;
      liveStroke.current = null;
      lastPt.current = null;
      strokesRef.current.push(stroke);
      if (strokesRef.current.length > MAX_STROKES) {
        strokesRef.current = strokesRef.current.slice(-MAX_STROKES);
      }
      setHasInk(true);
      persist();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [crumpling, persist]);

  // ── Actions ─────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    if (!strokesRef.current.length) return;
    strokesRef.current.pop();
    redrawAll();
    setHasInk(strokesRef.current.length > 0);
    persist();
  }, [redrawAll, persist]);

  // ⌘Z / Ctrl+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  const clearSheet = useCallback(() => {
    const canvas = canvasRef.current;
    const crumple = crumpleRef.current;
    if (!canvas || !strokesRef.current.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const wipe = () => {
      strokesRef.current = [];
      liveStroke.current = null;
      redrawAll();
      setHasInk(false);
      persist();
    };

    if (reduce || !crumple) {
      wipe();
      return;
    }

    // Snapshot the sheet, then crumple + toss the snapshot while the real
    // canvas underneath is already clean.
    const url = canvas.toDataURL("image/png");
    const img = crumple.querySelector("img") as HTMLImageElement | null;
    if (!img) {
      wipe();
      return;
    }
    img.src = url;
    setCrumpling(true);
    wipe();

    gsap.set(crumple, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      borderRadius: 0,
      filter: "none",
    });
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(crumple, { autoAlpha: 0 });
          setCrumpling(false);
        },
      })
      // Crumple: collapse into a rough ball
      .to(crumple, {
        scale: 0.16,
        rotate: -18,
        borderRadius: "50%",
        filter: "contrast(1.15) brightness(0.96)",
        duration: 0.38,
        ease: "power3.in",
      })
      // Toss: arc off the bottom-right of the page
      .to(crumple, {
        x: () => (sheetRef.current?.clientWidth ?? 600) * 0.65,
        y: 90,
        rotate: 160,
        duration: 0.55,
        ease: "power1.in",
      })
      .to(crumple, { autoAlpha: 0, duration: 0.12 }, "-=0.1");
  }, [redrawAll, persist]);

  const download = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = sheetSize();
    const dpr = 2;
    const out = document.createElement("canvas");
    out.width = w * dpr;
    out.height = h * dpr;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Paper base
    ctx.fillStyle = "#F5F1E8";
    ctx.fillRect(0, 0, w, h);

    // Paper tooth — same turbulence grain the site uses
    const grain = new Image();
    grain.src =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#g)' opacity='0.05'/></svg>"
      );
    await new Promise((res) => {
      grain.onload = res;
      grain.onerror = res;
    });
    try {
      const pattern = ctx.createPattern(grain, "repeat");
      if (pattern) {
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
    } catch {
      /* grain is decoration — export continues without it */
    }

    // The drawing itself
    ctx.drawImage(canvas, 0, 0, w, h);

    // Corner stamp
    const date = new Date().toISOString().slice(0, 10);
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillStyle = "rgba(92,92,92,0.75)";
    ctx.textAlign = "right";
    ctx.fillText(`drawn on shashankdhiman.in · ${date}`, w - 12, h - 12);
    ctx.fillStyle = "#FF5B1F";
    ctx.fillRect(w - 8, h - 20, 3, 3);

    const a = document.createElement("a");
    a.href = out.toDataURL("image/png");
    a.download = `sketch-shashankdhiman-${date}.png`;
    a.click();
  }, []);

  // ── UI ──────────────────────────────────────────────────────────────

  // min-h-11 keeps the rail at 44px touch height on phones; desktop
  // collapses back to the compact chip height.
  const actionBtn =
    "px-3.5 py-2 min-h-11 md:min-h-0 font-mono text-[11px] uppercase tracking-[0.16em] sketch-btn transition-colors duration-300 cursor-pointer select-none";

  return (
    <div>
      {/* ─── Tool rail ─────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5 md:gap-3">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.hint}
            aria-pressed={tool === t.id}
            onClick={() => setTool(t.id)}
            className={cn(
              actionBtn,
              tool === t.id
                ? t.id === "marker"
                  ? "bg-signal-cta text-white"
                  : "bg-ink text-paper"
                : "text-ink-2 hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}

        <span aria-hidden className="mx-1 hidden h-5 w-px bg-ink/15 md:block" />

        <button
          type="button"
          onClick={undo}
          disabled={!hasInk}
          className={cn(
            actionBtn,
            "text-ink-3 hover:text-ink disabled:cursor-default disabled:opacity-35"
          )}
        >
          undo
        </button>
        <button
          type="button"
          onClick={clearSheet}
          disabled={!hasInk || crumpling}
          className={cn(
            actionBtn,
            "text-ink-3 hover:text-ink disabled:cursor-default disabled:opacity-35"
          )}
        >
          crumple
        </button>
        <button
          type="button"
          onClick={download}
          disabled={!hasInk}
          className={cn(
            actionBtn,
            "text-ink-3 hover:text-signal disabled:cursor-default disabled:opacity-35"
          )}
        >
          keep it ↓
        </button>
      </div>

      {/* ─── The sheet ─────────────────────────────────────────────── */}
      <div
        ref={sheetRef}
        className="sketch-edge relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-paper-soft sm:aspect-[16/10]"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ touchAction: "none", cursor: "crosshair" }}
          aria-label="Drawing sheet — draw with your pointer"
        />

        {/* Crumple layer — hidden snapshot used by the clear animation */}
        <div
          ref={crumpleRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden bg-paper-soft"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="h-full w-full" draggable={false} />
        </div>

        {/* Empty-sheet invitation — fades once there's ink */}
        <p
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display italic text-ink-4 transition-opacity duration-700",
            hasInk ? "opacity-0" : "opacity-60"
          )}
          style={{ fontSize: "clamp(16px, 1.6vw, 22px)" }}
        >
          the sheet is yours — draw something.
        </p>
      </div>

      {/* Sheet caption */}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-4">
        sketches stay pinned to this wall (your browser) · ⌘Z undoes
      </p>
    </div>
  );
}
