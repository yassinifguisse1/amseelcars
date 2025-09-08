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
    const [wordsComplete, setWordsComplete] = useState(false);
    const { loadingState } = useLoading();

    useEffect( () => {
        setDimension({width: window.innerWidth, height: window.innerHeight})
    }, [])

    useEffect( () => {
        if(index == words.length - 1) {
            setWordsComplete(true);
            return;
        }
        setTimeout( () => {
            setIndex(index + 1)
        }, index == 0 ? 1000 : 150)
    }, [index])

    // Only allow preloader to finish when both words and frames are complete
    const canFinish = wordsComplete && loadingState.isComplete;

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
                    {wordsComplete ? "Loading..." : words[index]}
                </motion.p>
                
                {/* Loading Progress */}
                {wordsComplete && (
                    <motion.div 
                        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
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