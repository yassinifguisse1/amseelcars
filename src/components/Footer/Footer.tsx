import styles from './style.module.scss';
import Image from 'next/image';
import Rounded from '../../common/RoundedButton';
import { useRef } from 'react';
import { useScroll, motion, useTransform } from 'framer-motion';
import Magnetic from '../../common/Magnetic';
import Link from 'next/link';

export default function Footer() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "end end"]
    })
    const x = useTransform(scrollYProgress, [0, 1], [0, 100])
    const y = useTransform(scrollYProgress, [0, 1], [-100, 0])
    const rotate = useTransform(scrollYProgress, [0, 1], [90, 90])
    return (
        <motion.div style={{y}} ref={container} className={styles.footer}>
            <div className={styles.body}>
                <div className={styles.title}>
                    <span>
                        <div className={styles.imageContainer}>
                            <Image 
                            fill={true}
                            alt={"image"}
                            src={`/images/amseel-car-logo.png`}
                            />
                        </div>
                        <h2>Let&apos;s Get</h2>
                    </span>
                    <h2>You a Car</h2>
                 
                    <motion.svg style={{rotate, scale: 2}} width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8.5C8.27614 8.5 8.5 8.27614 8.5 8L8.5 3.5C8.5 3.22386 8.27614 3 8 3C7.72386 3 7.5 3.22386 7.5 3.5V7.5H3.5C3.22386 7.5 3 7.72386 3 8C3 8.27614 3.22386 8.5 3.5 8.5L8 8.5ZM0.646447 1.35355L7.64645 8.35355L8.35355 7.64645L1.35355 0.646447L0.646447 1.35355Z" fill="white"/>
                    </motion.svg>
                </div>
                <div className={styles.nav}>
                        <Rounded>
                            <Link href="mailto:contact@amseelcars.com" >
                            <p>contact@amseelcars.com</p>
                            </Link>
                        </Rounded>
                        <Rounded>
                            <Link href="tel:+212662500181">
                            <p>+212 662 500 181</p>
                            </Link>
                        </Rounded>
                </div>
                <div className={styles.info}>
                    <div>
                        <span>
                            <h3>Version</h3>
                            <p>2025 © Edition</p>
                        </span>
                        {/* <span>
                            <h3>Version</h3>
                            <p>11:49 PM GMT+2</p>
                        </span> */}
                    </div>
                    <div>
                        <span>
                            <h3>socials</h3>
                            <Magnetic>
                                <p>AmseelCars</p>
                            </Magnetic>
                        </span>
                        <Magnetic>
                            <p>Instagram</p>
                        </Magnetic>
                       
                        <Magnetic>
                            <p>Facebook</p>
                        </Magnetic>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}