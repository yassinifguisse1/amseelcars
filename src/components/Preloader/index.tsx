'use client';
import styles from './style.module.scss';
import { useEffect, useState } from 'react';
import { motion, cubicBezier, type Variants } from 'framer-motion';
import { opacity, slideUp } from './anim';
import { useLoading } from '@/contexts/LoadingContext';

const words = ["Hello", "Bonjour", "Ciao", "Olà", "やあ", "Hallå", "Guten tag", "Hallo"]

export default function Index() {
    const [index, setIndex] = useState(0);
    const [dimension, setDimension] = useState({width: 0, height:0});
    const [showLoadingBar, setShowLoadingBar] = useState(false);
    const { loadingState, setWordsComplete, setMinimumTimeElapsed } = useLoading();

    useEffect( () => {
        setDimension({width: window.innerWidth, height: window.innerHeight})
        
        // Set a minimum total time for the entire preloader experience
        // This ensures all words are shown regardless of how fast frames load
        const minimumDuration = 1200 + (words.length - 1) * 400 + 2500; // Total calculated time
        setTimeout(() => {
            console.log("Minimum preloader time elapsed");
            setMinimumTimeElapsed(true);
        }, minimumDuration);
    }, [setMinimumTimeElapsed])

    useEffect( () => {
        console.log(`Displaying word ${index + 1}/${words.length}: "${words[index]}"`);
        
        if(index == words.length - 1) {
            console.log("Last word displayed, waiting 1.5 seconds before showing loading...");
            // After displaying the last word, wait a bit then show loading
            setTimeout(() => {
                console.log("All words complete, now showing loading bar...");
                setShowLoadingBar(true);
            }, 1500); // Give more time for the last word to be visible
            
            // Mark words as complete after additional time
            setTimeout(() => {
                console.log("Words animation complete - ready to finish when frames are loaded");
                setWordsComplete(true);
            }, 2500); // Total time to ensure all words are seen
            return;
        }
        
        // Continue with word progression - slower timing to ensure visibility
        setTimeout( () => {
            setIndex(index + 1)
        }, index == 0 ? 1200 : 400) // Increased timing: first word 1.2s, others 400ms
    }, [index, setWordsComplete])

    // Only allow preloader to finish when ALL conditions are met:
    // 1. All words have been displayed (loadingState.wordsComplete)
    // 2. All frames are loaded (loadingState.framesLoaded) 
    // 3. Minimum time has elapsed (loadingState.minimumTimeElapsed)
    const canFinish = loadingState.isComplete;
    
    // Debug log for canFinish state
    useEffect(() => {
        console.log(`Preloader state - Words: ${loadingState.wordsComplete ? 'Complete' : `${index + 1}/${words.length}`}, Frames: ${loadingState.framesLoaded ? 'Complete' : `${loadingState.framesProgress}%`}, MinTime: ${loadingState.minimumTimeElapsed ? 'Elapsed' : 'Waiting'}, Can Finish: ${canFinish}`);
    }, [loadingState.wordsComplete, loadingState.framesLoaded, loadingState.framesProgress, loadingState.minimumTimeElapsed, canFinish, index]);

    const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width/2} ${dimension.height + 300} 0 ${dimension.height}  L0 0`
    const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width/2} ${dimension.height} 0 ${dimension.height}  L0 0`

    const curve: Variants = {
        initial: {
            d: initialPath,
            transition: { duration: 0.7, ease: cubicBezier(0.76, 0, 0.24, 1) }
        },
        exit: {
            d: targetPath,
            transition: { duration: 0.7, ease: cubicBezier(0.76, 0, 0.24, 1), delay: 0.3 }
        }
    }

    return (
        <motion.div 
            variants={slideUp} 
            initial="initial" 
            exit={canFinish ? "exit" : "initial"} 
            className={styles.introduction}
        >
            {dimension.width > 0 && 
            <>
                <motion.p variants={opacity} initial="initial" animate="enter">
                    <span></span>
                    {showLoadingBar ? "Loading..." : words[index]}
                </motion.p>
                
                {/* Loading Progress - Only show after the loading bar state is triggered */}
                {showLoadingBar && (
                    <motion.div 
                        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="text-sm mb-2 text-white">
                            Loading Frames: {loadingState.framesProgress}%
                        </div>
                        <div className="w-64 bg-gray-700 rounded-full h-1">
                            <div
                                className="bg-white h-1 rounded-full transition-all duration-300"
                                style={{ width: `${loadingState.framesProgress}%` }}
                            />
                        </div>
                        <div className="text-xs mt-1 text-gray-400">
                            {loadingState.loadedFrames}/{loadingState.totalFrames} frames
                        </div>
                        
                        {/* Show completion message when frames are done but still waiting for word animation */}
                        {loadingState.framesLoaded && !loadingState.wordsComplete && (
                            <div className="text-xs mt-2 text-green-400">
                                Frames loaded - Completing animation...
                            </div>
                        )}
                    </motion.div>
                )}
                
                <svg>
                    <motion.path variants={curve} initial="initial" exit={canFinish ? "exit" : "initial"}></motion.path>
                </svg>
            </>
            }
        </motion.div>
    )
}