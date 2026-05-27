"use client";

import { CodeFrame, Kw, Cm, Dim } from "./code-frame";

/**
 * <CodeMessaging>
 *
 * The keyset cursor pagination query at the heart of the messaging refactor.
 * One snippet, one idea — the WHERE clause comparison on the indexed
 * (conversation_id, created_at) tuple is what turned an O(n) scan into
 * an O(log n) seek.
 */
export function CodeMessaging({ className }: { className?: string }) {
  return (
    <CodeFrame filename="messages.sql" language="postgres" className={className}>
      <Cm>{`-- Keyset cursor pagination · index seek, not table scan`}</Cm>
      {"\n"}
      <Kw>SELECT</Kw> m.*, u.name, u.avatar{"\n"}
      <Kw>FROM</Kw> messages m{"\n"}
      <Kw>JOIN</Kw>   users u <Kw>ON</Kw> u.id = m.sender_id{"\n"}
      <Kw>WHERE</Kw>  m.conversation_id = <Dim>$1</Dim>{"\n"}
      {"  "}<Kw>AND</Kw>  m.created_at &lt; <Dim>$2</Dim>{"   "}<Cm>{`-- cursor: last seen ts`}</Cm>{"\n"}
      <Kw>ORDER BY</Kw> m.created_at <Kw>DESC</Kw>{"\n"}
      <Kw>LIMIT</Kw> <Dim>$3</Dim>;
    </CodeFrame>
  );
}
