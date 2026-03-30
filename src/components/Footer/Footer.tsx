"use client"
import styles from './style.module.scss';
import Image from 'next/image';
import Rounded from '../../common/RoundedButton';
import { useRef } from 'react';
import { useScroll, motion, useTransform } from 'framer-motion';
import Magnetic from '../../common/Magnetic';
import Link from 'next/link';

/** Same marques / order as the “Marque” filter on /cars (see FilterBar). */
const LOCATION_VOITURE_AGADIR_BRANDS = [
  "BMW",
  "Citroën",
  "Dacia",
  "Hyundai",
  "Kia",
  "Renault",
  "Volkswagen",
] as const;

const FOOTER_BLOG_LINKS = [
  { label: "Location voiture agadir", href: "/blog/guide-pratique/location-de-voiture-a-agadir" },
  { label: "Jet ski à Agadir", href: "/blog/guide-pratique/jet-ski" },
  { label: "Spots Surf Agadir", href: "/blog/guide-pratique/spots-surf-agadir" },
  { label: "Activités à Agadir", href: "/blog/guide-pratique/activites-a-agadir" },
  { label: "Louez le Golf 8", href: "/blog/guide-pratique/golf-8-2024" },
  { label: "Louez la Clio 5", href: "/blog/guide-pratique/location-voiture-agadir-clio-5" },
  { label: "Louez la Touareg 2025", href: "/blog/guide-pratique/location-voiture-agadir-touareg" },
] as const;

export default function Footer() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "end end"]
    })
    // const x = useTransform(scrollYProgress, [0, 1], [0, 100])
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
                        <h2>Trouvons</h2>
                    </span>
                    <h2>Votre Voiture</h2>
                    <motion.svg style={{rotate, scale: 2}} width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8.5C8.27614 8.5 8.5 8.27614 8.5 8L8.5 3.5C8.5 3.22386 8.27614 3 8 3C7.72386 3 7.5 3.22386 7.5 3.5V7.5H3.5C3.22386 7.5 3 7.72386 3 8C3 8.27614 3.22386 8.5 3.5 8.5L8 8.5ZM0.646447 1.35355L7.64645 8.35355L8.35355 7.64645L1.35355 0.646447L0.646447 1.35355Z" fill="white"/>
                    </motion.svg>
                </div>
                {/* SEO: local positioning line under hero heading cluster */}
                <p className="mx-auto mt-6 max-w-xl text-center text-sm font-normal leading-relaxed text-gray-400 md:mt-8 md:text-base">
                  AMSEEL CARS est votre agence de location de voiture à Agadir pour vos déplacements en ville, à l’aéroport et dans toute la région.
                </p>
                <div className={styles.nav}>
                        <Rounded>
                            <Link href="mailto:amseelcars5@gmail.com" >
                            <p>amseelcars5@gmail.com</p>
                            </Link>
                        </Rounded>
                        <Rounded>
                            <Link href="https://wa.me/212662500181/?text=Bonjour, je souhaite louer une voiture." target="_blank" rel="noopener noreferrer">
                            <p>+212 662 500 181 · WhatsApp</p>
                            </Link>
                        </Rounded>
                </div>
                <aside className={`${styles.footerColumns} text-sm leading-relaxed text-gray-400`} aria-label="Coordonnées et liens AMSEEL CARS">
                  <div>
                    <p className="font-medium text-white/90">AMSEEL CARS</p>
                    <p className="mt-2">
                      Immeuble Sinwan, RDC, Haut Founty, 80000 Agadir, Maroc
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li>
                        Téléphone / WhatsApp :{" "}
                        <Link href="tel:+212662500181" className="underline-offset-2 hover:underline">
                          +212 662 500 181
                        </Link>
                      </li>
                      <li>
                        Email :{" "}
                        <Link href="mailto:amseelcars5@gmail.com" className="underline-offset-2 hover:underline">
                          amseelcars5@gmail.com
                        </Link>
                      </li>
                      <li>Horaires : sur rendez-vous et selon vos besoins de livraison — contactez-nous pour planifier.</li>
                    </ul>
                  </div>
                  <div className={styles.footerColCenter}>
                    <h3 className={styles.footerColTitle}>Liens rapides</h3>
                    <nav className={styles.footerColLinks} aria-label="Liens rapides">
                      <Link href="/cars">Flotte</Link>
                      <Link href="/about">À propos</Link>
                      <Link href="/contact">Contact</Link>
                    </nav>
                  </div>
                  <div>
                    <h3 className={styles.footerColTitle}>
                      <Link href="/cars">
                        Location voiture Agadir
                      </Link>
                    </h3>
                    <nav className={styles.footerColLinks} aria-label="Location par marque à Agadir">
                      {LOCATION_VOITURE_AGADIR_BRANDS.map((brand) => (
                        <Link
                          key={brand}
                          href={`/cars?brand=${encodeURIComponent(brand)}`}
                        >
                          {`Location voiture Agadir ${brand}`}
                        </Link>
                      ))}
                    </nav>
                  </div>
                  <div>
                    <h3 className={styles.footerColTitle}>
                      <Link href="/blog">
                        Blog
                      </Link>
                    </h3>
                    <nav className={styles.footerColLinks} aria-label="Articles du blog">
                      {FOOTER_BLOG_LINKS.map(({ label, href }) => (
                        <Link key={href} href={href}>
                          {label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </aside>
                <div className={styles.info}>
                    <div>
                        <span>
                            <p>{new Date().getFullYear()} © Edition</p>
                        </span>
                        <span>
                            <p>
                                SITE DEVELOPED BY{" "}
                                <Link href="https://itagroupe.com" target="_blank">
                                    ITA GROUPE
                                </Link>
                            </p>
                        </span>
                    </div>
                    <nav className={styles.infoSocials} aria-label="Réseaux sociaux">
                        <Magnetic>
                            <Link
                                href="https://www.instagram.com/amseelcarsofficial/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <p>Instagram</p>
                            </Link>
                        </Magnetic>
                        <Magnetic>
                            <Link
                                href="https://www.facebook.com/people/Amseel-Cars/61582652224473/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <p>Facebook</p>
                            </Link>
                        </Magnetic>
                        <Magnetic>
                            <Link
                                href="https://www.tiktok.com/@amseelcars"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <p>TikTok</p>
                            </Link>
                        </Magnetic>
                        <Magnetic>
                            <Link
                                href="https://www.pinterest.com/amseelcars/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <p>Pinterest</p>
                            </Link>
                        </Magnetic>
                    </nav>
                </div>
            </div>
        </motion.div>
    )
}