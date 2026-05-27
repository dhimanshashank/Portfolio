# portfolio-v2 — Engineering Context

> Single-source reference for what this project is, what's been built, and how
> to extend it. Read this before touching code. Update it when meaningful
> decisions change.

---

## 1. Purpose

This is **Shashank Dhiman's** personal portfolio. Backend engineer, ~1 year at
Masters' Union (proctoring platform, real-time messaging, analytics pipelines,
Stripe payments). The portfolio's job is to make a recruiter / collaborator stop
scrolling and click through to the proctoring case study — and to make a senior
engineer recognize the work as real.

**Audience priority order:**

1. Hiring managers / recruiters at Indian product unicorns + funded startups
2. Senior backend engineers (peer recognition; long-form readers)
3. Collaborators in the real-time / WebRTC / AI-infrastructure space

**What this portfolio is NOT:**

- A case-study deck for one job (the v1 portfolio's biggest failure mode)
- An AI-generated template (manifestos, "Philosophy Cards", "Interview Talking
  Points" — all deliberately burned)
- A blog (long-form lives on GitHub Pages; this site links out)

---

## 2. North Star

A visitor lands. Within 3 seconds they see something that doesn't look like a
template. Within 30 seconds of scrolling they're inside the proctoring story.
By the end they know:

1. Shashank builds real-time systems at production scale
2. He thinks in trust boundaries, failure modes, and rearchitecting under load
3. He can also build the kind of website you'd hire a studio for

**Editorial register**: voice-led, restrained, magazine-grade typography over
flashy motion. Inspirations: `en.bazil.fr`, `eatnaked.co`, Rauno Freiberg,
Tobias van Schneider. Motion is *cinematic*, not noisy.

---

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.2.6** (App Router, TypeScript) | Turbopack enabled |
| React | **19.2.4** | `ref` as plain prop works without forwardRef |
| Styling | **Tailwind v4** | CSS-first via `@theme` in `globals.css` |
| Smooth scroll | **Lenis 1.3** | Single source of truth; GSAP ticker drives its RAF |
| Scroll-driven animation | **GSAP 3.15 + ScrollTrigger** | Required for pinned + horizontal scroll |
| Component motion | **Framer Motion 12** | Used for page-level reveals & small UI |
| Typography | `next/font/google` — **Inter**, **Fraunces** (variable serif), **JetBrains Mono** | All variable; no weight imports |
| Code highlighting | hand-tokenized JSX | Shiki installed but unused — replaced by `<CodeFrame>` + helpers |
| Email | **Resend** | `/api/contact` is the only dynamic route |
| Icons | `lucide-react` | Sparse use; mostly arrows + bullets done in text |
| Class merging | `clsx` + `tailwind-merge` (`cn()` in `lib/utils.ts`) | |

**Explicitly NOT installed**: Locomotive Scroll (Lenis replaces it), raw Three.js
(would be R3F if added in Phase 8), CSS-in-JS (Tailwind is enough).

---

## 4. Design System

### Colors (live in `src/app/globals.css`)

| Token | Value | Use |
|---|---|---|
| `--signal` | `#FF5B1F` (Signal Orange) | Primary brand accent — never the body color |
| `--signal-hi` / `--signal-low` | brighter / pressed | Hover / active states |
| `--paper` | `#F5F1E8` (warm off-white) | Page background, default |
| `--paper-soft` | `#EFEADF` | Recessed cards, secondary background |
| `--paper-deep` | `#E6E0D2` | Card dividers |
| `--ink` | `#0E0E0E` (graphite) | Primary text |
| `--ink-2` / `--ink-3` / `--ink-4` | progressively muted | Body / meta / disabled |
| `--void` family | dark mirrors of paper/ink | Reserved for dark sections (e.g. code frames) |
| `--bone` family | dark-mode text tones | On `void` backgrounds |
| `--ok` `--warn` `--danger` | semantic | Use sparingly |

**Convention**: Signal orange is punctuation, not the canvas. If more than ~3%
of a viewport is orange, dial it back.

### Typography

| Class | Font | Use |
|---|---|---|
| `font-display` | Fraunces | All headlines, big numbers, editorial italic moments |
| `font-sans` | Inter | Body, UI |
| `font-mono` | JetBrains Mono | Labels, eyebrows, code, metadata, nav |

**Type scale** lives in CSS variables (`--text-hero`, `--text-display`,
`--text-h1`...). Most usages inline `style={{ fontSize: 'clamp(...)' }}` for
fluid responsive sizing — that's intentional.

### Italic Fraunces — important gotcha

Italic glyphs slant right and have ascenders/descenders that extend past their
inline box. Hard-learned rules:

- **`letter-spacing: 0`** on italic display text. Negative tracking makes
  glyphs eat their neighbours.
- **`word-spacing: 0.04em – 0.18em`** to compensate for visual proximity.
- **No `overflow: hidden`** on italic word wrappers — clips trailing slants
  and descenders. If you need an animation reveal mask, use opacity, not clip.
- **`paddingRight: 0.08em`** + **`paddingBottom: 0.22em`** on italic word
  spans if you must constrain them.
- **Line-height ≥ 1.15** for italic display sizes; descenders need room.

See `src/components/manifesto/manifesto-scroll.tsx` SentenceLayer for the
canonical "italic done right" pattern.

### Motion principles

| | |
|---|---|
| **Ease** | Default `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out). For scroll-scrub, `ease: "none"`. |
| **Reveal** | Opacity + small Y (8–24px). Never large translates. |
| **Pin** | All `<PinnedSection>` and bespoke pin sections respect Lenis via the GSAP integration in `src/lib/motion/lenis-provider.tsx`. |
| **Reduced motion** | Every motion component checks `prefers-reduced-motion` and snaps to the final state. Never decorative-only animation that excludes reduced-motion users. |
| **Hot path** | GSAP timeline → scrub-driven. Avoid `useState` for high-frequency updates (lesson 03 from the proctoring blog). |

### Spacing

8pt grid in CSS variables (`--space-1` through `--space-40`). Tailwind utilities
map to these. Custom semantic sizes: `--spacing-section` (96px), `--spacing-section-sm` (64px).

---

## 5. Page Map

| Route | File | What lives there |
|---|---|---|
| `/` | `src/app/page.tsx` | Hero (split layout + halftone portrait) → ManifestoScroll (pinned scrub: 2 sentences → centerpiece "1 year" → 3 domain flashes → 2×2 grid + CTA → /work) |
| `/work` | `src/app/work/page.tsx` | Intro + featured Proctoring card + 3-up grid (Messaging · Analytics · Eventify) + honest "only one case study shipped" footnote |
| `/work/proctoring-system` | `src/app/work/proctoring-system/page.tsx` | Cinematic case study: CaseHero → NarrativeReveal → ArchitectureSection → CollapseMoment → CodeReveal → BeforeAfter → EditorialLessons (3 of 9, link to full blog) → CaseOutro |
| `/about` | `src/app/about/page.tsx` | AboutHero → Essay 01 Origin → DeskImageBand (parallax) → Essay 02 MU → Essay 03 Next → AboutSidebar (PortraitCard + skills + education + contact) → AboutOutro |
| `/now` | `src/app/now/page.tsx` | NowHeader (with "updated · DATE" chip) → 3 NowBlocks (Reading · Building · Curious about) → NowOutro |
| `/blog` | `src/app/blog/page.tsx` | Notes index — featured proctoring card linking to GitHub Pages + footnote |
| `/contact` | `src/app/contact/page.tsx` | ContactHero → 2-col layout: ContactForm (real Resend submission) + ContactSidebar (direct email, LinkedIn, GitHub, LeetCode, response-time line) |
| `/api/contact` | `src/app/api/contact/route.ts` | **Dynamic.** POST handler — validates fields, sends via Resend, returns JSON. Only dynamic route in the project. |

**Nav order** (set in `src/components/shell/nav.tsx`): WORK · ABOUT · NOW · NOTES · CONTACT

---

## 6. Component Inventory

```
src/components/
├── shell/                    ← global layout chrome
│   ├── nav.tsx               5-item sticky nav, signal-orange active state
│   ├── footer.tsx            Mono signature + social links
│   └── placeholder.tsx       Dev-time stand-in (no longer used in any route)
│
├── hero/                     ← / hero
│   ├── hero.tsx              Split layout: text left, portrait right, scrubbed scroll-out
│   ├── portrait-panel.tsx    Halftone portrait card — inner-card pattern with feathers
│   ├── signal-trace.tsx      Animated SVG oscilloscope line (bottom band, hidden on mobile)
│   ├── scroll-indicator.tsx  Pulsing vertical line — bottom-left
│   └── text-scramble.tsx     UNUSED — kept for possible reuse on a case-study moment
│
├── manifesto/                ← / scrub-pinned sequence
│   ├── manifesto-scroll.tsx  Master timeline + Sentence / Moment / Grid / CTA layers
│   ├── manifesto-data.ts     All copy + RANGES (timeline positions) + PIN_VH
│   └── signal-strip.tsx      UNUSED divider — kept for possible future use
│
├── motion/                   ← reusable scroll primitives
│   ├── pinned-section.tsx    Generic pinned scrub wrapper
│   ├── horizontal-scroll.tsx Generic vertical→horizontal converter
│   ├── parallax-layer.tsx    Speed-multiplier translate
│   └── index.ts              Barrel
│
├── work/                     ← /work showcase
│   ├── project-card.tsx      Featured / regular variants with hover lift
│   ├── project-visual.tsx    Resolves project.id → visual component
│   └── visuals/
│       ├── code-frame.tsx       Editor chrome + Kw/Cm/Str/Fn/Dim token helpers
│       ├── code-messaging.tsx   SQL keyset cursor query
│       ├── code-eventify.tsx    Stripe webhook signature verification snippet
│       ├── arch-proctoring.tsx  SFU topology SVG, signal-orange critical path
│       └── arch-analytics.tsx   Lambda → ClickHouse pipeline SVG, traveling dot
│
├── case-study/               ← /work/proctoring-system sections
│   ├── case-hero.tsx
│   ├── narrative-reveal.tsx  Pinned paragraph fade-in (italic opener)
│   ├── architecture-section.tsx  Reuses arch-proctoring at large size + annotations
│   ├── collapse-moment.tsx   The 5-user CPU climb cinematic
│   ├── code-reveal.tsx       2 snippets pinned + revealed on scroll
│   ├── before-after.tsx      Parallax 2-column metric comparison
│   ├── editorial-lessons.tsx Editorial 3-lesson teasers + "rest in the blog" link
│   └── case-outro.tsx        Blog CTA + next case study placeholder
│
├── about/                    ← /about sections
│   ├── about-hero.tsx        Editorial opening
│   ├── essay-block.tsx       Reusable section: eyebrow + title + paragraphs
│   ├── desk-image-band.tsx   Parallax full-bleed using desk-night.png
│   ├── portrait-card.tsx     Small framed halftone for sidebar
│   ├── about-sidebar.tsx     Portrait + skills + education + contact
│   └── about-outro.tsx       Closing italic line + dual CTA
│
├── now/                      ← /now sections
│   ├── now-header.tsx        Intro with "updated · DATE" chip
│   ├── now-block.tsx         Reading / Building / Curious about block
│   └── now-outro.tsx         Same shape as AboutOutro for consistency
│
├── notes/                    ← /blog index
│   └── note-card.tsx         Featured + regular sizes; external ↗ vs internal →
│
└── contact/                  ← /contact sections
    ├── contact-hero.tsx      "Building something real-time? Let's talk."
    ├── contact-form.tsx      Real Resend submission with full state machine
    └── contact-sidebar.tsx   Direct email + channels + response-time line
```

---

## 7. Content Conventions

### DRAFT pattern (`src/lib/about-content.ts`, `src/lib/now-content.ts`)

Any string starting with `DRAFT · ` is **seed copy I wrote for Shashank to
edit**. The UI renders it in muted color and shows a small *Draft* chip next
to the section so it's obvious what hasn't been approved.

**Approving a line**: strip the `DRAFT · ` prefix. Chip vanishes, color returns
to normal. No other change needed.

Helpers in each file: `isDraft(value)` / `stripDraft(value)`.

### TODO pattern (`src/lib/proctoring-case-study.ts`)

Same idea but for case study slots — strings starting with `TODO` indicate
unfilled blog excerpts. Currently the file is filled with synthesized teaser
copy (intentional editorial restraint: the full piece lives on GitHub Pages).

Helper: `isTodo(value)`.

### Single source of truth for content

| Where copy lives | What |
|---|---|
| `src/lib/person.ts` | Name, email, phone, social URLs, blog URL. Change once, propagates. |
| `src/lib/about-content.ts` | All `/about` prose + facts (skills, education, contact). |
| `src/lib/now-content.ts` | All `/now` prose. Update the `updatedAt` string whenever you change anything else. |
| `src/lib/notes-content.ts` | `Note[]` array. Adding a note = appending one object. |
| `src/lib/proctoring-case-study.ts` | Case study content (narrative anchor, architecture annotations, code snippets, lessons, outro). |
| `src/lib/work-data.ts` | Project metadata for `/work` (id, slug, title, tagline, blurb, stack, metrics, visualKind, caseStudy flag, variant). |
| `src/components/manifesto/manifesto-data.ts` | Manifesto sentences, centerpiece, domain cycle, grid, CTA, RANGES, PIN_VH. |

**Never** hardcode strings in component files. Always import from the matching
content file.

---

## 8. Setup & Environment

### Local dev

```bash
cd portfolio-v2
npm install
npm run dev          # http://localhost:3000 (or 3001 if 3000 is taken)
```

### Required env var

For the contact form to actually send mail:

```bash
# .env.local  (gitignored; see .env.local.example)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**One-time Resend setup**:

1. Sign up at https://resend.com (free tier: 100/day, 3,000/month)
2. Create API key in dashboard
3. Paste into `.env.local`
4. Restart dev server
5. (Optional, later) verify a sending domain to upgrade FROM address —
   then set `CONTACT_FROM_ADDRESS="Shashank Dhiman <hello@yourdomain.com>"`

**Without the env var**: the form gracefully fails with a visible error
message + a fallback "Email directly ↗" link. Visitors never get stuck.

### Required image assets

Drop these into `public/` for the page to render as designed. Falls back
gracefully when missing.

| Path | Used by | Status |
|---|---|---|
| `public/hero/portrait-halftone.png` | Hero + About PortraitCard | ✅ shipped |
| `public/about/desk-night.png` | About DeskImageBand | ✅ shipped |
| `public/atmosphere/signal-trace.png` | Reserved for future atmospheric strips | ✅ shipped (currently unused) |

---

## 9. Critical Files — where to make common changes

| You want to... | Edit |
|---|---|
| Change the headline | `src/components/hero/hero.tsx` — line ~121 (`{person.name}.`) and tagline below |
| Change colors | `src/app/globals.css` — `:root` block at top |
| Add a project to /work | `src/lib/work-data.ts` (data) + `src/components/work/project-visual.tsx` (visual mapping) |
| Add a project visual | Drop SVG/code-snippet component in `src/components/work/visuals/`, then wire in `project-visual.tsx` |
| Edit manifesto pacing | `src/components/manifesto/manifesto-data.ts` — `RANGES` and `PIN_VH` |
| Edit about essays | `src/lib/about-content.ts` |
| Update /now (do this quarterly) | `src/lib/now-content.ts` — strip `DRAFT · ` prefixes on first edit; update `nowHeader.updatedAt` |
| Add a blog/note entry | Append to `notes` array in `src/lib/notes-content.ts` |
| Change a social URL | `src/lib/person.ts` — single source of truth |
| Adjust hero portrait treatment | `src/components/hero/portrait-panel.tsx` — gradient overlays, feather sizes, signal-orange wash |

---

## 10. Known Gotchas

### Lenis ↔ GSAP integration

`src/lib/motion/lenis-provider.tsx` wires Lenis's scroll event into
`ScrollTrigger.update()` and uses `gsap.ticker` as the single RAF clock for
the whole app. If you ever see jittery pins, check that integration first.

Respects `prefers-reduced-motion` — skips Lenis entirely in that case,
falls back to native scroll (ScrollTrigger still works on native).

### Italic Fraunces overflow

See §4 (Design System → Italic Fraunces). The manifesto SentenceLayer was
the lesson: `overflow: hidden` on a word-wrapper clips italic descenders.
Opacity-driven reveal is the safe pattern.

### Workspace lockfile warning

`create-next-app` may detect multiple lockfiles and warn about workspace root.
Already configured in `next.config.ts` if you see this come back.

### `useGSAP` scope

Always pass a `scope` ref to `useGSAP` — the hook auto-cleans tweens scoped
to that DOM node. Without it, tweens persist on hot reload and stack.

### Refs as plain props (React 19)

React 19 lets us pass `ref` as a regular prop on function components without
`forwardRef`. The codebase uses this pattern extensively (e.g.
`<MomentLayer ref={centerRef} ... />`). Don't refactor back to `forwardRef`.

### `<img>` instead of `<Image>` for halftone / desk shots

The portrait + desk-night images use raw `<img>` not `next/image` — for two
reasons:

1. `next/image` with a static path requires the file present at build time;
   raw `<img>` degrades gracefully via `onError` handlers (which the
   components rely on for fallback panels).
2. These images carry their own treatment stack (blend modes, filters) that
   needs the raw element.

ESLint disabled per-line for these instances. **Don't** auto-fix to `<Image>`.

---

## 11. Editorial Voice Rules

Burned phrases (do not reintroduce):

- "Systems thinking · Measurement first · Production discipline" (philosophy cards)
- "Interview Talking Points"
- Anything that includes "energized by problems" or "passionate about"
- Rotating tagline words like "production / edge cases / adversarial load"
- "Designed by an AI" tells in general — buzzword pile-ups, em-dash overuse
  in body copy, three-word triplet rhythm

Voice baseline:

- Short declarative sentences
- Specific over abstract (real metrics over vague "scale")
- First-person where personal, third-person where technical
- Italic Fraunces for emotional weight (use sparingly)
- Mono caps for metadata / labels only
- No exclamation marks
- "I" not "we" (this is one person's portfolio)

---

## 12. Decision Log

Major calls made during build — flagged here so future-you doesn't undo them
without thinking:

### Hero is split editorial (text + halftone), not video

Considered an AI-generated Higgsfield video. Rejected because:
- Static editorial composition + breathing scale = same premium feel, fraction
  of the bandwidth + battery
- Video on hero competes with text overlay
- Halftone treatment is more distinctive than generic cinematic portrait video

**If revisiting**: video can be added as a one-shot reveal on first visit only
(in Phase 9 / Polish), but the always-on visual stays static.

### Headline is name-led (Option A), not metric-led

Original tagline ("They fail in ways you only see at 200 concurrent users")
anchored Shashank's identity to one job's metric. Replaced with:

> Shashank Dhiman.
> Backend engineer working on real-time systems built to survive production.

Range over depth, identity over project.

### Manifesto reframed from metrics-spine to breadth-spine

Original manifesto cycled 4 Masters' Union percentages. Now cycles "1 year ·
shipped" + 3 domain words (WebRTC · Real-time chat · Event analytics) and
settles into a 2×2 grid including the Eventify (Stripe/Auth) work. Tells a
breadth story, not an employer story.

### Proctoring case study is a TEASER, not a re-publication

The full 24-min piece lives on GitHub Pages. The `/work/proctoring-system`
page hosts a few iconic anchors (the "particular kind of failure" line, the
collapse moment, real numbers, 3 lesson titles) and pushes hard to the full
blog. Don't expand it into a duplicate.

### Project cards = hand-built SVG, never AI photos

AI image generation produces stock-photo-tier "fiber optics with bokeh" or
hallucinated nonsense. Backend work doesn't photograph; it *diagrams*.
Architecture SVGs + code snippets are the visual identity. This is also
coherent with the signal-trace aesthetic.

### Contact form uses Resend, not mailto

`mailto:` opens an external mail client which most visitors don't have
configured. Resend API route gives true direct submission. The mailto fallback
remains visible in the sidebar (display email) for anyone who'd rather use
their own client.

### `/blog` is an index, not a CMS

Long-form lives on GitHub Pages. The `/blog` page on this site is a curated
linked index. Adding a future note = one object in `notes-content.ts`. No
MDX, no headless CMS, no DB. Revisit only when there are 3+ pieces.

### No `/resume` route

The previous portfolio had a `/resume` page that duplicated the DOCX. Nobody
visits it. A download link in the footer is enough (add when needed).

---

## 13. What's Pending / Future Enhancement

### Phase 8 — Polish layer (deferred)

- Custom cursor (subtle dot, hover-grow)
- Page transitions (shared element / layoutId between cards and case studies)
- Loading sequence (600ms branded splash on first visit only)
- Mobile pass for scrollytelling sections (each pinned section needs a vertical-stack variant)
- Accessibility audit + reduced-motion verification across every page
- Lighthouse perf pass (target ≥90 desktop, ≥75 mobile)

### Phase 9 — Optional 3D accent (deferred indefinitely)

Plan said only ship if Phases 0–7 already feel premium without it. They do.
Add only if there's a moment that genuinely needs it (e.g. the proctoring
architecture in 3D, IF the 2D SVG plateaus). Default: skip.

### Home page additions (proposed, not built)

User asked about more home content. Three options on the table:

- **Now Strip** — thin band after Manifesto, single-line synthesis of /now content + link
- **Featured Note Teaser** — proctoring blog card surfaced on home
- **Contact Strip** — closing italic line + email CTA before footer

Recommendation was **A + C** (Now Strip + Contact Strip) for forward momentum
+ deliberate ending. Awaiting explicit go.

### Content gaps to fill

- All `DRAFT · ` lines in `src/lib/about-content.ts` and `src/lib/now-content.ts`
  need a Shashank pass — strip the prefix when approved, rewrite when not
- `nowHeader.updatedAt` is currently `"DRAFT · May 2026"` — update to real
  current month on first edit
- Resume DOCX (`Shashank_Resume_v2.docx` on Desktop) is current but the
  on-site copy isn't yet exposed (intentional — see decision log)

### Verification commands

```bash
npm run build       # full type check + static generation; should be 0 errors
npm run dev         # runs on 3000 or auto-picks 3001
```

After any meaningful change, build at least once. Most regressions surface
there (TypeScript narrowing, prerender failures, missing imports).

---

## 14. Quick Reference — Conventions Summary

| | |
|---|---|
| **Class merging** | Always `cn(...)` from `lib/utils.ts`; never raw concatenation |
| **Content** | Always import from `lib/*-content.ts` or `lib/person.ts`; never inline |
| **Italic text** | `letterSpacing: 0`, `wordSpacing` 0.04–0.18em, line-height ≥ 1.15, never `overflow: hidden` on the wrapper |
| **Motion** | Always check `prefers-reduced-motion`; always pass `scope` to `useGSAP` |
| **Refs** | Plain props (React 19), not `forwardRef` |
| **Images** | `<img>` (not `next/image`) for halftone/desk shots with treatment stacks; `<Image>` is fine for vanilla future images |
| **Type sizes** | `clamp(min, vw, max)` inline for fluid scaling, not Tailwind size utilities for display text |
| **Color usage** | Signal orange is punctuation, not canvas. Ink for text, paper for backgrounds, void only in code frames |
| **Comments** | Heavy in component files explaining the "why" — this is part of the codebase's voice |

---

*Last meaningful update: end of build session that landed Phases 0–7, the
case-study restraint pass, the italic glyph fix, the real Resend contact
submission, and the PortraitCard on /about.*
