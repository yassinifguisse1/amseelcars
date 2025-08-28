"use client"
import React, { useEffect } from 'react'
import ReactLenis from 'lenis/react'
import Image from 'next/image'
import Link from 'next/link'
import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const ShowCars = () => {
   useEffect(() => {
    const scrollTriggerSettings = {
        trigger: ".main",
        start:"top 25%",
        toggleActions: "play reverse play reverse",
       
        

    }
    const leftXValues = [-800, -900, -400];
    const rightXValues = [800, 900, 400];
    const leftRotationValues = [-30, -20, -35];
    const rightRotationValues = [30, -20, -35];
    const yValues = [100, -150, -400];
    gsap.utils.toArray(".row").forEach((row, index) => {
        const cartLeft = (row as Element).querySelector(".card-left") as HTMLElement;
        const cartRight = (row as Element).querySelector(".card-right") as HTMLElement;
    
        if (cartLeft && cartRight) {
            gsap.to(cartLeft, {
                x: leftXValues[index],
                scrollTrigger: {
                    trigger: ".main",
                    start: "top top",
                    end: "100% bottom",
                    scrub: true,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        cartLeft.style.transform = `translateX(${progress * leftXValues[index]}px) translateY(${progress * yValues[index]}px) rotate(${progress * leftRotationValues[index]}deg)`;
                        cartRight.style.transform = `translateX(${progress * rightXValues[index]}px) translateY(${progress * yValues[index]}px) rotate(${progress * rightRotationValues[index]}deg)`;   


                    }
                }
            })
        }
       })
       gsap.to(".logo", {
        
        scale: 1,
        duration: 0.5,
        ease: "power1.inOut",
        scrollTrigger: scrollTriggerSettings,
       })
       gsap.to(".line p", {
        
        y: 0,
        stragger:0.1,
        duration: 0.5,
        ease: "power1.inOut",
        scrollTrigger: scrollTriggerSettings,
       })
       gsap.to("button", {
        y: 0,
        opacity: 1,
        delay: 0.25,
        duration: 0.5,
        ease: "power1.inOut",
        scrollTrigger: scrollTriggerSettings,
       })

       return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
       }
   }, [])

  



    const generateRows = () => {
        const rows = []
        for(let i = 1; i <= 3; i++){
            rows.push(
                <div className="row" key={i}>
                    <div className="card card-left">
                        <img src={`/images/img-${2 * i - 1}.webp`} alt="" />
                    </div>
                    <div className="card card-right">
                        <img src={`/images/img-${2 * i}.webp`} alt="" />
                    </div>
                </div>
            )
        }
        return rows
    }

  return (
    <>
      <ReactLenis root>
        {/* <section className="hero">
            <div className="img">
                <img src="/images/bgr.webp" alt="car"  />
            </div>
        </section> */}
        <section className="main">
            <div className="main-content ">
                <div className="logo ">
                    {/* <img src="/images/Logo.webp" alt="logo"  className=''/> */}
                </div>
                <div className="copy text-white ">
                    {/* <div className="line">
                        <p>Dleve into coding without clutter.</p>
                    </div>
                    <div className="line">
                        <p>Dleve into coding without clutter.</p>
                    </div>
                    <div className="line">
                        <p>Dleve into coding without clutter.</p>
                    </div> */}
                </div>
                 <div className="btn">
                    {/* <button >
                        Get PRO
                    </button> */}
                 </div>
            </div>
            {generateRows()}
        </section>
        {/* <section className="footer">
            <Link href="https://www.google.com">
            Link in description
            </Link>
        </section> */}
      
      
      </ReactLenis>
        
    </>
  )
}

export default ShowCars