"use client"
import { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, motion} from 'framer-motion';
import Image from 'next/image';
// import { gsap } from 'gsap';
import styles from './styles.module.scss';

// Import images
import Picture2 from '../../../public/images/kia.jpg';
import Picture3 from '../../../public/images/bmwx3.webp';
import Picture4 from '../../../public/images/tRok.jpg'
import Picture5 from '../../../public/images/clio.jpg'
import Picture6 from '../../../public/images/touaregggg.webp'

export default function ZoomParallaxClient() {
    const container = useRef<HTMLDivElement>(null);
    // const plan1 = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end']
    })

    const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
    const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
    const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
    const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);

    const pictures = [
        { src: '/video/centercar.mp4', scale: scale4, cls: styles.t1, isVideo: true },
        { src: Picture2, scale: scale5, cls: styles.t2, isVideo: false },
        { src: Picture3, scale: scale6, cls: styles.t3, isVideo: false },
        { src: Picture4, scale: scale5, cls: styles.t4, isVideo: false },
        { src: Picture5, scale: scale6, cls: styles.t5, isVideo: false },
        { src: Picture6, scale: scale8, cls: styles.t6, isVideo: false },
    ]

    const requestAnimationFrameId = useRef<number | null>(null);
    const xForce = useRef(0);
    const yForce = useRef(0);
    const easing = 0.08;
    const speed = 0.01;

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const manageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        // Disable mouse effects on mobile for better performance
        if (isMobile) return;
        
        const { movementX, movementY } = e;
        
        xForce.current += movementX * speed;
        yForce.current += movementY * speed;
        
        // if(requestAnimationFrameId.current == null){
        //     requestAnimationFrameId.current = requestAnimationFrame(animate);
        // }
    }

    const lerp = (start: number, target: number, amount: number): number =>
        start * (1 - amount) + target * amount;
    
    // const animate = () => {
    //     xForce.current = lerp(xForce.current, 0, easing);
    //     yForce.current = lerp(yForce.current, 0, easing);
        
    //     if (plan1.current) {
    //         gsap.set(plan1.current, {x: `+=${xForce.current}`, y: `+=${yForce.current}`});
    //     }
        
    //     if(Math.abs(xForce.current) < 0.01) xForce.current = 0;
    //     if(Math.abs(yForce.current) < 0.01) yForce.current = 0;
        
    //     if(xForce.current != 0 || yForce.current != 0){
    //         requestAnimationFrameId.current = requestAnimationFrame(animate);
    //     } else {
    //         if (requestAnimationFrameId.current !== null) {
    //             cancelAnimationFrame(requestAnimationFrameId.current);
    //         }
    //         requestAnimationFrameId.current = null;
    //     }
    // }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (requestAnimationFrameId.current !== null) {
                cancelAnimationFrame(requestAnimationFrameId.current);
            }
        };
    }, []);

    return (
        <div 
            ref={container} 
            onMouseMove={!isMobile ? (e) => manageMouseMove(e) : undefined} 
            className={styles.container}
            style={{ touchAction: isMobile ? 'pan-y' : 'auto' }}
        >
            <div className={styles.sticky} >
                {
                    pictures.map( ({src, scale, cls, isVideo}, index) => {
                        return (
                            <motion.div  
                                key={index} 
                                style={{scale}} 
                                className={`${styles.el} ${cls}`}
                            >
                                <div className={styles.imageContainer}>
                                    {isVideo ? (
                                        <video
                                            src={src as string}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="metadata"
                                            className='w-full h-full object-cover rounded-2xl'
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <Image
                                            src={src}
                                            fill
                                            alt={`Car image ${index + 1}`}
                                            placeholder='blur'
                                            className='rounded-2xl'
                                            sizes={isMobile ? 
                                                "(max-width: 480px) 35vw, (max-width: 768px) 40vw, 25vw" : 
                                                "(max-width: 1200px) 25vw, 320px"
                                            }
                                            priority={index < 3} // Prioritize first 3 images
                                        />
                                    )}
                                </div>
                            </motion.div>
                        )
                    })
                }
            </div>
        </div>
    )
} 