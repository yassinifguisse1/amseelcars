"use client";

import styles from "./style.module.scss";
import Image from "next/image";
import Rounded from "../../common/RoundedButton";
import { useRef } from "react";
import { useScroll, motion, useTransform } from "framer-motion";
import Magnetic from "../../common/Magnetic";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Same marques / order as the “Marque” filter on /cars (see FilterBar). */
const LOCATION_VOITURE_AGADIR_BRANDS = [
  "BMW",
  "Citroën",
  "Dacia",
  "Hyundai",
  "Kia",
  "Renault",
  "Volkswagen",
] as const;

const FOOTER_BLOG_ARTICLES = [
  {
    labelKey: "blogLocationAgadir" as const,
    params: { category: "guide-pratique", slug: "location-de-voiture-a-agadir" },
  },
  {
    labelKey: "blogJetSki" as const,
    params: { category: "guide-pratique", slug: "jet-ski" },
  },
  {
    labelKey: "blogSurfSpots" as const,
    params: { category: "guide-pratique", slug: "spots-surf-agadir" },
  },
  {
    labelKey: "blogActivities" as const,
    params: { category: "guide-pratique", slug: "activites-a-agadir" },
  },
  {
    labelKey: "blogGolf8" as const,
    params: { category: "guide-pratique", slug: "golf-8-2024" },
  },
  {
    labelKey: "blogClio5" as const,
    params: {
      category: "guide-pratique",
      slug: "location-voiture-agadir-clio-5",
    },
  },
  {
    labelKey: "blogTouareg" as const,
    params: {
      category: "guide-pratique",
      slug: "location-voiture-agadir-touareg",
    },
  },
] as const;

export default function Footer() {
  const t = useTranslations("footer");
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-100, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [90, 90]);

  const waHref = `https://wa.me/212662500181/?text=${encodeURIComponent(
    t("whatsappPrefill"),
  )}`;
  const year = new Date().getFullYear();

  return (
    <motion.div style={{ y }} ref={container} className={styles.footer}>
      <div className={styles.body}>
        <div className={styles.title}>
          <span>
            <div className={styles.imageContainer}>
              <Image
                fill
                alt={t("logoAlt")}
                src="/images/amseel-car-logo.png"
              />
            </div>
            <h2>{t("titleLine1")}</h2>
          </span>
          <h2>{t("titleLine2")}</h2>
          <motion.svg
            style={{ rotate, scale: 2 }}
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 8.5C8.27614 8.5 8.5 8.27614 8.5 8L8.5 3.5C8.5 3.22386 8.27614 3 8 3C7.72386 3 7.5 3.22386 7.5 3.5V7.5H3.5C3.22386 7.5 3 7.72386 3 8C3 8.27614 3.22386 8.5 3.5 8.5L8 8.5ZM0.646447 1.35355L7.64645 8.35355L8.35355 7.64645L1.35355 0.646447L0.646447 1.35355Z"
              fill="white"
            />
          </motion.svg>
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-sm font-normal leading-relaxed text-gray-400 md:mt-8 md:text-base">
          {t("tagline")}
        </p>
        <div className={styles.nav}>
          <Rounded>
            <a href="mailto:amseelcars5@gmail.com">
              <p>amseelcars5@gmail.com</p>
            </a>
          </Rounded>
          <Rounded>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>{t("whatsappLine")}</p>
            </a>
          </Rounded>
        </div>
        <aside
          className={`${styles.footerColumns} text-sm leading-relaxed text-gray-400`}
          aria-label={t("asideAria")}
        >
          <div>
            <p className="font-medium text-white/90">{t("companyBlockTitle")}</p>
            <p className="mt-2">{t("address")}</p>
            <ul className="mt-4 space-y-2">
              <li>
                {t("phoneWhatsappLabel")}{" "}
                <a
                  href="tel:+212662500181"
                  className="underline-offset-2 hover:underline"
                >
                  +212 662 500 181
                </a>
              </li>
              <li>
                {t("emailLabel")}{" "}
                <a
                  href="mailto:amseelcars5@gmail.com"
                  className="underline-offset-2 hover:underline"
                >
                  amseelcars5@gmail.com
                </a>
              </li>
              <li>{t("hoursLine")}</li>
            </ul>
          </div>
          <div className={styles.footerColCenter}>
            <h3 className={styles.footerColTitle}>{t("quickLinksTitle")}</h3>
            <nav
              className={styles.footerColLinks}
              aria-label={t("quickLinksNavAria")}
            >
              <Link href="/cars">{t("fleet")}</Link>
              <Link href="/location-voiture-agadir">{t("agadirRental")}</Link>
              <Link href="/agadir-airport-car-rental">{t("airport")}</Link>
              <Link href="/taghazout-car-rental">{t("taghazout")}</Link>
              <Link href="/about">{t("about")}</Link>
              <Link href="/contact">{t("contact")}</Link>
            </nav>
          </div>
          <div>
            <h3 className={styles.footerColTitle}>
              <Link href="/cars">{t("brandsColumnTitle")}</Link>
            </h3>
            <nav
              className={styles.footerColLinks}
              aria-label={t("brandsNavAria")}
            >
              {LOCATION_VOITURE_AGADIR_BRANDS.map((brand) => (
                <Link
                  key={brand}
                  href={{
                    pathname: "/cars",
                    query: { brand },
                  }}
                >
                  {t("brandLink", { brand })}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h3 className={styles.footerColTitle}>
              <Link href="/blog" locale="fr">{t("blogColumnTitle")}</Link>
            </h3>
            <nav
              className={styles.footerColLinks}
              aria-label={t("blogNavAria")}
            >
              {FOOTER_BLOG_ARTICLES.map(({ labelKey, params }) => (
                <Link
                  key={`${params.category}/${params.slug}`}
                  href={{ pathname: "/blog/[category]/[slug]", params }}
                  locale="fr"
                >
                  {t(labelKey)}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <div className={styles.info}>
          <div>
            <span>
              <p>{t("copyrightEdition", { year })}</p>
            </span>
            <span>
              <p>
                {t("developedBy")}{" "}
                <a
                  href="https://itagroupe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("developerLinkLabel")}
                </a>
              </p>
            </span>
          </div>
          <nav
            className={styles.infoSocials}
            aria-label={t("socialNavAria")}
          >
            <Magnetic>
              <a
                href="https://www.instagram.com/amseelcarsofficial/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <p>{t("instagram")}</p>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="https://www.facebook.com/people/Amseel-Cars/61582652224473/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <p>{t("facebook")}</p>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="https://www.tiktok.com/@amseelcars"
                target="_blank"
                rel="noopener noreferrer"
              >
                <p>{t("tiktok")}</p>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="https://www.pinterest.com/amseelcars/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <p>{t("pinterest")}</p>
              </a>
            </Magnetic>
          </nav>
        </div>
      </div>
    </motion.div>
  );
}
