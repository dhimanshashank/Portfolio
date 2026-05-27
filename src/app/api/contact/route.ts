import { NextResponse } from "next/server";
import { Resend } from "resend";
import { person } from "@/lib/person";

/**
 * POST /api/contact
 *
 * Server-side handler for the contact form. No mail client opens — the
 * visitor's submission goes directly to Shashank's inbox via Resend.
 *
 * Setup (one-time):
 *   1. Sign up at https://resend.com (free tier: 100/day, 3,000/month)
 *   2. Create an API key
 *   3. Add to .env.local:    RESEND_API_KEY=re_xxxxxxxxxxxx
 *   4. (Optional) Verify a domain to send FROM your own address. Until then
 *      the FROM is `onboarding@resend.dev` (Resend's verified sandbox sender)
 *      and Shashank's gmail is the TO — works fine for portfolio traffic.
 *
 * Field validation runs server-side too — never trust the client.
 * The visitor's email is set as Reply-To so Shashank can reply directly.
 */

// ─── Config ───────────────────────────────────────────────────────────────
const FROM_ADDRESS =
  process.env.CONTACT_FROM_ADDRESS ?? "Portfolio Contact <onboarding@resend.dev>";

// ─── Validation ───────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function validate(input: Payload): { ok: true; data: Required<Payload> } | { ok: false; error: string } {
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const subject = (input.subject ?? "").trim();
  const message = (input.message ?? "").trim();

  if (!name) return { ok: false, error: "Name is required." };
  if (name.length > 120) return { ok: false, error: "Name is too long." };

  if (!email) return { ok: false, error: "Email is required." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Email doesn't look right." };

  if (!message) return { ok: false, error: "Message is required." };
  if (message.length < 5) return { ok: false, error: "Message is too short." };
  if (message.length > 5000) return { ok: false, error: "Message is too long." };

  if (subject.length > 200) return { ok: false, error: "Subject is too long." };

  return {
    ok: true,
    data: { name, email, subject: subject || "Portfolio contact", message },
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // 1. Read & parse the request body
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // 2. Validate fields server-side
  const result = validate(raw as Payload);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const { name, email, subject, message } = result.data;

  // 3. Bail clearly if the API key isn't configured — better than a cryptic
  //    upstream error. The form can present this as a soft failure with a
  //    fallback "email me directly" link.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Email service not configured. Please email directly at " + person.email,
      },
      { status: 503 }
    );
  }

  // 4. Send via Resend
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: person.email,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text:
        `New message from your portfolio contact form.\n\n` +
        `From:    ${name} <${email}>\n` +
        `Subject: ${subject}\n\n` +
        `--- Message ---\n\n${message}\n`,
    });

    if (error) {
      // Don't leak provider internals to the client — log server-side and
      // return a generic message. Resend's errors include things like
      // unverified-domain issues during initial setup.
      console.error("[contact] Resend error:", error);
      return NextResponse.json(
        { error: "Couldn't send right now. Please try again or email directly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please email directly." },
      { status: 500 }
    );
  }
}
