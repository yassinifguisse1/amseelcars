"use client";
/*
 * SEO note: All copy below is real DOM text (<h2>, <p>, <li>, etc.). Googlebot executes
 * JavaScript and indexes this content like normal HTML. Opacity/scroll on a wrapper does
 * not remove text from the HTML source — avoid replacing body copy with images-only text.
 */

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Script from "next/script";
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, type MotionValue } from "framer-motion";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { generateFAQSchema } from "@/lib/faqSchema";
import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: string };

/* =============================================================================
   SEO BLOCK: Trust bar (after hero, before BMW/Kia showcase)
   ============================================================================= */
export function HomeSeoTrustBar() {
  const t = useTranslations("home.trustBar");
  const items = t.raw("items") as string[];
  return (
    <section
      aria-label={t("ariaLabel")}
      className="w-full border-y border-white/10 bg-[#0a0a0a] py-4 md:py-5"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-white/85 sm:text-[13px] md:text-sm">
        {items.map((label) => (
          <span key={label} className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#CB1939]" aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* =============================================================================
   SEO BLOCK: Main intro — used inside BMW scroll (before “Votre Trajet Idéal”)
   ============================================================================= */
interface HomeSeoMainIntroOverlayProps {
  opacity: MotionValue<number>;
}

export function HomeSeoMainIntroOverlay({ opacity }: HomeSeoMainIntroOverlayProps) {
  const t = useTranslations("home.mainIntro");
  const [seoInteractive, setSeoInteractive] = useState(false);
  useLayoutEffect(() => {
    setSeoInteractive(opacity.get() > 0.04);
  }, [opacity]);
  useMotionValueEvent(opacity, "change", (latest) => {
    setSeoInteractive(latest > 0.04);
  });

  const bullets = t.raw("bullets") as string[];
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[24] flex items-center justify-center px-3 sm:px-4"
      style={{ opacity }}
    >
      <div
        className={`mx-auto w-full max-w-[min(100%,58rem)] cursor-default select-text px-1 text-center sm:max-w-[64rem] md:max-w-[72rem] ${
          seoInteractive ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <h2
          className="font-bold leading-[1.12] text-gray-800 [text-wrap:balance]
                     text-[clamp(26px,6.5vw,54px)] md:text-[clamp(32px,5.8vw,64px)] lg:text-[clamp(36px,5.2vw,76px)]"
        >
          {t.rich("headline", {
            accent: (chunks) => <span className="text-red-600">{chunks}</span>,
          })}
        </h2>
        <p className="mx-auto mt-5 max-w-[48rem] text-pretty text-[1.05rem] leading-[1.9] text-gray-600 sm:mt-6 sm:text-lg sm:leading-[2] md:max-w-[54rem] md:mt-7 md:text-xl md:leading-[2.15]">
          {t("body")}
        </p>
        <ul className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 text-base font-medium text-red-600 sm:mt-11 sm:gap-x-9 sm:text-lg md:text-[1.125rem]">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2.5">
              <span className="select-none text-xl font-light leading-none text-red-600 sm:text-2xl" aria-hidden>
                —
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/* =============================================================================
   SEO BLOCK: Airport delivery (after “Votre Trajet Idéal”, before black storytelling)
   ============================================================================= */
export function HomeSeoAirportBlock() {
  const t = useTranslations("home.airport");
  const bullets = t.raw("bullets") as string[];
  return (
    <motion.section
      className="bg-[#f7f5f2] py-14 md:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="mx-auto max-w-[68rem] px-4 text-center md:px-8">
        <h2 className="text-balance text-[1.45rem] font-semibold tracking-tight text-neutral-900 sm:text-[1.9rem] md:text-[2.2rem] lg:text-[2.45rem]">
          {t("title")}
        </h2>
        <p className="mx-auto mt-5 max-w-[56rem] text-pretty text-[1.05rem] leading-[1.95] text-neutral-600 sm:mt-6 sm:text-[1.14rem] sm:leading-[2] md:text-[1.22rem] md:leading-[2.1]">
          {t.rich("body", {
            kw: (chunks) => <span className="whitespace-nowrap">{chunks}</span>,
          })}
        </p>
        <ul className="mx-auto mt-9 max-w-[56rem] space-y-4 text-left text-[1.05rem] text-neutral-700 sm:text-[1.14rem] md:text-[1.2rem]">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3.5 border-b border-neutral-200/80 pb-4 last:border-0">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center text-xl font-semibold leading-none text-[#CB1939] sm:h-8 sm:w-8 sm:text-2xl" aria-hidden>
                ✓
              </span>
              <span className="pt-0.5 leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}

/* =============================================================================
   SEO BLOCK: Vehicle types (after Nos Marques, before reviews)
   ============================================================================= */
export function HomeSeoVehicleTypesBlock() {
  const t = useTranslations("home.vehicleTypes");
  const cards = t.raw("cards") as { title: string; text: string }[];
  return (
    <motion.section
      className="relative overflow-hidden bg-black py-20 lg:py-28"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <motion.div
          className="mb-12 text-center lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-balance text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.2] text-white">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-[42rem] text-pretty text-[clamp(1rem,2.1vw,1.15rem)] font-normal leading-[1.65] text-white/70">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {cards.map((c) => (
            <Link
              key={c.title}
              href="/cars"
              className="group flex min-h-[300px] flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-colors hover:border-[#CB1939]/50 hover:bg-white/[0.07] lg:min-h-[320px] lg:p-8"
            >
              <h3 className="text-xl font-semibold text-white lg:text-[1.35rem]">{c.title}</h3>
              <p className="mt-4 flex-1 text-base leading-relaxed text-white/72 lg:text-[1.0625rem] lg:leading-[1.65]">
                {c.text}
              </p>
              <span className="mt-6 text-sm font-medium uppercase tracking-wider text-[#CB1939]">
                {t("fleetCta")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

type DestinationItem = {
  name: string;
  text: string;
  category: string;
  slug: string;
  image: string;
};

/* =============================================================================
   SEO BLOCK: Local discovery (after reviews, before map dashboard)
   ============================================================================= */
export function HomeSeoLocalDiscoveryBlock() {
  const t = useTranslations("home.destinations");
  const destinations = t.raw("items") as DestinationItem[];
  return (
    <motion.section
      className="bg-[#0c0c0c] py-20 md:py-28 lg:py-32"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <h2 className="font-heading text-balance text-center text-[clamp(1.75rem,4.2vw,3.25rem)] font-semibold leading-[1.15] text-white">
          {t("title")}
        </h2>
        <p className="mx-auto mt-6 max-w-[48rem] text-center text-pretty text-base leading-[1.7] text-white/80 md:mt-7 md:text-lg md:leading-[1.75] lg:text-xl lg:leading-[1.7]">
          {t("subtitle")}
        </p>
        <div className="mt-14 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:mt-16 lg:grid-cols-4 lg:gap-8">
          {destinations.map((d) => (
            <article
              key={d.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40"
            >
              <Link
                href={{
                  pathname: "/blog/[category]/[slug]",
                  params: { category: d.category, slug: d.slug },
                }}
                locale="fr"
                className="relative block aspect-[4/3] w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#CB1939] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                <Image
                  src={d.image}
                  alt={t("imageAlt", { name: d.name })}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </Link>
              <div className="flex flex-1 flex-col p-6 md:p-7">
                <h3 className="text-xl font-semibold text-white md:text-[1.35rem]">{d.name}</h3>
                <p className="mt-3 flex-1 text-base leading-relaxed text-white/72 md:text-[1.05rem]">{d.text}</p>
                <Link
                  href={{
                    pathname: "/blog/[category]/[slug]",
                    params: { category: d.category, slug: d.slug },
                  }}
                  locale="fr"
                  className="mt-5 inline-flex text-base font-medium text-[#CB1939] hover:underline"
                >
                  {t("readMore")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* =============================================================================
   SEO BLOCK: Location + NAP (below map dashboard visual)
   ============================================================================= */
export function HomeSeoLocationNapBlock() {
  const t = useTranslations("home.location");
  const tFooter = useTranslations("footer");
  const waPrefill = encodeURIComponent(tFooter("whatsappPrefill"));
  return (
    <section className="border-t border-neutral-200 bg-[#f2efe9] px-5 py-16 md:px-8 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[52rem] text-center md:text-left">
        <h2 className="font-heading text-balance text-[clamp(1.5rem,3.8vw,2.35rem)] font-semibold leading-snug text-neutral-900">
          {t("title")}
        </h2>
        <p className="mt-5 max-w-[50rem] text-pretty text-lg leading-relaxed text-neutral-600 md:mt-6 md:text-xl md:leading-[1.65]">
          {t("body")}
        </p>
        <address className="mt-10 not-italic md:mt-12">
          <p className="text-lg font-semibold text-neutral-900 md:text-xl">{t("company")}</p>
          <p className="mt-3 text-lg text-neutral-700 md:text-xl">{t("address")}</p>
          <ul className="mt-7 space-y-4 text-lg text-neutral-800 md:mt-8 md:text-xl">
            <li className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Phone className="h-5 w-5 shrink-0 text-[#CB1939] md:h-6 md:w-6" aria-hidden />
              <a href="tel:+212662500181" className="hover:underline">
                +212 662 500 181
              </a>
            </li>
            <li className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <MessageCircle className="h-5 w-5 shrink-0 text-[#CB1939] md:h-6 md:w-6" aria-hidden />
              <a
                href={`https://wa.me/212662500181/?text=${waPrefill}`}
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("whatsappLabel")}
              </a>
            </li>
            <li className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Mail className="h-5 w-5 shrink-0 text-[#CB1939] md:h-6 md:w-6" aria-hidden />
              <a href="mailto:amseelcars5@gmail.com" className="hover:underline">
                amseelcars5@gmail.com
              </a>
            </li>
          </ul>
        </address>
      </div>
    </section>
  );
}

/* =============================================================================
   SEO BLOCK: Booking CTA (after map, before FAQ)
   ============================================================================= */
export function HomeSeoBookingCtaBlock() {
  const t = useTranslations("home.bookingCta");
  const waReserve = encodeURIComponent(t("whatsappPrefillReserve"));
  return (
    <section className="border-t border-neutral-200 bg-white px-5 py-20 md:px-8 md:py-24 lg:py-28">
      <div className="mx-auto max-w-[52rem] text-center">
        <h2 className="font-heading text-balance text-[clamp(1.5rem,3.8vw,2.35rem)] font-semibold leading-snug text-neutral-900">
          {t("title")}
        </h2>
        <p className="mx-auto mt-5 max-w-[50rem] text-pretty text-lg leading-relaxed text-neutral-600 md:mt-6 md:text-xl md:leading-[1.65]">
          {t("body")}
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-5 md:mt-14 md:gap-6">
          <Link
            href="/cars"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-[#CB1939] bg-[#CB1939] px-9 py-3.5 text-base font-semibold text-white transition hover:bg-[#a91530] md:min-w-[220px] md:px-10 md:py-4"
          >
            {t("bookNow")}
          </Link>
          <a
            href={`https://wa.me/212662500181/?text=${waReserve}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-neutral-900 px-9 py-3.5 text-base font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white md:min-w-[220px] md:px-10 md:py-4"
          >
            {t("whatsapp")}
          </a>
          <a
            href="tel:+212662500181"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-neutral-300 px-9 py-3.5 text-base font-semibold text-neutral-900 transition hover:border-neutral-900 md:min-w-[220px] md:px-10 md:py-4"
          >
            {t("call")}
          </a>
        </div>
      </div>
    </section>
  );
}

/** Full answer stays in the DOM; line-clamp + toggle keeps the section scannable (AEO-friendly). */
function FaqAnswerText({
  text,
  answerId,
  readMoreLabel,
  readLessLabel,
}: {
  text: string;
  answerId: string;
  readMoreLabel: string;
  readLessLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const pRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = pRef.current;
    if (!el) return;

    const measure = () => {
      if (expanded) {
        setShowToggle(true);
        return;
      }
      setShowToggle(el.scrollHeight > el.clientHeight + 2);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, expanded]);

  return (
    <div>
      <p
        ref={pRef}
        id={answerId}
        className={cn(
          "text-pretty text-[0.9375rem] leading-[1.65] text-neutral-600 sm:text-base sm:leading-[1.7]",
          !expanded && "line-clamp-4 sm:line-clamp-5"
        )}
      >
        {text}
      </p>
      {showToggle ? (
        <button
          type="button"
          className="mt-2.5 inline-flex items-center gap-1 text-sm font-semibold text-[#CB1939] underline decoration-[#CB1939]/30 underline-offset-4 transition hover:decoration-[#CB1939] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CB1939]"
          aria-expanded={expanded}
          aria-controls={answerId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? readLessLabel : readMoreLabel}
        </button>
      ) : null}
    </div>
  );
}

function HomeFaqCard({
  item,
  index,
  readMoreLabel,
  readLessLabel,
}: {
  item: FaqItem;
  index: number;
  readMoreLabel: string;
  readLessLabel: string;
}) {
  const answerId = `home-faq-reponse-${index}`;
  return (
    <article className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-[box-shadow,border-color] hover:border-neutral-300/90 hover:shadow-md">
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#CB1939]"
        aria-hidden
      />
      <div className="pl-4 pr-4 py-4 sm:pl-5 sm:pr-5 sm:py-5">
        <h3 className="text-balance text-[0.9375rem] font-semibold leading-snug tracking-tight text-neutral-900 sm:text-base md:text-[1.0625rem] md:leading-snug">
          {item.q}
        </h3>
        <div className="mt-2.5 sm:mt-3">
          <FaqAnswerText
            text={item.a}
            answerId={answerId}
            readMoreLabel={readMoreLabel}
            readLessLabel={readLessLabel}
          />
        </div>
      </div>
    </article>
  );
}

function FaqColumn({
  items,
  startIndex,
  readMoreLabel,
  readLessLabel,
}: {
  items: FaqItem[];
  startIndex: number;
  readMoreLabel: string;
  readLessLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {items.map((item, i) => (
        <HomeFaqCard
          key={item.q}
          item={item}
          index={startIndex + i}
          readMoreLabel={readMoreLabel}
          readLessLabel={readLessLabel}
        />
      ))}
    </div>
  );
}

export function HomeSeoFaqBlock() {
  const t = useTranslations("home.faq");
  const faqItems = t.raw("items") as FaqItem[];
  const faqCol1 = faqItems.slice(0, 4);
  const faqCol2 = faqItems.slice(4, 7);
  const faqCol3 = faqItems.slice(7, 10);

  const homeFaqPageSchema = generateFAQSchema(
    faqItems.map((item) => ({ question: item.q, answer: item.a }))
  );

  const readMore = t("readMore");
  const readLess = t("readLess");

  return (
    <>
      {homeFaqPageSchema && (
        <Script
          id="ld-json-faq-home"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(homeFaqPageSchema),
          }}
        />
      )}
      <section
        className="border-t border-neutral-200 bg-gradient-to-b from-neutral-100/80 to-[#fafafa] px-4 py-14 sm:px-5 sm:py-16 md:py-20"
        aria-labelledby="home-faq-heading"
      >
        <div className="mx-auto max-w-7xl">
          <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#CB1939] sm:text-[0.8125rem]">
              {t("kicker")}
            </p>
            <h2
              id="home-faq-heading"
              className="mt-2 text-balance text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl md:text-3xl md:leading-tight"
            >
              {t("title")}
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-neutral-600 sm:text-base sm:leading-relaxed">
              {t("subtitle")}
            </p>
          </header>

          <div className="mt-9 grid grid-cols-1 gap-8 sm:mt-10 md:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-0 xl:gap-x-8">
            <FaqColumn items={faqCol1} startIndex={0} readMoreLabel={readMore} readLessLabel={readLess} />
            <FaqColumn items={faqCol2} startIndex={4} readMoreLabel={readMore} readLessLabel={readLess} />
            <FaqColumn items={faqCol3} startIndex={7} readMoreLabel={readMore} readLessLabel={readLess} />
          </div>
        </div>
      </section>
    </>
  );
}
