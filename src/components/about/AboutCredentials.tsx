"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  BUSINESS_EMAIL,
  BUSINESS_MAILTO,
  BUSINESS_TELEPHONE_DISPLAY,
  BUSINESS_TELEPHONE_E164,
  BUSINESS_WHATSAPP_URL,
} from "@/lib/business";
import styles from "./AboutCredentials.module.css";

export function AboutCredentials() {
  const t = useTranslations("aboutPage.credentials");
  const items = t.raw("items") as Array<{ label: string; value: string }>;
  const faqs = t.raw("faqs") as Array<{ question: string; answer: string }>;
  const links = t.raw("serviceLinks") as Array<{ href: string; label: string }>;

  return (
    <section className={styles.section} aria-labelledby="about-credentials-heading">
      <div className={styles.inner}>
        <p className={styles.brand}>{t("brand")}</p>
        <h2 id="about-credentials-heading" className={styles.title}>
          {t("title")}
        </h2>
        <p className={styles.intro}>{t("intro")}</p>
        <p className={styles.expertise}>{t("expertise")}</p>

        <dl className={styles.list}>
          {items.map((item, index) => (
            <div key={item.label} className={styles.row}>
              <dt className={styles.label}>{t(`items.${index}.label`)}</dt>
              <dd className={styles.value}>{t(`items.${index}.value`)}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.reach}>
          <a href={`tel:${BUSINESS_TELEPHONE_E164}`} className={styles.reachLink}>
            {BUSINESS_TELEPHONE_DISPLAY}
          </a>
          <a href={BUSINESS_WHATSAPP_URL} className={styles.reachLink} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a href={BUSINESS_MAILTO} className={styles.reachLink}>
            {BUSINESS_EMAIL}
          </a>
        </div>

        <h3 className={styles.subheading}>{t("servicesTitle")}</h3>
        <p className={styles.expertise}>{t("servicesBody")}</p>
        <nav className={styles.serviceNav} aria-label={t("servicesNavAria")}>
          {links.map((_, index) => (
            <Link
              key={t(`serviceLinks.${index}.href`)}
              href={
                t(`serviceLinks.${index}.href`) as
                  | "/location-voiture-agadir"
                  | "/agadir-airport-car-rental"
                  | "/taghazout-car-rental"
                  | "/cars"
                  | "/contact"
              }
            >
              {t(`serviceLinks.${index}.label`)}
            </Link>
          ))}
        </nav>

        <h3 className={styles.subheading}>{t("faqTitle")}</h3>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <details key={faq.question} className={styles.faqItem}>
              <summary>{t(`faqs.${index}.question`)}</summary>
              <p>{t(`faqs.${index}.answer`)}</p>
            </details>
          ))}
        </div>

        <p className={styles.cta}>
          <Link href="/rental-terms">{t("termsLink")}</Link>
          <span aria-hidden="true"> · </span>
          <Link href="/privacy">{t("privacyLink")}</Link>
          <span aria-hidden="true"> · </span>
          <Link href="/contact">{t("contactLink")}</Link>
        </p>
      </div>
    </section>
  );
}
