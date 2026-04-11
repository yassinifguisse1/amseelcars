import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import styles from "./style.module.scss";

interface ButtonProps {
  isActive: boolean;
  toggleMenu: () => void;
}

export default function Button({ isActive, toggleMenu }: ButtonProps) {
  const t = useTranslations("nav");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event bubbling
    toggleMenu();
  };

  return (
    <div className={styles.button}>
      <motion.div
        className={styles.slider}
        animate={{ top: isActive ? "-100%" : "0%" }}
        transition={{ duration: 0.5, type: "tween", ease: [0.76, 0, 0.24, 1] }}
      >
        <div
          className={styles.el}
         onClick={handleClick} // Use the new handler
          style={{ pointerEvents: 'auto' }} // Ensure clicks work
        >
          <PerspectiveText label={t("menu")} />
        </div>
        <div
          className={styles.el}
          onClick={handleClick} // Use the new handler
          style={{ pointerEvents: 'auto' }} // Ensure clicks work
        >
          <PerspectiveText label={t("close")} />
        </div>
      </motion.div>
    </div>
  );
}

interface PerspectiveTextProps {
  label: string;
}

function PerspectiveText({ label }: PerspectiveTextProps) {
  return (
    <div className={styles.perspectiveText}>
      <p>{label}</p>
      <p>{label}</p>
    </div>
  );
}

/** Reusable pill button that matches the menu button design (red #EC1C25, rounded, perspective text hover). */
export function MenuStyleButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onClick();
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${styles.button} ${className ?? ""}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={styles.slider} style={{ top: 0 }}>
        <div className={styles.el} style={{ pointerEvents: "auto" }}>
          <PerspectiveText label={label} />
        </div>
      </div>
    </div>
  );
}
