import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import React, { useRef } from "react";
import styles from "./style.module.scss";
// import { slideUp, opacity } from './animation';

interface ParagraphProps {
  paragraph: string;
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

interface CharProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

export default function Paragraph({ paragraph }: ParagraphProps) {
  const container = useRef<HTMLParagraphElement>(null);

  // Responsive scroll trigger offsets
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.2"], // Adjusted for better mobile experience
  });

  const words = paragraph.split(" ");

  return (
    <div className="w-full flex justify-center items-center px-4 sm:px-6 lg:px-8s ">
      <p ref={container} className={`${styles.paragraph} font-bold`}>
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;

          return (
            <Word key={i} progress={scrollYProgress} range={[start, end]}>
              {word}
            </Word>
          );
        })}
      </p>
    </div>
  );
}

const Word = ({ children, progress, range }: WordProps) => {
  const amount = range[1] - range[0];

  const step = amount / children.length;

  return (
    <span className={styles.word}>
      {children.split("").map((char, i) => {
        const start = range[0] + i * step;

        const end = range[0] + (i + 1) * step;

        return (
          <Char key={`c_${i}`} progress={progress} range={[start, end]}>
            {char}
          </Char>
        );
      })}
    </span>
  );
};
const Char = ({ children, progress, range }: CharProps) => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span>
      <span className={styles.shadow}>{children}</span>

      <motion.span style={{ opacity: opacity }}>{children}</motion.span>
    </span>
  );
};
