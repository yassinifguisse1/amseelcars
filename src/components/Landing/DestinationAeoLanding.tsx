import type { ReactNode } from "react";
import Image from "next/image";
import NextLink from "next/link";
import clsx from "clsx";
import Footer from "@/components/Footer/Footer";
import styles from "./destination-aeo-landing.module.css";

export type DestinationStat = {
  label: string;
  value: string;
  helper?: string;
};

export type DestinationFeature = {
  title: string;
  description: string;
};

export type DestinationHighlight = {
  title: string;
  body: string;
};

export type DestinationCar = {
  name: string;
  image: string;
  imageAlt: string;
  imageTitle?: string;
  imageCaption?: string;
  href: string;
  badge?: string;
};

export type DestinationFaq = {
  question: string;
  answer: string;
};

export type DestinationCta = {
  label: string;
  href: string;
  variant: "primary" | "secondary" | "ghost";
  external?: boolean;
};

export type DestinationKeyFact = {
  term: string;
  value: string;
};

export type DestinationRelatedPage = {
  label: string;
  href: string;
};

export type DestinationTrustReview = {
  author: string;
  body: string;
  rating?: number;
};

export type DestinationTrustSection = {
  title: string;
  body: string;
  company: string;
  address: string;
  phoneLabel: string;
  phoneHref: string;
  whatsappLabel: string;
  whatsappHref: string;
  emailLabel: string;
  emailHref: string;
  contactLabel: string;
  contactHref: string;
  reviewsTitle: string;
  reviews: DestinationTrustReview[];
};

export type DestinationGuideSection = {
  kicker: string;
  title: string;
  lead: string;
  items: DestinationFeature[];
};

export type DestinationAeoLandingProps = {
  languageSwitcher: ReactNode;
  variant?: "default" | "airport" | "coast";
  hero: {
    eyebrow: string;
    title: ReactNode;
    lead: string;
    meta: string;
  };
  /** Full-bleed visual for first viewport (fleet / place photography). */
  heroVisual?: { src: string; alt: string };
  /** Optional mid-page place photo for visual richness. */
  visualBand?: { src: string; alt: string; caption?: string };
  /** Optional side image opposite the intro copy (desktop). */
  introVisual?: { src: string; alt: string };
  /** Optional side image opposite the trust / NAP block (desktop). */
  trustVisual?: { src: string; alt: string };
  quickAnswer: string;
  keyFacts?: DestinationKeyFact[];
  keyFactsTitle?: string;
  relatedPages?: DestinationRelatedPage[];
  relatedPagesLabel?: string;
  trustSection?: DestinationTrustSection;
  /** Extra editorial blocks (delivery zones, price bands, etc.). */
  guideSections?: DestinationGuideSection[];
  serviceChips: string[];
  stats: DestinationStat[];
  aiHighlights: DestinationHighlight[];
  features: DestinationFeature[];
  carsSection: {
    kicker: string;
    title: string;
    lead: string;
  };
  cars: DestinationCar[];
  /** Optional booking search bar overlaid on the lower mid of the hero image. */
  bookingSearch?: ReactNode;
  faqs: readonly DestinationFaq[];
  faqTitle: string;
  faqKicker?: string;
  ctas: {
    primary: DestinationCta;
    secondary?: DestinationCta;
    tertiary?: DestinationCta;
  };
  fleetHref: string;
  fleetCtaLabel?: string;
  carOpenHint?: string;
  operationsSection: {
    kicker: string;
    title: string;
    lead: string;
  };
  aiPanel: {
    badge: string;
    title: string;
  };
};

function CtaLink({ cta }: { cta: DestinationCta }) {
  const external =
    cta.external ||
    cta.href.startsWith("http") ||
    cta.href.startsWith("mailto:");
  const className = clsx(
    styles.cta,
    cta.variant === "primary" && styles.ctaPrimary,
    cta.variant === "secondary" && styles.ctaSecondary,
    cta.variant === "ghost" && styles.ctaGhost,
  );
  if (external) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
        {cta.label}
      </a>
    );
  }
  return (
    <NextLink href={cta.href} prefetch className={className}>
      {cta.label}
    </NextLink>
  );
}

/**
 * Editorial destination landing — cinematic, brand-led, crawlable.
 * Avoids generic SEO-template patterns (chip clouds, boxed “AI overview”, card farms).
 */
export function DestinationAeoLanding({
  languageSwitcher,
  variant = "default",
  hero,
  heroVisual,
  visualBand,
  introVisual,
  trustVisual,
  quickAnswer,
  keyFacts,
  keyFactsTitle = "At a glance",
  relatedPages,
  relatedPagesLabel = "Related pages",
  trustSection,
  guideSections,
  serviceChips,
  stats,
  aiHighlights,
  features,
  carsSection,
  cars,
  bookingSearch,
  faqs,
  faqTitle,
  faqKicker = "FAQ",
  ctas,
  fleetHref,
  fleetCtaLabel,
  carOpenHint,
  operationsSection,
  aiPanel,
}: DestinationAeoLandingProps) {
  const fleetLabel = fleetCtaLabel ?? "Explore the entire fleet";
  const openHint = carOpenHint ?? "Voir le véhicule →";
  const visual = heroVisual ?? (cars[0] ? { src: cars[0].image, alt: cars[0].imageAlt } : null);

  return (
    <div className={styles.root} data-variant={variant}>
      {/* ——— Hero: one composition ——— */}
      <header className={clsx(styles.hero, bookingSearch && styles.heroWithBooking)}>
        {visual ? (
          <div className={styles.heroMedia} aria-hidden={false}>
            <Image
              src={visual.src}
              alt={visual.alt}
              fill
              priority
              sizes="100vw"
              className={styles.heroImage}
            />
            <div className={styles.heroShade} aria-hidden />
          </div>
        ) : (
          <div className={styles.heroFallback} aria-hidden />
        )}

        <div className={styles.heroInner}>
          <div className={styles.heroLang}>{languageSwitcher}</div>

          <div className={styles.heroBrand}>
            <p className={styles.brandMark}>AMSEEL CARS</p>
            <p className={styles.heroPlace}>{hero.eyebrow}</p>
          </div>

          <h1 id="aeo-main-heading" className={styles.heroTitle}>
            {hero.title}
          </h1>

          <p className={styles.heroLead}>{hero.lead}</p>

          {!bookingSearch ? (
            <>
              <div className={styles.heroActions}>
                <CtaLink cta={ctas.primary} />
                {ctas.secondary ? <CtaLink cta={ctas.secondary} /> : null}
              </div>
              <div className={styles.heroScroll} aria-hidden>
                <span />
              </div>
            </>
          ) : null}
        </div>

        {bookingSearch ? (
          <div className={styles.heroBooking}>{bookingSearch}</div>
        ) : null}
      </header>

      <section id="cars" className={styles.fleet} aria-labelledby="cars-heading">
        <div className={styles.fleetInner}>
          <div className={styles.fleetHead}>
            <p className={styles.kicker}>{carsSection.kicker}</p>
            <h2 id="cars-heading" className={styles.h2}>
              {carsSection.title}
            </h2>
            <p className={styles.lead}>{carsSection.lead}</p>
          </div>
        </div>

        <div className={styles.fleetRail} role="region" aria-label={carsSection.title}>
          <div className={styles.fleetTrack}>
            {cars.map((car, index) => {
              const title = (car.imageTitle?.trim() || car.imageAlt).slice(0, 200);
              return (
                <NextLink key={car.href} href={car.href} className={styles.fleetCard}>
                  <div className={styles.fleetCardMedia}>
                    <Image
                      src={car.image}
                      alt={car.imageAlt}
                      title={title}
                      fill
                      priority={index < 1}
                      sizes="(max-width: 640px) 72vw, 300px"
                      className={styles.fleetCardImg}
                    />
                  </div>
                  <div className={styles.fleetCardCopy}>
                    {car.badge ? <p className={styles.fleetBadge}>{car.badge}</p> : null}
                    <p className={styles.fleetName}>{car.name}</p>
                    {car.imageCaption ? (
                      <p className={styles.fleetCaption}>{car.imageCaption}</p>
                    ) : null}
                    <span className={styles.fleetHint}>{openHint}</span>
                  </div>
                </NextLink>
              );
            })}
          </div>
        </div>

        <div className={styles.fleetInner}>
          <NextLink href={fleetHref} className={styles.fleetAll}>
            {fleetLabel}
          </NextLink>
        </div>
      </section>

      <article className={styles.body} itemScope itemType="https://schema.org/WebPage">
        {/* Crawlable intro — plain type, no callout box */}
        <section
          className={clsx(styles.intro, introVisual && styles.splitBlock)}
          aria-labelledby="aeo-main-heading"
        >
          <div className={styles.splitCopy}>
            <p id="quick-answer" className={styles.quickAnswer}>
              {quickAnswer}
            </p>
            <p className={styles.meta}>{hero.meta}</p>
            {serviceChips.length ? (
              <p className={styles.chipLine}>
                {serviceChips.map((chip, i) => (
                  <span key={chip}>
                    {i > 0 ? <span className={styles.chipSep} aria-hidden> · </span> : null}
                    {chip}
                  </span>
                ))}
              </p>
            ) : null}
            {ctas.tertiary ? (
              <p className={styles.tertiaryWrap}>
                <CtaLink cta={ctas.tertiary} />
              </p>
            ) : null}
          </div>
          {introVisual ? (
            <figure className={styles.splitVisual}>
              <Image
                src={introVisual.src}
                alt={introVisual.alt}
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
                className={styles.splitVisualImg}
              />
            </figure>
          ) : null}
        </section>

        {stats.length ? (
          <section className={styles.statStrip} aria-label="Key stats">
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
                {stat.helper ? <span className={styles.statHelper}>{stat.helper}</span> : null}
              </div>
            ))}
          </section>
        ) : null}

        {aiHighlights.length ? (
          <section className={styles.editorial} aria-labelledby="highlights-heading">
            <p className={styles.kicker}>{aiPanel.badge}</p>
            <h2 id="highlights-heading" className={styles.h2}>
              {aiPanel.title}
            </h2>
            <ol className={styles.points}>
              {aiHighlights.map((item, i) => (
                <li key={item.title}>
                  <span className={styles.pointIndex} aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className={styles.pointTitle}>{item.title}</h3>
                    <p className={styles.pointBody}>{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {(keyFacts?.length || relatedPages?.length) ? (
          <section className={styles.glance}>
            {keyFacts?.length ? (
              <div className={styles.facts}>
                <h2 className={styles.h2Sm}>{keyFactsTitle}</h2>
                <dl className={styles.factList}>
                  {keyFacts.map((row) => (
                    <div key={row.term} className={styles.factRow}>
                      <dt>{row.term}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {relatedPages?.length ? (
              <nav className={styles.related} aria-label={relatedPagesLabel}>
                <p className={styles.relatedLabel}>{relatedPagesLabel}</p>
                <ul>
                  {relatedPages.map((p) => (
                    <li key={p.href}>
                      <NextLink href={p.href}>{p.label}</NextLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </section>
        ) : null}

        <section className={styles.editorial} aria-labelledby="ops-heading">
          <p className={styles.kicker}>{operationsSection.kicker}</p>
          <h2 id="ops-heading" className={styles.h2}>
            {operationsSection.title}
          </h2>
          <p className={styles.lead}>{operationsSection.lead}</p>
          <div className={styles.featureRows}>
            {features.map((feature) => (
              <article key={feature.title} className={styles.featureRow}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {visualBand ? (
          <figure className={styles.visualBand}>
            <div className={styles.visualBandMedia}>
              <Image
                src={visualBand.src}
                alt={visualBand.alt}
                fill
                sizes="100vw"
                className={styles.visualBandImg}
              />
            </div>
            {visualBand.caption ? (
              <figcaption className={styles.visualBandCaption}>
                {visualBand.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        {guideSections?.map((section) => (
          <section
            key={section.title}
            className={styles.editorial}
            aria-labelledby={`guide-${section.title}`}
          >
            <p className={styles.kicker}>{section.kicker}</p>
            <h2 id={`guide-${section.title}`} className={styles.h2}>
              {section.title}
            </h2>
            <p className={styles.lead}>{section.lead}</p>
            <div className={styles.featureRows}>
              {section.items.map((item) => (
                <article key={item.title} className={styles.featureRow}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        ))}

        {trustSection ? (
          <section
            className={clsx(styles.trust, trustVisual && styles.splitBlock)}
            aria-labelledby="trust-heading"
          >
            <div className={styles.splitCopy}>
              <p className={styles.kicker}>{trustSection.company}</p>
              <h2 id="trust-heading" className={styles.h2}>
                {trustSection.title}
              </h2>
              <p className={styles.lead}>{trustSection.body}</p>
              <address className={styles.trustNap}>
                <p className={styles.trustCompany}>{trustSection.company}</p>
                <p>{trustSection.address}</p>
                <ul className={styles.trustLinks}>
                  <li>
                    <a href={trustSection.phoneHref}>{trustSection.phoneLabel}</a>
                  </li>
                  <li>
                    <a
                      href={trustSection.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {trustSection.whatsappLabel}
                    </a>
                  </li>
                  <li>
                    <a href={trustSection.emailHref}>{trustSection.emailLabel}</a>
                  </li>
                  <li>
                    <NextLink href={trustSection.contactHref}>
                      {trustSection.contactLabel}
                    </NextLink>
                  </li>
                </ul>
              </address>
              {trustSection.reviews.length ? (
                <div className={styles.trustReviews}>
                  <h3 className={styles.h2Sm}>{trustSection.reviewsTitle}</h3>
                  <ul className={styles.trustReviewList}>
                    {trustSection.reviews.map((review) => (
                      <li key={review.author} className={styles.trustReview}>
                        <p className={styles.trustReviewBody}>&ldquo;{review.body}&rdquo;</p>
                        <p className={styles.trustReviewAuthor}>
                          {review.author}
                          {review.rating ? (
                            <span aria-label={`${review.rating} out of 5`}>
                              {" "}
                              · {"★".repeat(Math.min(5, Math.max(1, review.rating)))}
                            </span>
                          ) : null}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            {trustVisual ? (
              <figure className={styles.splitVisual}>
                <Image
                  src={trustVisual.src}
                  alt={trustVisual.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 42vw"
                  className={styles.splitVisualImg}
                />
              </figure>
            ) : null}
          </section>
        ) : null}

        <section className={styles.faq} aria-labelledby="faq-heading">
          <p className={styles.kicker}>{faqKicker}</p>
          <h2 id="faq-heading" className={styles.h2}>
            {faqTitle}
          </h2>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details key={faq.question} className={styles.faqItem}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      <Footer />
    </div>
  );
}
