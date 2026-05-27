"use client";

import { CodeFrame, Kw, Cm, Str, Fn, Dim } from "./code-frame";

/**
 * <CodeEventify>
 *
 * The Stripe webhook handler — the "trust comes from the signature, not the
 * client" idea is the most defensible piece of engineering in the Eventify
 * project. Showing it on the card sets the tone: this isn't a tutorial MERN
 * project; the security boundary was thought about.
 */
export function CodeEventify({ className }: { className?: string }) {
  return (
    <CodeFrame filename="webhook.ts" language="typescript" className={className}>
      <Cm>{`// Webhook is the source of truth — client confirmation is never trusted`}</Cm>
      {"\n"}
      <Kw>const</Kw> event = stripe.webhooks.<Fn>constructEvent</Fn>({"\n"}
      {"  "}req.body,{"\n"}
      {"  "}req.headers[<Str>{`"stripe-signature"`}</Str>],{"\n"}
      {"  "}process.env.<Dim>STRIPE_WEBHOOK_SECRET</Dim>,{"\n"}
      );{"\n"}
      {"\n"}
      <Kw>if</Kw> (event.type === <Str>{`"payment_intent.succeeded"`}</Str>) {"{"}
      {"\n"}
      {"  "}<Kw>await</Kw> Order.<Fn>markPaid</Fn>(event.data.object.metadata.orderId);{"\n"}
      {"}"}
    </CodeFrame>
  );
}
