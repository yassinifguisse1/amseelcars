"use client";
import { useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Button from "./Button";
import styles from "./style.module.scss";
import Nav from "./Nav";

/** Only animate how it opens; the size is controlled by CSS (responsive). */
const menuVariants: Variants = {
  open: {
    scale: 1,
    borderRadius: 24,
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
    visibility: "visible",
  },
  closed: {
    scale: 0.001, // avoids scale=0 issues
    borderRadius: 999,
    transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] },
    transitionEnd: { visibility: "hidden" }
  }
};

export default function Index() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={styles.header}>
      <motion.div
        id="site-menu"
        className={styles.menu}
        variants={menuVariants}
        animate={isActive ? "open" : "closed"}
        initial="closed"
        style={{
          transformOrigin: "top right",
          pointerEvents: isActive ? "auto" : "none",
        }}
      >
        <AnimatePresence>
          {isActive && <Nav closeMenu={() => setIsActive(false)} />}
        </AnimatePresence>
      </motion.div>

      <div className={styles.bar}>
        <div className={styles.menuButtonWrap}>
          <Button
            isActive={isActive}
            toggleMenu={() => setIsActive((v) => !v)}
            aria-expanded={isActive}
            aria-controls="site-menu"
          />
        </div>
      </div>
    </div>
  );
}
