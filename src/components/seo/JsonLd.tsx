/**
 * Inline JSON-LD in the initial HTML (Server Component).
 * Prefer this over next/script so crawlers/agents see structured data without waiting on script loading.
 */
export function JsonLd({ id, data }: { id: string; data: unknown }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
