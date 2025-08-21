"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import CustomEase from "gsap/CustomEase"

gsap.registerPlugin(CustomEase)

CustomEase.create("custom", "0.9,0 0.1,1")
export const useRevealed = () => {
    useGSAP(() => {
        gsap.to(".revealed", {
            scale: 0,
            delay: 1,
            duration: 1.25,
            ease: "custom",
        })
    },{})
}