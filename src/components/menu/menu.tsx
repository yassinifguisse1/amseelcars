"use client";
import Link from 'next/link';
import React, { useState ,useRef, useEffect} from 'react'

import "./menu.css"
import { usePathname } from 'next/navigation';
import { useTransitionRouter } from 'next-view-transitions';

import {gsap } from "gsap"
import {useGSAP} from "@gsap/react"
// register once (outside the component)
gsap.registerPlugin(useGSAP);

const menuLinks = [
    {
        path: "/",
        label: "Home",
    },
    {
        path: "/about",
        label: "About",
    },
    {
        path: "/cars",
        label: "CARS",
    },

    {
        path: "/services",
        label: "Services",
    },
    {
        path: "/contact",
        label: "Contact",
    },
    
    
]


const Menu = () => {
    const container = useRef(null);
    const [isOpen, setIsOpen] = useState(false);


    const router = useTransitionRouter()
    const pathname = usePathname()


    function triggerPageTransition() {
        document.documentElement.animate([
            {
                clipPath: "polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)",
            },
            {
                clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
            }

        ],{
            duration: 2000,
            easing: "cubic-bezier(0.9, 0, 0.1, 1)",
            pseudoElement: "::view-transition-new(root)",
        })
    }
 
    const handleNavigation = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) =>{
        if(pathname === path){
            e.preventDefault()
            return
        }
        router.push(path , {
            scroll: false,
            onTransitionReady: triggerPageTransition,
        })
    }
    
      
    // ✅ Type this as a GSAP timeline, not HTMLAllCollection
    const tl = useRef<gsap.core.Timeline | null>(null);
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }
    useGSAP(
        ()=>{
            gsap.set(".menu-link-item-holder" , {y:75});
            tl.current = gsap.timeline({paused:true})
            .to(".menu-overlay", {
                duration:1.25,
                clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                ease: "power4.inOut"


            })
            .to(".menu-link-item-holder", {
                y:0,
                duration:1,
                stagger:0.1,
                ease: "power4.inOut",
                delay:-0.75,
            })
        },
        {scope:container}
    )
    useEffect( ()=>{
        if(isOpen){
            tl.current?.play()
        } else{
            tl.current?.reverse()
        }
    },[isOpen]

    )
  
  return (
    <div className="menu-container" ref={container}>
        <div className="menu-bar" onClick={toggleMenu}>
            <div className="menu-logo">
                <Link href="/">
                  amseelcars
                </Link>


            </div>
            <div className="menu-open" onClick={toggleMenu}>
                <p>Menu</p>
            </div>
        </div>
        <div className="menu-overlay"> 
            <div className="menu-overlay-bar ">
                <div className="menu-logo">
                <Link href="/">
                  amseelcars
                </Link>
                </div>
                <div className="menu-close" onClick={toggleMenu}>
                    <p>Close</p> 
                </div>
            </div>
            <div className="menu-close-icon ">
                <p>&#x2715;</p>
            </div>
            <div className="menu-copy  ">
                <div className="menu-links ">
                    {menuLinks.map((link, index) => (
                        <div className="menu-link-item" key={index}>
                            <div className="menu-link-item-holder" onClick={toggleMenu} >
                            <Link href={link.path} className='menu-link font-heading font-bold' onClick={handleNavigation(link.path)}>{link.label}</Link>

                            </div>
                        </div>
                    ))}
                </div>
                <div className="menu-info ">
                    <div className="menu-info-col">
                        <a href="#">X &#x8599;</a>
                        <a href="#">Instgram &#x8599;</a>
                        <a href="#">Linkedin &#x8599;</a>
                        <a href="#">Youtube &#x8599;</a> 
                        <a href="#">Tiktok &#x8599;</a>
                        <a href="#">Whatsapp &#x8599;</a>
                    </div>
                    <div className="menu-info-col">
                        <p>info@amseelcars.com</p>
                        <p>+966555555555</p>
                    </div>
                </div>
            </div>
            <div className="menu-preview">
                <p>view showrell
 
                </p>
            </div>

        </div>

    </div>
  )
}

export default Menu

