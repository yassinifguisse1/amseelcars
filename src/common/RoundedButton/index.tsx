"use client"
import React, { ReactNode, useCallback } from 'react'
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './style.module.scss';
import gsap from 'gsap';
import Magnetic from '../Magnetic';

interface RoundedButtonProps {
  children: ReactNode;
  backgroundColor?: string;
  href?: string; // URL to navigate to
  onClick?: () => void; // Custom click handler
  [key: string]: unknown; // For additional attributes
}

export default function Index({children, backgroundColor="#cc1939", href, onClick, ...attributes}: RoundedButtonProps) {
  const router = useRouter();
  const circle = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const isNavigating = useRef(false);

  useEffect(() => {
    if (!circle.current) return;

    timeline.current = gsap.timeline({paused: true})
    timeline.current
      .to(circle.current, {top: "-25%", width: "150%", duration: 0.4, ease: "power3.in"}, "enter")
      .to(circle.current, {top: "-150%", width: "125%", duration: 0.25}, "exit")

    // Cleanup function
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      if (timeline.current) {
        timeline.current.kill();
      }
    };
  }, [])
  
  const manageMouseEnter = useCallback(() => {
    if (isNavigating.current) return;
    
    if(timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    if(timeline.current) {
      timeline.current.tweenFromTo('enter', 'exit');
    }
  }, []);

  const manageMouseLeave = useCallback(() => {
    if (isNavigating.current) return;
    
    timeoutId.current = setTimeout(() => {
      if(timeline.current && !isNavigating.current) {
        timeline.current.play();
      }
    }, 300);
  }, []);

  const handleClick = useCallback(() => {
    if (isNavigating.current) return;
    
    isNavigating.current = true;
    
    // Clear any pending animations
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    
    if (onClick) {
      onClick();
      isNavigating.current = false;
    } else if (href) {
      // Use router.push with proper error handling
      try {
        router.push(href);
        // Reset after a short delay to allow navigation to complete
        setTimeout(() => {
          isNavigating.current = false;
        }, 100);
      } catch (error: unknown) {
        console.error('Navigation error:', error);
        isNavigating.current = false;
      }
    }
  }, [onClick, href, router]);

  return (
    <Magnetic>
      <div 
        className={styles.roundedButton} 
        style={{overflow: "hidden"}} 
        onMouseEnter={() => {manageMouseEnter()}} 
        onMouseLeave={() => {manageMouseLeave()}} 
        onClick={handleClick}
        {...attributes}
      >
          {
            children
          }
        <div ref={circle} style={{backgroundColor}} className={styles.circle}></div>
      </div>
    </Magnetic>
  )
}