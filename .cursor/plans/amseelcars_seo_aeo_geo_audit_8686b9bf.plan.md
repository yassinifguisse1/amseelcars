---
name: AmseelCars SEO/AEO/GEO audit
overview: Audit and upgrade your Next.js rental car site for Morocco/Agadir search visibility and higher booking conversion, focusing first on crawl/indexation + canonicals, then schema/AEO content, then performance and CRO tracking.
todos:
  - id: p0-canonicals
    content: Fix canonical/alternates for dynamic routes (cars detail) and ensure www is consistent across metadata, robots, sitemaps.
    status: in_progress
  - id: p0-robots-sitemaps
    content: Make robots source-of-truth consistent (App Router robots) and verify sitemap index/child sitemaps URLs match canonical domain.
    status: pending
  - id: p1-metadata-pages
    content: Add/repair metadata for About/Contact and remove sitewide noimageindex if it’s unintentionally blocking car images.
    status: pending
  - id: p1-schema-local
    content: Upgrade LocalBusiness/AutoRental schema with full NAP, geo, map, service areas (Agadir/Al Massira/Taghazout), and contact points.
    status: pending
  - id: p1-blog-indexation
    content: Make blog category pages indexable (unless intentionally noindex) and verify article schema + canonicals are correct.
    status: pending
  - id: p2-location-landing-pages
    content: Add 1–3 high-intent Agadir landing pages (FR + EN minimum) with FAQ blocks for AEO/GEO and strong internal linking to cars.
    status: pending
  - id: p2-performance-cwv
    content: Profile homepage and /cars for CWV (LCP/INP/CLS) and implement the highest-impact optimizations.
    status: pending
  - id: p2-cro-funnel
    content: Define/implement a simple booking funnel measurement (CTA click → booking submit → confirmation) and adjust CTAs/copy to improve conversion.
    status: pending
isProject: false
---

# AmseelCars SEO/AEO/GEO audit plan

## What I found (repo audit, high-signal)

- **Framework**: Next.js 15 App Router (`next.config.ts`, `src/app/`*).
- **Sitemaps exist**: index at `src/app/sitemap.xml/route.ts`, and two child sitemaps (`src/app/sitemap-pages.xml/route.ts`, `src/app/sitemap-blog.xml/route.ts`).
- **Robots is duplicated**: `public/robots.txt` points to `https://amseelcars.com/sitemap.xml` while `src/app/robots.ts` points to `https://www.amseelcars.com/sitemap.xml`. In App Router, `src/app/robots.ts` is the authoritative `/robots.txt`.
- **Canonical risk (big)**: `src/app/layout.tsx` sets a sitewide canonical to `/`. Several dynamic pages (notably car detail) return metadata without `alternates.canonical`, so they likely inherit `/` as canonical and can be treated as duplicates.
- **Images in Google**: `src/app/layout.tsx` adds `<meta name="robots" content="noimageindex" />` sitewide. This can suppress image indexing (often a negative for car pages that rely on attractive photos in SERP/Discover).
- **Blog category pages are noindex**: `src/app/blog/[category]/page.tsx` sets `robots.index: false` even though these pages are useful for internal linking and discovery.
- **LocalBusiness schema exists but is weak**: `generateLocalBusinessSchema()` in `src/lib/schemas.ts` uses `streetAddress: 'Agadir'` (too generic) and lacks key local trust fields (geo, full address, map, contact points, priceRange, etc.).
- **Commercial intent pages**: `/cars` has metadata + breadcrumb schema, and car detail pages inject Product + FAQ schema. Good foundation; we’ll tighten canonicals, indexation, and content intent.

## Goals (Morocco/Agadir + foreign + Moroccan)

- **Rank** for intent queries (FR/EN/AR): “location voiture agadir”, “car rental agadir”, “agadir airport car hire”, “taghazout car rental”, “rent a car morocco agadir”, etc.
- **Get picked by AI answers** (AEO/GEO): clear service-area statements, FAQs, structured data, strong “entity” signals.
- **Increase bookings**: reduce friction to WhatsApp/booking form, improve trust signals (reviews, policies, pickup locations), and ensure tracking.

## Phase 1 (P0) — Crawl/indexation/canonical correctness

- **Unify canonical domain**: since `amseelcars.com` redirects to `www.amseelcars.com`, enforce `www` consistently in:
  - `src/app/robots.ts`
  - `src/app/sitemap*.xml/route.ts`
  - `metadataBase` in `src/app/layout.tsx` (already `www`)
  - add a server-side redirect for non-`www` → `www` (best done in `next.config.ts` redirects or middleware without breaking Clerk).
- **Fix canonicals per page**:
  - `src/app/cars/[slug]/page.tsx`: set `alternates.canonical` to the real slug URL (`/cars/${slug}`) inside `generateMetadata`.
  - audit other dynamic routes similarly (blog article/category already set canonicals; confirm homepage/contact/about).
- **Robots consistency**:
  - remove/ignore `public/robots.txt` or align it (App Router robots should be source of truth).
  - review noindex coverage for admin/auth pages (ensure `/admin`, `/sign-in`, etc. are `noindex`).

## Phase 2 (P1) — On-page SEO that maps to Agadir intent

- **Metadata quality**:
  - add proper `export const metadata` to `src/app/about/page.tsx` and `src/app/contact/page.tsx`.
  - reduce keyword repetition in `src/app/layout.tsx` keywords array (duplicates dilute signal; we’ll keep a smaller, tighter set).
- **Information architecture**:
  - add 1–3 dedicated location/intent landing pages (server-rendered, indexable) such as:
    - `/agadir-airport-car-rental`
    - `/taghazout-car-rental`
    - `/car-rental-agadir` (if needed)
  - each page: unique H1, strong intro, FAQs, internal links to `/cars` and top cars.

## Phase 3 (P1) — Schema upgrades (SEO + AEO + GEO)

- **Strengthen LocalBusiness/AutoRental entity** in `src/lib/schemas.ts`:
  - full NAP (real street address), `geo` (lat/lng), `hasMap` (Google Maps URL), `priceRange`, `paymentAccepted`, `currenciesAccepted`, richer `openingHoursSpecification`, `areaServed` with Agadir + airport + Taghazout.
  - `contactPoint` for WhatsApp/phone.
- **Car pages**: keep Product + FAQ schema, but ensure Offer fields are accurate (availability, price currency, URL).
- **Blog**:
  - turn **category pages indexable** (`src/app/blog/[category]/page.tsx` robots index true) unless you intentionally want them hidden.

## Phase 4 (P2) — Performance & CWV (ranking + conversion)

- Run a focused pass on **LCP/INP/CLS** for homepage and `/cars` (these are heavy pages).
- Typical fixes in this stack: reduce above-the-fold JS, defer animation libs on first paint, optimize hero media, ensure images use Next `<Image>` and correct sizing.

## Phase 5 (P2) — Conversion/CRO (turn traffic into bookings)

- Ensure primary CTAs are consistent and trackable (WhatsApp + “Book now”).
- Confirm the booking form has trust microcopy (pickup at airport/city, insurance clarity, no hidden fees) and localized language.
- Align event tracking (you already have `/api/track/whatsapp`) with a simple funnel report (click → booking submit → confirmed).

## Measurement checklist (so we can prove wins)

- In Search Console: submit `https://www.amseelcars.com/sitemap.xml`, monitor Coverage, CWV, and query growth for Agadir terms.
- Track: WhatsApp clicks + booking submit rate by landing page.

