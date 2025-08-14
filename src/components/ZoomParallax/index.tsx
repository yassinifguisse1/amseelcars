"use client"
import styles from './styles.module.scss';
import Picture1 from '../../../public/images/golf.jpeg';
import Picture2 from '../../../public/images/2.jpeg';
import Picture3 from '../../../public/images/3.jpg';
import Picture4 from '../../../public/images/4.jpg'
import Picture5 from '../../../public/images/5.jpg'
import Picture6 from '../../../public/images/6.jpg'
// import Picture7 from '../../../public/images/7.jpeg'
import Image from 'next/image';
import { useScroll, useTransform, motion} from 'framer-motion';
import { useRef, useEffect } from 'react';
import { type Variants, cubicBezier } from 'framer-motion';
import { gsap } from 'gsap';

const float: Variants = {
    initial: { y: 0 },
    animate: {
        y: [0, -8, 0],
        transition: { duration: 4, repeat: Infinity, repeatType: 'mirror', ease: cubicBezier(0.42, 0, 0.58, 1) }
    }
}

export default function Index() {
    
    const container = useRef<HTMLDivElement | null>(null);
    const plan1 = useRef<HTMLDivElement | null>(null);

    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end']
    })

    const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
    const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
    const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
    const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
    // const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

    const pictures = [
        { src: Picture1, scale: scale4, cls: styles.t1 },
        { src: Picture2, scale: scale5, cls: styles.t2 },
        { src: Picture3, scale: scale6, cls: styles.t3 },
        { src: Picture4, scale: scale5, cls: styles.t4 },
        { src: Picture5, scale: scale6, cls: styles.t5 },
        { src: Picture6, scale: scale8, cls: styles.t6 },
        // { src: Picture7, scale: scale9, cls: styles.t6 },
    ]

    const requestAnimationFrameId = useRef<number | null>(null);
    const xForce = useRef(0);
    const yForce = useRef(0);
    const easing = 0.08;
    const speed = 0.01;
  
  
  
    const manageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { movementX, movementY } = e;
        
        xForce.current += movementX * speed;
        yForce.current += movementY * speed;
        
        if(requestAnimationFrameId.current == null){
            requestAnimationFrameId.current = requestAnimationFrame(animate);
        }
    }
  
  
  
    const lerp = (start: number, target: number, amount: number): number =>
        start * (1 - amount) + target * amount;
    
    const animate = () => {
        xForce.current = lerp(xForce.current, 0, easing);
        yForce.current = lerp(yForce.current, 0, easing);
        
        if (plan1.current) {
            gsap.set(plan1.current, {x: `+=${xForce.current}`, y: `+=${yForce.current}`});
        }
        
        if(Math.abs(xForce.current) < 0.01) xForce.current = 0;
        if(Math.abs(yForce.current) < 0.01) yForce.current = 0;
        
        if(xForce.current != 0 || yForce.current != 0){
            requestAnimationFrameId.current = requestAnimationFrame(animate);
        } else {
            if (requestAnimationFrameId.current !== null) {
                cancelAnimationFrame(requestAnimationFrameId.current);
            }
            requestAnimationFrameId.current = null;
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (requestAnimationFrameId.current !== null) {
                cancelAnimationFrame(requestAnimationFrameId.current);
            }
        };
    }, []);

    return (
        <div ref={container} onMouseMove={(e) => {manageMouseMove(e)}} className={styles.container} >
            <div className={styles.sticky} ref={plan1}>
                {
                    pictures.map( ({src, scale, cls}, index) => {
                        return <motion.div  key={index} style={{scale}} className={`${styles.el} ${cls}`} variants={float} initial="initial" animate="animate">
                            <div className={styles.imageContainer} >
                                <Image
                                    src={src}
                                    fill
                                    alt="image"
                                    placeholder='blur'
                                    className='rounded-2xl'
                                    
                                />
                            </div>
                            
                          
                        </motion.div>
                    })
                }
               
            </div>
            {/* <div className='flex items-center justify-center mx-auto border-2 border-amber-300'>
               <h1 className='text-center border-2 border-amber-300 w-full text-4xl'>
                 Lorem ipsum dolor sit amet, consectetur adipisicing elit.
               </h1>
             </div> */}
            
        </div>
    )
}