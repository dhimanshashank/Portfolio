/**
 * <ContactHero>
 *
 * One sentence, full-viewport-ish. Same editorial register as the rest of
 * the site — name-led pages get name-led greetings; this page gets a question.
 */
export function ContactHero() {
  return (
    <section className="container-wide pt-24 pb-12 md:pt-32 md:pb-16">
      <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
        <span aria-hidden>▍</span> Contact
      </p>

      <h1
        className="font-display text-ink"
        style={{
          fontSize: "clamp(40px, 6.2vw, 88px)",
          lineHeight: 1.05,
          letterSpacing: "-0.035em",
          fontWeight: 400,
          maxWidth: "20ch",
        }}
      >
        Building something real-time?
        <br />
        <span className="italic text-ink-2" style={{ letterSpacing: 0, wordSpacing: "0.04em" }}>
          Let&apos;s talk.
        </span>
      </h1>

      <p
        className="mt-6 text-ink-2"
        style={{
          fontSize: "clamp(16px, 1.5vw, 19px)",
          lineHeight: 1.55,
          maxWidth: "52ch",
        }}
      >
        Reach out about backend roles, real-time systems work, or anything in
        the proctoring / WebRTC / streaming space. I read every message.
      </p>
    </section>
  );
}
