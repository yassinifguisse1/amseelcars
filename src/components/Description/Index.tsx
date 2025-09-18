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
      </div>
    </div>
  );
}
