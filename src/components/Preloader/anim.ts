import { type Variants, cubicBezier } from 'framer-motion';

export const opacity: Variants = {
    initial: {
        opacity: 0
    },
    enter: {
        opacity: 0.75,
        transition: { duration: 1, delay: 0.2 }
    },
};

export const slideUp: Variants = {
    initial: {
        y: 0
    },
    exit: {
        y: "-100vh",
        transition: { duration: 0.8, ease: cubicBezier(0.76, 0, 0.24, 1), delay: 0.2 }
    }
};