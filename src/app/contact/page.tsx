import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactSidebar } from "@/components/contact/contact-sidebar";

export const metadata: Metadata = {
  title: "Contact — Shashank Dhiman",
  description:
    "Get in touch. Backend roles, real-time systems work, WebRTC/proctoring, or just a conversation about scaling backends.",
};

/**
 * /contact — Phase 6 (now real, not placeholder).
 *
 * Composition:
 *   - Hero        — the question + a single supporting line
 *   - Form        — 4 fields, opens user's mail client on submit
 *   - Sidebar     — direct email, social links, what I'm open to
 *
 * No backend. No third-party form service. Mailto: prefill is the entire
 * submission path. The sidebar carries the same email in plain text so
 * anyone whose mail client misbehaves can copy-paste directly.
 */
export default function ContactPage() {
  return (
    <>
      <ContactHero />

      <section className="container-wide pb-32">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[1.4fr_1fr] md:gap-24">
          <div>
            <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
              Send a message
            </p>
            <ContactForm />
          </div>

          <ContactSidebar />
        </div>
      </section>
    </>
  );
}
