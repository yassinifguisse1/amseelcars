"use client";
import Link from 'next/link';
import React, { useState ,useRef, useEffect} from 'react'

import "./menu.css"
import { usePathname } from 'next/navigation';
import { useTransitionRouter } from 'next-view-transitions';

import {gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {useGSAP} from "@gsap/react"
import Magnetic from '@/common/Magnetic';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
// register once (outside the component)
gsap.registerPlugin(useGSAP, ScrollTrigger);

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
        // Proactively clean up ScrollTrigger pins/wrappers before route change
        try {
          const triggers = ScrollTrigger.getAll?.()
          triggers?.forEach(t => t.kill())
        } catch (err) {
          // noop – ensure navigation proceeds even if cleanup fails
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
        <div className="menu-bar" >
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
                    <div className="menu-info-col flex gap-4">
                        <Magnetic>
                            <Link href="https://www.facebook.com/amseelcars/" target='_blank' className='menu-link'>
                            <div className='flex items-center gap-2'>
                                <Facebook className='w-7 h-7 text-black bg-black rounded-full p-1' />
                                <p> Facebook</p>
                            </div>
                            </Link>
                        </Magnetic>
                        <Magnetic >

                            <Link href="https://www.instagram.com/amseelcars/" target='_blank' className='menu-link'>
                            <div className='flex items-center gap-2'>
                                <Instagram className='w-7 h-7 text-black bg-black rounded-full p-1' />
                                <p>   Instagram</p>
                            </div>
                            </Link>
                        </Magnetic>
                        <Magnetic>
                            <Link href="https://wa.me/212662500181" target='_blank' className='menu-link'>
                            <div className='flex items-center gap-2'>
                                <Phone className='w-7 h-7 text-black bg-black rounded-full p-1' />
                                <p> Whatsapp</p>
                            </div>
                            </Link>
                        </Magnetic>
                    </div>
                    <div className="menu-info-col flex gap-4">
                            <Link href="mailto:info@amseelcars.com" target='_blank' className='menu-link'>
                        <div className='flex items-center gap-2'>

                            <Mail className='w-7 h-7 text-black bg-black rounded-full p-1' />
                            <p className='menu-link'> info@amseelcars.com</p>
                        </div>
                            </Link>
                        <Link href="tel:+212662500181" target='_blank' className='menu-link'>
                        <div className='flex items-center gap-2'>
                            <Phone className='w-7 h-7 text-black bg-black rounded-full p-1' />
                            <p className='menu-link'> +212 662 500 181</p>
                        </div>
                            </Link>
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