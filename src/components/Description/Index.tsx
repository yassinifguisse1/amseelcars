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
    "Are Dictacted by the position of the word inside the paragraph. If the word is at the beginning of the paragraph, then it will have an earlier start and end point.";

  const handleAboutClick = () => {
    router.push("/about");
  };

  return (
    <div ref={description} className={styles.description}>
      <div className={styles.body}>
        <div className="flex-1 ">
          <Paragraph paragraph={paragraph} />
        </div>

        <div data-scroll data-scroll-speed={0.1} className="md:relative">
          <Rounded className={styles.button} onClick={handleAboutClick}>
            <p>About me</p>
          </Rounded>
        </div>
      </div>
    </div>
  );
}
