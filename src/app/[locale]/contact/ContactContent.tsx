"use client";

import Image from "next/image";
import Footer from "@/components/Footer/Footer";
import ContactForm from "@/components/Contact/ContactForm";
import { ContactReach, ContactMap } from "@/components/Contact/ContactInfo";
import { LogoFloatPreloader } from "@/components/Preloader/LogoFloatPreloader";
import { useTranslations } from "next-intl";
import styles from "@/components/Contact/contact.module.css";

const HERO_IMAGE = "/images/BMW-X3-PACKM-main.webp";

export function ContactContent() {
  const tHero = useTranslations("contactPage.hero");
  const tForm = useTranslations("contactPage.form");

  return (
    <>
      <LogoFloatPreloader />

      <div className={styles.root}>
        <header className={styles.hero}>
          <div className={styles.heroMedia}>
            <Image
              src={HERO_IMAGE}
              alt={tHero("imageAlt")}
              fill
              priority
              sizes="100vw"
              className={styles.heroImage}
            />
            <div className={styles.heroShade} aria-hidden />
          </div>

          <div className={styles.heroInner}>
            <div className={styles.heroBrand}>
              <p className={styles.brandMark}>AMSEEL CARS</p>
              <p className={styles.heroPlace}>{tHero("place")}</p>
            </div>

            <h1 className={styles.heroTitle}>{tHero("title")}</h1>
            <p className={styles.heroLead}>{tHero("lead")}</p>

            <div className={styles.heroActions}>
              <a
                href="https://wa.me/212662500181"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.cta} ${styles.ctaPrimary}`}
              >
                {tHero("whatsappCta")}
              </a>
              <a
                href="#contact-form"
                className={`${styles.cta} ${styles.ctaSecondary}`}
              >
                {tHero("messageCta")}
              </a>
            </div>
          </div>

          <div className={styles.heroScroll} aria-hidden>
            <span />
          </div>
        </header>

        <div className={styles.body}>
          <ContactReach />

          <section className={styles.formSection} aria-labelledby="contact-form-heading">
            <div className={styles.formIntro}>
              <p className={styles.kicker}>Amseel Cars</p>
              <h2 id="contact-form-heading" className={styles.h2}>
                {tForm("title")}
              </h2>
              <p className={styles.lead}>{tForm("intro")}</p>
            </div>
            <ContactForm />
          </section>

          <ContactMap />
        </div>

        <Footer />
      </div>
    </>
  );
}
