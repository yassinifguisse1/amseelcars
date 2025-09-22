import { motion } from "framer-motion";
import styles from "./style.module.scss";

interface ButtonProps {
  isActive: boolean;
  toggleMenu: () => void;
}

export default function Button({ isActive, toggleMenu }: ButtonProps) {
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
          <PerspectiveText label="Menu" />
        </div>
        <div
          className={styles.el}
          onClick={handleClick} // Use the new handler
          style={{ pointerEvents: 'auto' }} // Ensure clicks work
        >
          <PerspectiveText label="Close" />
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
