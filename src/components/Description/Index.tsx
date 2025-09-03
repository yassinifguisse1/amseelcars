"use client";
import styles from "./style.module.scss";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import Rounded from "../../common/RoundedButton";
import Paragraph from "../Paragraph/Character";
export default function Index() {
  const router = useRouter();
  const description = useRef<HTMLDivElement>(null);
  const paragraph =
    "No hidden fees, no confusing terms. Just clear pricing and reliable vehicles. From compact cars to spacious SUVs, every ride is backed by full coverage and 24/7 support. Renting a car has never been this easy.";

  const handleAboutClick = () => {
    router.push("/about");
  };

  return (
    <div ref={description} className={`${styles.description} w-full `} >
      <div className={`${styles.body}`}>
        <div className="flex-1 w-full">
          <Paragraph paragraph={paragraph} />
        </div>

        <div data-scroll data-scroll-speed={0.1} className="md:relative">
          {/* <Rounded className={styles.button} onClick={handleAboutClick}>
            <p>About us</p>
          </Rounded> */}
          <Rounded
              backgroundColor="#D32F2F"
              aria-label="About us"
              onClick={handleAboutClick}
             
            >
              <p className="z-10 text-white  ">About us</p>
            </Rounded>
        </div>
      </div>
    </div>
  );
}
