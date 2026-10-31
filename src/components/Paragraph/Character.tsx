import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import React, { useRef } from "react";
import styles from "./style.module.scss";

interface ParagraphProps {
  bullets: string[];
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

export default function Paragraph({ bullets }: ParagraphProps) {
  const container = useRef<HTMLUListElement>(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.2"],
  });

  const wordsPerItem = bullets.map((item) => item.split(" "));
  const totalWords = wordsPerItem.reduce((acc, w) => acc + w.length, 0);

  let wordIndex = 0;
  return (
    <div className="w-full flex justify-center items-start px-4 sm:px-6 lg:px-8">
      <ul
        ref={container}
        className={`${styles.paragraph} list-disc pl-6 space-y-3`}
      >
        {wordsPerItem.map((words, liIdx) => (
          <li
            key={`li_${liIdx}`}
            className="marker:text-current marker:font-semibold"
          >
            <span className={styles.word}>
              {words.map((word, i) => {
                const start = wordIndex / totalWords;
                const end = (wordIndex + 1) / totalWords;
                wordIndex++;

                return (
                  <Word
                    key={`w_${liIdx}_${i}`}
                    progress={scrollYProgress}
                    range={[start, end]}
                  >
                    {word}
                  </Word>
                );
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Word = ({ children, progress, range }: WordProps) => {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <motion.span style={{ opacity }} className={styles.word}>
      {children}{" "}
    </motion.span>
  );
};
