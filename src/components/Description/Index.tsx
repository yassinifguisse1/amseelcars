"use client";
import styles from "./style.module.scss";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Rounded from "../../common/RoundedButton";
import Paragraph from "../Paragraph/Character";

export default function Index() {
  const t = useTranslations("home.story");
  const router = useRouter();
  const description = useRef<HTMLDivElement>(null);

  const bullets = t.raw("bullets") as string[];

  const handleAboutClick = () => {
    router.push("/about");
  };

  return (
    <div ref={description} className={`${styles.description} w-full `} >
      <div className={`${styles.body}`}>
        <div className="flex-1 w-full">
          <Paragraph bullets={bullets} />
        </div>

        <div data-scroll data-scroll-speed={0.1} className="md:relative">
         
          <Rounded
              backgroundColor="#D32F2F"
              aria-label={t("aboutAriaLabel")}
              onClick={handleAboutClick}
             
            >
              <p className="z-10 text-white  ">{t("aboutCta")}</p>
            </Rounded>
        </div>

        {/* SEO: supporting local copy before “Nos Marques” — keeps narrative layout intact */}
        <p
          className={`${styles.seoIntroSerif} mt-10 max-w-3xl text-center leading-[1.3] text-white break-words md:mx-auto`}
        >
          <span className="block whitespace-nowrap text-[#CB1939] text-[30px] font-bold tracking-[-0.02em] md:text-[40px] lg:text-[46px]">
            {t("heading")}
          </span>
          <span className="block mt-3 text-[22px] font-normal leading-[1.35] tracking-[-0.02em] md:text-[30px] md:leading-[1.3] md:tracking-[-0.015em] lg:text-[34px] lg:leading-[1.25] lg:tracking-[-0.01em]">
            {t("description")}
          </span>
        </p>
      </div>
    </div>
  );
}
