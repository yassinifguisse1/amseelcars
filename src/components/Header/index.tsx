// "use client";
// import { useState } from "react";
// import { AnimatePresence, motion, Variants } from "framer-motion";
// import Button from "./Button";
// import styles from "./style.module.scss";
// import Nav from "./Nav";

// const menu: Variants = {
//   open: {
//     width: "480px",
//     height: "650px",
//     top: "-25px",
//     right: "-25px",
//     transition: {
//       duration: 0.75,
//       type: "tween" as const,
//       ease: [0.76, 0, 0.24, 1] as const,
//     },
//   },
//   closed: {
//     width: "100px",
//     height: "40px",
//     top: "0px",
//     right: "0px",
//     transition: {
//       duration: 0.75,
//       delay: 0.35,
//       type: "tween" as const,
//       ease: [0.76, 0, 0.24, 1] as const,
//     },
//   },
// };

// export default function Index() {
//   const [isActive, setIsActive] = useState(false);

//   const closeMenu = () => {
//     setIsActive(false);
//   };

//   return (
//     <div className={styles.header}>
//       <motion.div
//         className={styles.menu}
//         variants={menu}
//         animate={isActive ? "open" : "closed"}
//         initial="closed"
//       >
//         <AnimatePresence>
//           {isActive && <Nav closeMenu={closeMenu} />}
//         </AnimatePresence>
//       </motion.div>
//       <Button
//         isActive={isActive}
//         toggleMenu={() => {
//           setIsActive(!isActive);
//         }}
//       />
//     </div>
//   );
// }
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
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] }
  },
  closed: {
    scale: 0.001, // avoids scale=0 issues
    borderRadius: 999,
    transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] }
  }
};

export default function Index() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={styles.header}>
      <motion.div
        className={styles.menu}
        variants={menuVariants}
        animate={isActive ? "open" : "closed"}
        initial="closed"
        style={{ transformOrigin: "top right" }}
        aria-hidden={!isActive}
      >
        <AnimatePresence>{isActive && <Nav closeMenu={() => setIsActive(false)} />}</AnimatePresence>
      </motion.div>

      <Button
        isActive={isActive}
        toggleMenu={() => setIsActive((v) => !v)}
        aria-expanded={isActive}
        aria-controls="site-menu"
      />
    </div>
  );
}
