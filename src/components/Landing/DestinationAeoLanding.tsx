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

/** Key–value rows for AI / human “at a glance” extraction */
export type DestinationKeyFact = {
  term: string;
  value: string;
};

export type DestinationRelatedPage = {
  label: string;
  href: string;
};

export type DestinationAeoLandingProps = {
  languageSwitcher: ReactNode;
  /** Visual accent: shifts gradient weight (still red / black / white) */
  variant?: "default" | "airport" | "coast";
  hero: {
    eyebrow: string;
    title: ReactNode;
    lead: string;
    meta: string;
  };
  /**
   * One short, factual paragraph immediately under H1 — recommended for AEO / AI overviews.
   */
  quickAnswer: string;
  keyFacts?: DestinationKeyFact[];
  /** Shown above the definition list when `keyFacts` is set */
  keyFactsTitle?: string;
  relatedPages?: DestinationRelatedPage[];
  /** Label for the related links nav */
  relatedPagesLabel?: string;
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
  /** Section above feature cards (localized) */
  operationsSection: {
    kicker: string;
    title: string;
    lead: string;
  };
  /** AI panel heading (localized) */
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
    styles.ctaButton,
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

export function DestinationAeoLanding({
  languageSwitcher,
  variant = "default",
  hero,
  quickAnswer,
  keyFacts,
  keyFactsTitle = "At a glance",
  relatedPages,
  relatedPagesLabel = "Related pages",
  serviceChips,
  stats,
  aiHighlights,
  features,
  carsSection,
  cars,
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
  const openHint = carOpenHint ?? "Open briefing →";

  return (
    <div className={styles.root} data-variant={variant}>
      <div className={styles.backdrop} aria-hidden />
      <div className={styles.gridTexture} aria-hidden />
      <div className={styles.diagonalWash} aria-hidden />
      <div className={styles.noise} aria-hidden />
      <div className={styles.redRail} aria-hidden />

      <article className={styles.inner} itemScope itemType="https://schema.org/WebPage">
        <meta itemProp="name" content={typeof hero.title === "string" ? hero.title : undefined} />

        <section className={styles.heroSection} aria-labelledby="aeo-main-heading">
          <div className={styles.heroTopBar}>
            <div className={styles.langSwitcher}>{languageSwitcher}</div>
            <span className={styles.heroRule} aria-hidden />
          </div>
          <p className={styles.heroEyebrow}>{hero.eyebrow}</p>
          <h1 id="aeo-main-heading" className={styles.heroTitle}>
            {hero.title}
          </h1>

          <div className={styles.heroSplit}>
            <div className={styles.heroSplitMain}>
              <p id="quick-answer" className={styles.quickAnswer}>
                {quickAnswer}
              </p>
              <p className={styles.heroLead}>{hero.lead}</p>
              <p className={styles.heroMeta}>{hero.meta}</p>

              {serviceChips.length ? (
                <div className={styles.serviceChips} aria-label="Service types">
                  {serviceChips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
              ) : null}

              <div className={styles.ctaRow}>
                <CtaLink cta={ctas.primary} />
                {ctas.secondary ? <CtaLink cta={ctas.secondary} /> : null}
                {ctas.tertiary ? <CtaLink cta={ctas.tertiary} /> : null}
              </div>
            </div>

            {stats.length ? (
              <aside className={styles.statsRail} aria-label="Key stats">
                {stats.map((stat) => (
                  <div key={stat.label} className={styles.statCard}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                    {stat.helper ? <p>{stat.helper}</p> : null}
                  </div>
                ))}
              </aside>
            ) : null}
          </div>

          {aiHighlights.length ? (
            <section className={styles.aiBand} aria-labelledby="ai-panel-heading">
              <div className={styles.aiBandHeader}>
                <p className={styles.aiBadge}>{aiPanel.badge}</p>
                <h2 id="ai-panel-heading" className={styles.aiPanelTitle}>
                  {aiPanel.title}
                </h2>
              </div>
              <div className={styles.aiList}>
                {aiHighlights.map((item) => (
                  <article key={item.title} className={styles.aiListItem}>
                    <h3 className={styles.aiItemTitle}>{item.title}</h3>
                    <p className={styles.aiItemBody}>{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </section>

        {keyFacts?.length || relatedPages?.length ? (
          <div className={styles.factsRelatedShell}>
            {keyFacts?.length ? (
              <section className={styles.factsStrip} aria-labelledby="key-facts-heading">
                <h2 id="key-facts-heading" className={styles.factsTitle}>
                  {keyFactsTitle}
                </h2>
                <dl className={styles.factsGrid}>
                  {keyFacts.map((row) => (
                    <div key={row.term} className={styles.factRow}>
                      <dt>{row.term}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {relatedPages?.length ? (
              <nav className={styles.relatedNav} aria-label="Related locations">
                <span className={styles.relatedLabel}>{relatedPagesLabel}</span>
                <ul>
                  {relatedPages.map((p) => (
                    <li key={p.href}>
                      <NextLink href={p.href} className={styles.relatedLink}>
                        {p.label}
                      </NextLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        ) : null}

        <section className={styles.section} aria-labelledby="ops-heading">
          <span className={styles.sectionDivider} aria-hidden />
          <div className={styles.sectionHeader}>
            <p id="ops-heading" className={styles.sectionKicker}>
              {operationsSection.kicker}
            </p>
            <h2 className={styles.sectionTitle}>{operationsSection.title}</h2>
            <p className={styles.sectionLead}>{operationsSection.lead}</p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className={index === 0 ? `${styles.featureCard} ${styles.featureCardLead}` : styles.featureCard}
              >
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="cars-heading">
          <span className={styles.sectionDivider} aria-hidden />
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{carsSection.kicker}</p>
            <h2 id="cars-heading" className={styles.sectionTitle}>
              {carsSection.title}
            </h2>
            <p className={styles.sectionLead}>{carsSection.lead}</p>
          </div>
          <div className={styles.carsGrid}>
            {cars.map((car) => {
              const title = (car.imageTitle?.trim() || car.imageAlt).slice(0, 200);
              return (
                <NextLink key={car.href} href={car.href} className={styles.carCard}>
                  <div className={styles.carImageWrap}>
                    <Image
                      src={car.image}
                      alt={car.imageAlt}
                      title={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={styles.carImage}
                    />
                    <div className={styles.carImageOverlay} />
                  </div>
                  <div className={styles.carContent}>
                    {car.badge ? <span className={styles.carBadge}>{car.badge}</span> : null}
                    <p className={styles.carName}>{car.name}</p>
                    {car.imageCaption ? (
                      <p className={styles.carCaption}>{car.imageCaption}</p>
                    ) : null}
                    <span className={styles.carHint}>{openHint}</span>
                  </div>
                </NextLink>
              );
            })}
          </div>
          <NextLink href={fleetHref} className={styles.linkAll}>
            {fleetLabel} ↗
          </NextLink>
        </section>

        <section className={styles.section} aria-labelledby="faq-heading">
          <span className={styles.sectionDivider} aria-hidden />
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{faqKicker}</p>
            <h2 id="faq-heading" className={styles.sectionTitle}>
              {faqTitle}
            </h2>
          </div>
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
