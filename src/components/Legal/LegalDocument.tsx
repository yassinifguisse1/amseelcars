"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Footer from "@/components/Footer/Footer";
import styles from "./LegalDocument.module.css";

type LegalNamespace = "rentalTerms" | "privacy" | "legalNotice";

type LegalDocumentProps = {
  namespace: LegalNamespace;
};

export function LegalDocument({ namespace }: LegalDocumentProps) {
  const t = useTranslations(`legalPages.${namespace}`);
  const tCommon = useTranslations("legalPages");
  const tFooter = useTranslations("footer");

  const sectionCount = t.raw("sections") as Array<{
    title: string;
    paragraphs: string[];
  }>;

  return (
    <>
      <main className={styles.main}>
        <article className={styles.article}>
          <p className={styles.eyebrow}>
            <Link href="/">{tFooter("companyBlockTitle")}</Link>
          </p>
          <h1 className={styles.title}>{t("h1")}</h1>
          <p className={styles.updated}>
            {tCommon("lastUpdatedLabel")}: {tCommon("lastUpdatedDate")}
          </p>
          <p className={styles.intro}>{t("intro")}</p>

          {sectionCount.map((section, index) => (
            <section key={section.title} className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {t(`sections.${index}.title`)}
              </h2>
              {(t.raw(`sections.${index}.paragraphs`) as string[]).map(
                (paragraph, pIndex) => (
                  <p key={pIndex} className={styles.paragraph}>
                    {paragraph}
                  </p>
                ),
              )}
            </section>
          ))}

          <nav className={styles.related} aria-label={tCommon("relatedNavAria")}>
            <Link href="/rental-terms">{tFooter("rentalTerms")}</Link>
            <Link href="/privacy">{tFooter("privacy")}</Link>
            <Link href="/legal">{tFooter("legal")}</Link>
            <Link href="/contact">{tFooter("contact")}</Link>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}
