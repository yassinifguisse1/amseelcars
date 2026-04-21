# Monthly Refresh Workflow (Top AEO Pages)

Freshness helps both search engines and AI answer systems trust page answers. Run this once per month.

## Scope

- `/[locale]/cars`
- `/[locale]/agadir-airport-car-rental`
- `/[locale]/location-voiture-agadir`
- `/[locale]/taghazout-car-rental`
- `/[locale]/cars/brand/[brandSlug]` (top 3 brands by traffic)
- `/[locale]/cars/brand/[brandSlug]/[carSlug]` (top 10 models by traffic)
- `/[locale]/blog` + top category pages

## Monthly Checklist

1. **Pricing and stock**
   - Verify daily rates and availability statements against current fleet.
   - Update any outdated "starting from" values.
2. **Answer block freshness**
   - Re-read "Quick answer" and "Key facts" sections.
   - Ensure each answer still matches current operations (pickup rules, timing, WhatsApp flow).
3. **Schema validation**
   - Validate JSON-LD output for Service, FAQPage, BreadcrumbList, Product/Car, and CollectionPage.
   - Fix missing fields or mismatched URLs immediately.
4. **Internal links**
   - Confirm each money page links to at least 2 related high-intent pages.
   - Confirm FR and EN alternates point to equivalent pages.
5. **Content quality**
   - Refresh one paragraph and one FAQ answer on top 5 pages (small but real updates).
   - Update one blog post per top category with current examples.
6. **Performance and indexability**
   - Re-check page title/meta description, canonical, and robots rules.
   - Check Core Web Vitals for top pages and log regressions.

## Output Artifact (per month)

Create one markdown log in `docs/aeo/monthly-reports/YYYY-MM.md` with:

- Pages reviewed
- What changed
- Schema validation status
- Open issues for next sprint

## Owners

- Content: SEO/editorial owner
- Technical schema and links: frontend owner
- Sign-off: growth/marketing owner
