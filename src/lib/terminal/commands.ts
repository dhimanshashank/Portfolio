/**
 * Terminal command registry — the portfolio as a REPL.
 *
 * Data-driven: everything a command prints is sourced from person.ts and
 * work-data.ts, never hardcoded prose. Adding a command = one object here.
 * Kept honest (a real REPL, not a fake dashboard) per CONTEXT.md.
 */

import { person } from "@/lib/person";
import { projects } from "@/lib/work-data";

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
};

export type Command = {
  name: string;
  aliases?: string[];
  summary: string;
  usage?: string;
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

export const commands: Command[] = [
  {
    name: "help",
    aliases: ["?", "commands"],
    summary: "list what you can type",
    run: ({ print, registry }) =>
      print([
        t("commands — type one and press enter:", "muted"),
        { kind: "spacer" },
        {
          kind: "list",
          items: registry
            .filter((c) => !c.hidden)
            .map((c) => ({ label: c.name, value: c.summary })),
        },
        { kind: "spacer" },
        t("try:  whoami · ls work · open about · cat resume · gh", "muted"),
      ]),
  },
  {
    name: "whoami",
    aliases: ["me"],
    summary: "who is this",
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
    run: ({ navigate }) => navigate("/about"),
  },
  {
    name: "work",
    aliases: ["ls", "projects"],
    summary: "list selected work",
    usage: "ls [work]",
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
        t("open one →  open proctoring", "muted"),
      ]),
  },
  {
    name: "open",
    aliases: ["cd", "goto"],
    summary: "navigate to a section",
    usage: "open <home|work|about|log|contact|proctoring|messaging>",
    complete: ({ args }) =>
      Object.keys(ROUTES).filter((k) => k.startsWith((args[0] ?? "").toLowerCase())),
    run: ({ args, navigate, print }) => {
      const arg = args[0] ?? "";
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
          { kind: "link", label: "Shashank_Resume.pdf", href: "/Shashank_Resume.pdf", external: true },
        ]);
        return openExternal("/Shashank_Resume.pdf");
      }

      print([t(`cat: ${file}: no such file`, "error")]);
    },
  },
  {
    name: "contact",
    summary: "get in touch",
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
    run: ({ openExternal, print }) => {
      const p = projects.find((x) => x.id === "proctoring");
      if (p?.liveUrl) return openExternal(p.liveUrl);
      print([t("no live demo configured", "error")]);
    },
  },
  {
    name: "uptime",
    summary: "systems shipped",
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
