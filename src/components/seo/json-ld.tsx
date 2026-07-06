/**
 * <JsonLd> — renders a schema.org object as an application/ld+json script.
 * Server component; zero client JS. Data comes from src/lib/seo.ts builders.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
