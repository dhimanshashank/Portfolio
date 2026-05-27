"use client";

import { useState, type FormEvent } from "react";
import { person } from "@/lib/person";
import { cn } from "@/lib/utils";

/**
 * <ContactForm>
 *
 * Real submission — no mail client opens. Form POSTs to /api/contact, which
 * sends through Resend and lands directly in Shashank's inbox.
 *
 * UX states:
 *   - idle     → fields editable, button says "Send message"
 *   - sending  → button disabled, spinner-text "Sending…"
 *   - success  → fields cleared, green confirmation row replaces the button
 *   - error    → red error row above button; fields preserved so the visitor
 *                can fix and retry. Includes a "or email directly" fallback.
 *
 * Server validation mirrors client checks — never trust the form alone.
 */

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const initialFields = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [fields, setFields] = useState(initialFields);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onChange = (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((f) => ({ ...f, [key]: e.target.value }));
      // If the visitor is editing after an error, clear the error so they
      // don't see stale red text while fixing the issue.
      if (status.kind === "error") setStatus({ kind: "idle" });
    };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.kind === "sending") return;

    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setStatus({
          kind: "error",
          message: body?.error ?? "Couldn't send right now.",
        });
        return;
      }

      setFields(initialFields);
      setStatus({ kind: "success" });
    } catch {
      setStatus({
        kind: "error",
        message: "Network issue. Check your connection and try again.",
      });
    }
  };

  const isSending = status.kind === "sending";
  const isSuccess = status.kind === "success";
  const isError = status.kind === "error";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-7" noValidate>
      <Field label="Name" id="name" required>
        <input
          id="name"
          type="text"
          autoComplete="name"
          required
          disabled={isSending}
          value={fields.name}
          onChange={onChange("name")}
          className={inputClasses}
        />
      </Field>

      <Field label="Email" id="email" required>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          disabled={isSending}
          value={fields.email}
          onChange={onChange("email")}
          className={inputClasses}
        />
      </Field>

      <Field label="Subject" id="subject">
        <input
          id="subject"
          type="text"
          disabled={isSending}
          value={fields.subject}
          onChange={onChange("subject")}
          placeholder="What's this about?"
          className={inputClasses}
        />
      </Field>

      <Field label="Message" id="message" required>
        <textarea
          id="message"
          rows={5}
          required
          disabled={isSending}
          value={fields.message}
          onChange={onChange("message")}
          className={cn(inputClasses, "resize-y min-h-[140px] py-4")}
        />
      </Field>

      {/* ── Error row ───────────────────────────────────────────────── */}
      {isError && (
        <div
          role="alert"
          className="flex flex-wrap items-baseline gap-3 border-l-2 border-danger pl-4 py-2"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-danger">
            Failed
          </span>
          <span className="text-ink-2 text-[14px]">{status.message}</span>
          <a
            href={`mailto:${person.email}`}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink hover:text-signal transition-colors"
          >
            Email directly ↗
          </a>
        </div>
      )}

      {/* ── Action row ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-5 pt-2">
        {!isSuccess && (
          <button
            type="submit"
            disabled={isSending}
            className={cn(
              "group inline-flex items-center gap-3",
              "bg-signal text-paper",
              "px-6 py-3.5",
              "font-mono text-[12px] uppercase tracking-[0.18em]",
              "rounded-sm",
              "transition-colors duration-300",
              "hover:bg-signal-low",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-signal/40",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {isSending ? "Sending" : "Send message"}
            <span
              aria-hidden
              className={cn(
                "inline-block transition-transform duration-300",
                isSending ? "animate-pulse" : "group-hover:translate-x-1.5"
              )}
            >
              {isSending ? "…" : "→"}
            </span>
          </button>
        )}

        {isSuccess && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 border border-ok/40 bg-ok/[0.06] px-5 py-3 rounded-sm">
              <span aria-hidden className="text-ok">✓</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ok">
                Sent. I&apos;ll reply within 48h.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStatus({ kind: "idle" })}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3 hover:text-ink transition-colors"
            >
              Send another →
            </button>
          </div>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4 max-w-[50ch]">
        Submissions go straight to my inbox via Resend. Your email is set as
        reply-to so I can answer you directly.
      </p>
    </form>
  );
}

// ─── Field shell — label + input slot ─────────────────────────────────────
function Field({
  label,
  id,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
        {label}
        {required && <span className="text-signal ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

// Single source of truth for input styling — keeps every field identical
const inputClasses = `
  w-full
  border-0 border-b border-ink/20
  bg-transparent
  px-0 py-3
  text-ink
  text-[15px]
  placeholder:text-ink-4
  focus:outline-none focus:border-signal
  disabled:opacity-60 disabled:cursor-not-allowed
  transition-colors duration-200
`.replace(/\s+/g, " ").trim();
