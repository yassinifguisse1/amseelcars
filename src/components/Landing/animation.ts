import { type Variants, cubicBezier } from 'framer-motion';

export const slideUp: Variants = {
    initial: {
        y: 300
    },
    enter: {
        y: 0,
        transition: { duration: 0.6, ease: cubicBezier(0.33, 1, 0.68, 1), delay: 2.5 }
    }
};