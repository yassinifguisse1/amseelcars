import { perspective, slideIn } from "./anim";
import { mainNavItems, socialNavItems } from "./data";
import { HeaderLocaleSelect } from "@/components/Header/LocaleSelect";
import styles from "./style.module.scss";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface NavProps {
  closeMenu: () => void;
}

export default function Nav({ closeMenu }: NavProps) {
  const t = useTranslations("nav");

  return (
    <div className={styles.nav}>
      <div className={styles.body}>
        {mainNavItems.map((item, i) => (
          <div key={`b_${item.href}`} className={styles.linkContainer}>
            <motion.div
              custom={i}
              variants={perspective}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <Link href={item.href} onClick={closeMenu}>
                {t(item.messageKey)}
              </Link>
            </motion.div>
          </div>
        ))}
      </div>
      <div className={styles.localeRow}>
        <HeaderLocaleSelect closeMenu={closeMenu} />
      </div>
      <motion.div className={styles.footer}>
        {socialNavItems.map((item, i) => (
          <motion.div
            variants={slideIn}
            custom={i}
            initial="initial"
            animate="enter"
            exit="exit"
            key={item.href}
          >
            <a href={item.href} onClick={closeMenu} rel="noopener noreferrer">
              {t(item.messageKey)}
            </a>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
