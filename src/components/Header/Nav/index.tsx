import { perspective, slideIn } from "./anim";
import { footerLinks, links } from "./data";
import styles from "./style.module.scss";
import { motion } from "framer-motion";
import Link from "next/link";

interface NavProps {
  closeMenu: () => void;
}

export default function Nav({ closeMenu }: NavProps) {
  return (
    <div className={styles.nav}>
      <div className={styles.body}>
        {links.map((link, i) => {
          const { title, href } = link;
          return (
            <div key={`b_${i}`} className={styles.linkContainer}>
              <motion.div
                custom={i}
                variants={perspective}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <Link href={href} onClick={closeMenu}>{title}</Link>
              </motion.div>
            </div>
          );
        })}
      </div>
      <motion.div className={styles.footer}>
        {footerLinks.map((link, i) => {
          const { title, href } = link;
          return (
            <motion.div
              variants={slideIn}
              custom={i}
              initial="initial"
              animate="enter"
              exit="exit"
              key={`f_${i}`}
            >
              <Link href={href} onClick={closeMenu}>{title}</Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
