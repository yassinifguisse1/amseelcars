"use client";
import styles from "./style.module.css";
import { motion, Variants } from "framer-motion";
import { useState } from "react";

interface ProjectType {
  title1: string;
  title2: string;
  src: string;
}

interface ProjectProps {
  project: ProjectType;
}

const anim: Variants = {
  initial: { width: 0 },
  open: {
    width: "auto",
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    },
  },
  closed: { width: 0 },
};

export default function Project({ project }: ProjectProps) {
  const [isActive, setIsActive] = useState(false);

  const { title1, title2, src } = project;
  return (
    <div
      onMouseEnter={() => {
        setIsActive(true);
      }}
      onMouseLeave={() => {
        setIsActive(false);
      }}
      className={styles.project}
    >
      <p className='tex text-white'>{title1}</p>
      <motion.div
        variants={anim}
        animate={isActive ? "open" : "closed"}
        className={styles.imgContainer}
      >
        {/* <Image
          src={`/images/${src}`}
          alt={`${title1} ${title2} project`}
          fill
          style={{ objectFit: "cover" }}

        /> */}
        <img src={`${src}`}></img>
      </motion.div>
      <p className='tex text-white'>{title2}</p>
    </div>
  );
}
