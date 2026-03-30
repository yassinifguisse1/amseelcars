"use client";
import styles from "./style.module.scss";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import Rounded from "../../common/RoundedButton";
import Paragraph from "../Paragraph/Character";
export default function Index() {
  const router = useRouter();
  const description = useRef<HTMLDivElement>(null);

  const bullets = [
    "Aucun frais caché, aucune condition déroutante : tarifs clairs et véhicules fiables.",
    "Des citadines aux SUV spacieux : chaque trajet bénéficie d’une couverture complète et d’une assistance 24h/24 et 7j/7.",
    "Louer une voiture n’a jamais été aussi simple."
  ];
  
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
              aria-label="About us"
              onClick={handleAboutClick}
             
            >
              <p className="z-10 text-white  ">À propos de nous</p>
            </Rounded>
        </div>

        {/* SEO: supporting local copy before “Nos Marques” — keeps narrative layout intact */}
        <p
          className={`${styles.seoIntroSerif} mt-10 max-w-3xl text-center leading-[1.3] text-white break-words md:mx-auto`}
        >
          <span className="block whitespace-nowrap text-[#CB1939] text-[30px] font-bold tracking-[-0.02em] md:text-[40px] lg:text-[46px]">
            AMSEEL CARS
          </span>
          <span className="block mt-3 text-[22px] font-normal leading-[1.35] tracking-[-0.02em] md:text-[30px] md:leading-[1.3] md:tracking-[-0.015em] lg:text-[34px] lg:leading-[1.25] lg:tracking-[-0.01em]">
            accompagne vos besoins de location de voiture à Agadir avec une flotte récente, des conditions claires, une assistance 24/7 et des solutions adaptées aux séjours touristiques comme aux déplacements professionnels.
          </span>
        </p>
      </div>
    </div>
  );
}
