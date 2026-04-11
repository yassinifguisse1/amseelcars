import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { clsx } from 'clsx'
import Footer from '@/components/Footer/Footer'
import styles from './agadir-landing.module.css'

export type AgadirLandingFeatureIcon = 'pin' | 'fleet' | 'bolt'

export type AgadirLandingFeature = {
  title: string
  description: string
  icon: AgadirLandingFeatureIcon
}

export type AgadirLandingCar = {
  slug: string
  name: string
  image: string
  imageAlt: string
  imageTitle?: string
  imageCaption?: string
}

export type AgadirLandingStat = {
  value: string
  label: string
}

export type AgadirLandingCta = {
  href: string
  label: string
  variant: 'primary' | 'secondary' | 'whatsapp'
}

type AgadirLandingShellProps = {
  variant?: 'city' | 'airport'
  langSlot: ReactNode
  heroTitle: ReactNode
  heroLead: string
  ctas: AgadirLandingCta[]
  stats?: AgadirLandingStat[]
  statsAsideLabel?: string
  featuresKicker: string
  featuresTitle: string
  featuresLead?: string
  features: AgadirLandingFeature[]
  carsKicker: string
  carsTitle: string
  carsLead: string
  cars: AgadirLandingCar[]
  fleetHref?: string
  fleetLinkLabel: string
  carDetailHint: string
  faqTitle: string
  faqs: ReadonlyArray<{ question: string; answer: string }>
}

function FeatureGlyph({ icon }: { icon: AgadirLandingFeatureIcon }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  if (icon === 'pin') {
    return (
      <svg {...props}>
        <path d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z" />
        <circle cx="12" cy="11" r="2.25" />
      </svg>
    )
  }
  if (icon === 'fleet') {
    return (
      <svg {...props}>
        <path d="M4 17h2l1-5h10l1 5h2" />
        <path d="M7 12V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
        <circle cx="7.5" cy="17" r="1.25" />
        <circle cx="16.5" cy="17" r="1.25" />
      </svg>
    )
  }
  return (
    <svg {...props}>
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  )
}

export function AgadirLandingShell({
  variant = 'city',
  langSlot,
  heroTitle,
  heroLead,
  ctas,
  stats,
  statsAsideLabel = 'Quick facts',
  featuresKicker,
  featuresTitle,
  featuresLead,
  features,
  carsKicker,
  carsTitle,
  carsLead,
  cars,
  fleetHref = '/cars',
  fleetLinkLabel,
  carDetailHint,
  faqTitle,
  faqs,
}: AgadirLandingShellProps) {
  const dataVariant = variant === 'airport' ? 'airport' : 'city'

  return (
    <div className={clsx('page-content', styles.root)} data-variant={dataVariant}>
      <div className={styles.ambient} aria-hidden />
      <div className={styles.grain} aria-hidden />
      <div className={styles.decorRail} aria-hidden />

      <div className={styles.inner}>
        <main className={styles.main}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.langRow}>
                <div className={styles.langPill}>{langSlot}</div>
              </div>

              <h1 className={styles.heroTitle}>{heroTitle}</h1>
              <p className={styles.heroLead}>{heroLead}</p>

              <div className={styles.ctaRow}>
                {ctas.map((cta) => {
                  const external = cta.href.startsWith('http')
                  return (
                  <Link
                    key={`${cta.href}-${cta.label}`}
                    href={cta.href}
                    prefetch={external ? false : undefined}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className={clsx(
                      styles.btnBase,
                      cta.variant === 'primary' && styles.btnPrimary,
                      cta.variant === 'secondary' && styles.btnSecondary,
                      cta.variant === 'whatsapp' && styles.btnWhatsApp
                    )}
                  >
                    {cta.variant === 'whatsapp' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    ) : null}
                    {cta.label}
                  </Link>
                  )
                })}
              </div>
            </div>

            {stats && stats.length > 0 ? (
              <aside className={styles.heroAside} aria-label={statsAsideLabel}>
                {stats.map((s) => (
                  <div key={s.label} className={styles.stat}>
                    <span className={styles.statValue}>{s.value}</span>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                ))}
              </aside>
            ) : null}
          </div>

          <section className={styles.section} aria-labelledby="features-heading">
            <header className={styles.sectionHead}>
              <p className={styles.sectionKicker}>{featuresKicker}</p>
              <h2 id="features-heading" className={styles.sectionTitle}>
                {featuresTitle}
              </h2>
              {featuresLead ? <p className={styles.sectionLead}>{featuresLead}</p> : null}
            </header>
            <div className={styles.featuresGrid}>
              {features.map((f) => (
                <article key={f.title} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <FeatureGlyph icon={f.icon} />
                  </div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureBody}>{f.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="cars-heading">
            <header className={styles.sectionHead}>
              <p className={styles.sectionKicker}>{carsKicker}</p>
              <h2 id="cars-heading" className={styles.sectionTitle}>
                {carsTitle}
              </h2>
              <p className={styles.sectionLead}>{carsLead}</p>
            </header>
            <div className={styles.carsGrid}>
              {cars.map((car) => {
                const title = (car.imageTitle?.trim() || car.imageAlt).slice(0, 200)
                return (
                <Link
                  key={car.slug}
                  href={`${fleetHref.replace(/\/$/, '')}/${car.slug}`}
                  className={styles.carCard}
                >
                  <div className={styles.carImageWrap}>
                    <Image
                      src={car.image}
                      alt={car.imageAlt}
                      title={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className={styles.carOverlay} aria-hidden />
                  <div className={styles.carLabel}>
                    <p className={styles.carName}>{car.name}</p>
                    {car.imageCaption ? (
                      <p className={styles.carCaption}>{car.imageCaption}</p>
                    ) : null}
                    <p className={styles.carHint}>{carDetailHint}</p>
                  </div>
                </Link>
                )
              })}
            </div>
            <Link href={fleetHref} className={styles.linkAll}>
              {fleetLinkLabel} →
            </Link>
          </section>

          <section className={styles.section} aria-labelledby="faq-heading">
            <div className={styles.faqWrap}>
              <header className={styles.sectionHead}>
                <p className={styles.sectionKicker}>FAQ</p>
                <h2 id="faq-heading" className={styles.sectionTitle}>
                  {faqTitle}
                </h2>
              </header>
              <div className={styles.faqList}>
                {faqs.map((faq) => (
                  <article key={faq.question} className={styles.faqItem}>
                    <h3 className={styles.faqQuestion}>{faq.question}</h3>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  )
}
