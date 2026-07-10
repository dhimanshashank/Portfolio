/**
 * Terminal command registry — the portfolio as a REPL.
 *
 * Data-driven: everything a command prints is sourced from person.ts and
 * work-data.ts, never hardcoded prose. Adding a command = one object here.
 * Kept honest (a real REPL, not a fake dashboard) per CONTEXT.md.
 */

import { person } from "@/lib/person";
import { projects, type WorkProject } from "@/lib/work-data";

export type Tone = "normal" | "muted" | "signal" | "success" | "error";

export type ListItem = {
  label: string;
  value?: string;
  href?: string;
  external?: boolean;
};

export type CommandResultLine =
  | { kind: "text"; text: string; tone?: Tone }
  | { kind: "link"; label: string; href: string; external?: boolean }
  | { kind: "list"; items: ListItem[] }
  | { kind: "spacer" };

export type CommandContext = {
  args: string[];
  raw: string;
  navigate: (href: string) => void; // curtain-aware internal nav
  openExternal: (href: string) => void; // new tab / mailto
  clear: () => void;
  print: (lines: CommandResultLine[]) => void;
  registry: Command[];
  /** Current working "directory": a project id, or null at ~ (root). */
  cwd: string | null;
  setCwd: (id: string | null) => void;
};

/** Help sections — rendered in this order by `help`. */
export type CommandGroup = "navigate" | "explore" | "connect" | "system";

export type Command = {
  name: string;
  aliases?: string[];
  summary: string;
  usage?: string;
  /** Which `help` section this belongs to. Hidden commands don't need one. */
  group?: CommandGroup;
  hidden?: boolean; // easter eggs / shorthands not listed by `help`
  complete?: (ctx: { args: string[] }) => string[];
  run: (ctx: CommandContext) => void | Promise<void>;
};

// Friendly section names → routes.
const ROUTES: Record<string, string> = {
  home: "/",
  work: "/work",
  about: "/about",
  log: "/log",
  writing: "/log",
  notes: "/log",
  contact: "/contact",
  proctoring: "/work/proctoring-system",
  "proctoring-system": "/work/proctoring-system",
  messaging: "/work/messaging-system",
  "messaging-system": "/work/messaging-system",
};

const CAT_FILES = ["about", "resume", "work", "contact"];

const t = (text: string, tone?: Tone): CommandResultLine => ({
  kind: "text",
  text,
  tone,
});

/** Resolve a `cd` argument (num, id, or slug) to a project. */
export function findProject(arg: string): WorkProject | undefined {
  const a = arg.toLowerCase();
  return projects.find((p) => p.num === a || p.id === a || p.slug === a);
}

/** Path shown in the prompt for a given cwd (project id or null). */
export function cwdPath(cwd: string | null): string {
  if (!cwd) return "~";
  const p = projects.find((x) => x.id === cwd);
  return p ? `~/work/${p.num}` : "~";
}

/** A short, Linux-flavoured "readme" for one project dir. */
function projectReadme(p: WorkProject): CommandResultLine[] {
  const lines: CommandResultLine[] = [
    t(`${p.num} · ${p.title}`, "signal"),
    t(`${p.tagline}`, "muted"),
    { kind: "spacer" },
    t(p.blurb),
    { kind: "spacer" },
    t(`stack     ${p.stack.join(" · ")}`, "muted"),
    t(
      `metrics   ${p.metrics
        .map((m) => `${m.value} ${m.label}`)
        .join("   ·   ")}`,
      "muted"
    ),
  ];
  if (p.context) lines.push(t(`shipped   ${p.context}`, "muted"));
  lines.push({ kind: "spacer" });

  const actions: ListItem[] = [];
  if (p.caseStudy) {
    actions.push({
      label: `open ${p.id}`,
      value: "read the case study",
      href: `/work/${p.slug}`,
    });
  } else {
    actions.push({
      label: "open work",
      value: "deep-dive coming soon",
      href: "/work",
    });
  }
  if (p.liveUrl) {
    actions.push({
      label: "demo",
      value: "live deploy",
      href: p.liveUrl,
      external: true,
    });
  }
  lines.push({ kind: "list", items: actions });
  return lines;
}

export const commands: Command[] = [
  {
    name: "help",
    aliases: ["?", "commands"],
    summary: "this screen",
    group: "system",
    run: ({ print, registry }) => {
      const sections: { key: CommandGroup; label: string }[] = [
        { key: "navigate", label: "navigate" },
        { key: "explore", label: "explore" },
        { key: "connect", label: "connect" },
        { key: "system", label: "system" },
      ];

      const lines: CommandResultLine[] = [];
      for (const s of sections) {
        const cmds = registry.filter((c) => !c.hidden && c.group === s.key);
        if (!cmds.length) continue;
        lines.push(t(s.label, "signal"));
        lines.push({
          kind: "list",
          items: cmds.map((c) => ({ label: c.name, value: c.summary })),
        });
        lines.push({ kind: "spacer" });
      }

      lines.push(
        t("keys   tab → autocomplete · ↑ ↓ → history · esc → close", "muted"),
        t("try    cd 01 · cat resume · sudo hire-me", "muted")
      );
      print(lines);
    },
  },
  {
    name: "whoami",
    aliases: ["me"],
    summary: "who is this",
    group: "explore",
    run: ({ print }) =>
      print([
        t(person.name),
        t(person.roleLong, "muted"),
        t(`${person.location} · ${person.locationDetail}`, "muted"),
      ]),
  },
  {
    name: "about",
    summary: "read the story",
    group: "navigate",
    run: ({ navigate }) => navigate("/about"),
  },
  {
    name: "work",
    aliases: ["ls", "projects"],
    summary: "list selected work",
    usage: "ls [work]",
    group: "navigate",
    complete: ({ args }) => ["work"].filter((x) => x.startsWith(args[0] ?? "")),
    run: ({ print }) =>
      print([
        {
          kind: "list",
          items: projects.map((p) => ({
            label: `${p.num}  ${p.title}`,
            value: p.tagline,
            href: p.caseStudy ? `/work/${p.slug}` : "/work",
          })),
        },
        { kind: "spacer" },
        t("peek →  cd 01     ·     open →  open proctoring", "muted"),
      ]),
  },
  {
    name: "cd",
    summary: "enter a project dir — cd 01",
    usage: "cd <01|02|03|04|proctoring|messaging|…>",
    group: "navigate",
    complete: ({ args }) => {
      const frag = (args[0] ?? "").toLowerCase();
      // Directory "names" are the project numbers (01, 02, …) plus `..` to go
      // home — one token each so tab-completion stays clean and idempotent.
      // ids/slugs still resolve when run; they're just not offered as tokens.
      return [...projects.map((p) => p.num), ".."].filter((c) =>
        c.startsWith(frag)
      );
    },
    run: ({ args, print, setCwd }) => {
      const arg = (args[0] ?? "").toLowerCase();

      // Any "go home" form → root, list the project dirs.
      if (!arg || arg === "~" || arg === "/" || arg === ".." || arg === "work") {
        setCwd(null);
        return print([
          t("~/work", "muted"),
          {
            kind: "list",
            items: projects.map((p) => ({
              label: `${p.num}  ${p.title}`,
              value: p.tagline,
            })),
          },
          { kind: "spacer" },
          t("enter one →  cd 01", "muted"),
        ]);
      }

      const p = findProject(arg);
      if (!p) {
        return print([
          t(`cd: no such file or directory: ${arg}`, "error"),
        ]);
      }
      setCwd(p.id);
      print(projectReadme(p));
    },
  },
  {
    name: "pwd",
    summary: "print working directory",
    hidden: true,
    run: ({ print, cwd }) => print([t(cwdPath(cwd), "muted")]),
  },
  {
    name: "open",
    aliases: ["goto"],
    summary: "navigate to a section",
    usage: "open <home|work|about|log|contact|proctoring|messaging>",
    group: "navigate",
    complete: ({ args }) =>
      Object.keys(ROUTES).filter((k) => k.startsWith((args[0] ?? "").toLowerCase())),
    run: ({ args, navigate, print, cwd }) => {
      const arg = args[0] ?? "";
      // Bare `open` inside a project dir → open that project.
      if (!arg && cwd) {
        const p = projects.find((x) => x.id === cwd);
        if (p) return navigate(p.caseStudy ? `/work/${p.slug}` : "/work");
      }
      if (arg.startsWith("/")) return navigate(arg);
      const route = ROUTES[arg.toLowerCase()];
      if (!route)
        return print([
          t(`no such section: ${arg || "(none)"} — try 'help'`, "error"),
        ]);
      navigate(route);
    },
  },
  {
    name: "cat",
    summary: "read a pseudo-file",
    usage: "cat <about|resume|work|contact>",
    group: "explore",
    complete: ({ args }) => CAT_FILES.filter((x) => x.startsWith(args[0] ?? "")),
    run: ({ args, openExternal, print }) => {
      const file = (args[0] ?? "").toLowerCase();

      if (!file) {
        return print([
          t("cat reads small portfolio files inside this terminal.", "muted"),
          t("available files:", "muted"),
          {
            kind: "list",
            items: CAT_FILES.map((name) => ({
              label: name,
              value: `cat ${name}`,
            })),
          },
        ]);
      }

      if (file === "about") {
        return print([
          t(person.name, "signal"),
          t(person.roleLong),
          t(`${person.location} · ${person.locationDetail}`, "muted"),
        ]);
      }

      if (file === "work") {
        return print([
          t("selected work", "signal"),
          {
            kind: "list",
            items: projects.map((p) => ({
              label: p.title,
              value: p.tagline,
              href: p.caseStudy ? `/work/${p.slug}` : "/work",
            })),
          },
        ]);
      }

      if (file === "contact") {
        return print([
          t("contact", "signal"),
          { kind: "link", label: person.email, href: `mailto:${person.email}`, external: true },
          { kind: "link", label: "open /contact", href: "/contact" },
        ]);
      }

      if (file === "resume") {
        print([
          t("resume.pdf is a real file, so cat opens it in a new tab.", "muted"),
          {
            kind: "link",
            label: "Shashank_Resume.pdf",
            href: "https://assets.shashankdhiman.in/Shashank_Resume.pdf",
            external: true,
          },
        ]);
        return openExternal(
          "https://assets.shashankdhiman.in/Shashank_Resume.pdf"
        );
      }

      print([t(`cat: ${file}: no such file`, "error")]);
    },
  },
  {
    name: "contact",
    summary: "get in touch",
    group: "connect",
    run: ({ print }) =>
      print([
        { kind: "link", label: person.email, href: `mailto:${person.email}`, external: true },
        { kind: "link", label: "open /contact", href: "/contact" },
      ]),
  },
  {
    name: "social",
    aliases: ["links"],
    summary: "find me elsewhere",
    group: "connect",
    run: ({ print }) =>
      print([
        {
          kind: "list",
          items: [
            { label: "github", value: person.github.handle, href: person.github.url, external: true },
            { label: "linkedin", value: "shashank-dhiman", href: person.linkedin.url, external: true },
            { label: "leetcode", value: person.leetcode.handle, href: person.leetcode.url, external: true },
          ],
        },
      ]),
  },
  { name: "gh", summary: "open GitHub", hidden: true, run: ({ openExternal }) => openExternal(person.github.url) },
  { name: "li", summary: "open LinkedIn", hidden: true, run: ({ openExternal }) => openExternal(person.linkedin.url) },
  { name: "lc", summary: "open LeetCode", hidden: true, run: ({ openExternal }) => openExternal(person.leetcode.url) },
  {
    name: "demo",
    summary: "open the live proctoring demo",
    group: "explore",
    run: ({ openExternal, print }) => {
      const p = projects.find((x) => x.id === "proctoring");
      if (p?.liveUrl) return openExternal(p.liveUrl);
      print([t("no live demo configured", "error")]);
    },
  },
  {
    name: "uptime",
    summary: "systems shipped",
    group: "explore",
    run: ({ print }) =>
      print([
        t(`${projects.length} production systems · 1+ year shipping`, "normal"),
        t("real-time · APIs · LLM integration — still running.", "muted"),
      ]),
  },
  {
    name: "clear",
    aliases: ["cls"],
    summary: "clear the screen",
    group: "system",
    run: ({ clear }) => clear(),
  },
  {
    name: "sudo",
    summary: "elevated",
    hidden: true,
    run: ({ args, print, openExternal }) => {
      if (args.join(" ").toLowerCase() === "hire-me") {
        print([
          t("[sudo] permission granted.", "signal"),
          t("opening a line to the hiring manager…", "muted"),
        ]);
        setTimeout(
          () => openExternal(`mailto:${person.email}?subject=Let's talk`),
          650
        );
        return;
      }
      print([t(`sudo: ${args.join(" ") || "usage: sudo hire-me"}`, "error")]);
    },
  },
];

/** Split input into a matched command + trailing args. */
export function resolve(input: string): { cmd?: Command; args: string[] } {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { args: [] };
  const head = parts[0].toLowerCase();
  const cmd = commands.find(
    (c) => c.name === head || c.aliases?.includes(head)
  );
  return { cmd, args: parts.slice(1) };
}

/** Tab-completion candidates for the current input. */
export function complete(input: string): string[] {
  const hasSpace = /\s/.test(input.trimStart());
  const parts = input.trim().split(/\s+/).filter(Boolean);
  if (!hasSpace) {
    const frag = (parts[0] ?? "").toLowerCase();
    return commands
      .filter((c) => !c.hidden && c.name.startsWith(frag))
      .map((c) => c.name);
  }
  const { cmd, args } = resolve(input);
  if (!cmd?.complete) return [];
  return cmd.complete({ args });
}

/**
 * Fish-style inline suggestion: the full line the ghost text proposes.
 * Priority: (1) most recent history line extending the input — repeating
 * yourself is the common case in a real shell — then (2) the first
 * completion candidate for the token being typed. Returns null when there
 * is nothing to suggest. Tab stays the explicit chooser; the ghost is a hint.
 */
export function suggest(input: string, history: string[]): string | null {
  if (!input.trim()) return null;

  const fromHistory = history.find((h) => h.startsWith(input) && h !== input);
  if (fromHistory) return fromHistory;

  const parts = input.split(/\s+/);
  const last = (parts[parts.length - 1] ?? "").toLowerCase();
  const cand = complete(input).find((c) => c.startsWith(last) && c !== last);
  if (!cand) return null;

  parts[parts.length - 1] = cand;
  const line = parts.join(" ");
  return line === input ? null : line;
}
