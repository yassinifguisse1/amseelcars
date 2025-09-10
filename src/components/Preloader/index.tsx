'use client';
import styles from './style.module.scss';
import { useEffect, useState, useCallback } from 'react';
import { motion, cubicBezier, type Variants, useSpring, useTransform } from 'framer-motion';
import { opacity, slideUp } from './anim';
import { useLoading } from '@/contexts/LoadingContext';

// Speedometer component
const Speedometer = ({ progress }: { progress: number }) => {
    const [mph, setMph] = useState(0);
    
    // Convert progress (0-100) to speedometer values
    const maxSpeed = 180; // Max speedometer reading
    const currentSpeed = (progress / 100) * maxSpeed;
    
    // Needle angle (-90 to 90 degrees for half circle)
    const needleAngle = -90 + (progress / 100) * 180;
    
    useEffect(() => {
        setMph(Math.round(currentSpeed));
    }, [currentSpeed]);
    
    console.log('Speedometer rendering with progress:', progress, 'mph:', mph, 'angle:', needleAngle);
    
    // Generate tick marks (major and minor)
    const generateTicks = () => {
        const ticks = [];
        const totalTicks = 19; // 0, 10, 20, ... 180
        
        for (let i = 0; i <= totalTicks; i++) {
            const angle = -90 + (i * 180) / totalTicks;
            const speed = (i * maxSpeed) / totalTicks;
            const isActive = speed <= currentSpeed;
            const isMajor = i % 2 === 0; // Every other tick is major
            
            ticks.push(
                <motion.g key={i}>
                    {/* Tick mark */}
                    <motion.line
                        x1={0}
                        y1={isMajor ? -85 : -80}
                        x2={0}
                        y2={isMajor ? -75 : -78}
                        stroke={isActive ? "#ff6b35" : "#333"}
                        strokeWidth={isMajor ? 2 : 1}
                        transform={`rotate(${angle})`}
                        initial={{ opacity: 0.3 }}
                        animate={{ 
                            opacity: isActive ? 1 : 0.3,
                            stroke: isActive ? "#ff6b35" : "#444"
                        }}
                        transition={{ duration: 0.3 }}
                    />
                    
                    {/* Speed labels for major ticks */}
                    {isMajor && (
                        <motion.text
                            x={Math.sin((angle * Math.PI) / 180) * 65}
                            y={-Math.cos((angle * Math.PI) / 180) * 65 + 5}
                            textAnchor="middle"
                            fontSize="10"
                            fill={isActive ? "#ff6b35" : "#666"}
                            animate={{ 
                                fill: isActive ? "#ff6b35" : "#666"
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {Math.round(speed)}
                        </motion.text>
                    )}
                </motion.g>
            );
        }
        return ticks;
    };
    
    return (
        <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 p-8">
            {/* Debug info */}
            <div className="text-white text-sm mb-4">
                Progress: {progress}% | MPH: {mph} | Angle: {needleAngle.toFixed(1)}°
            </div>
            
            {/* Speedometer */}
            <div className="relative bg-gray-900x rounded-full p-8">
                <svg
                    width="300"
                    height="200"
                    viewBox="-150 -100 300 200"
                    className="drop-shadow-lg"
                >
                    {/* Background arc */}
                    <path
                        d="M -100 0 A 100 100 0 0 1 100 0"
                        fill="none"
                        stroke="#222"
                        strokeWidth="8"
                        className="opacity-30"
                    />
                    
                    {/* Progress arc with glow */}
                    <motion.path
                        d="M -100 0 A 100 100 0 0 1 100 0"
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="8"
                        strokeDasharray="314.16" // π * 100 (circumference of half circle)
                        strokeDashoffset={314.16 - (progress / 100) * 314.16}
                        className="drop-shadow-md"
                        initial={{ strokeDashoffset: 314.16 }}
                        animate={{ strokeDashoffset: 314.16 - (progress / 100) * 314.16 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                    
                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff6b35" />
                            <stop offset="50%" stopColor="#f39c12" />
                            <stop offset="100%" stopColor="#e74c3c" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Tick marks */}
                    {generateTicks()}
                    
                    {/* Center hub */}
                    <circle
                        cx="0"
                        cy="0"
                        r="8"
                        fill="#333"
                        stroke="#ff6b35"
                        strokeWidth="2"
                    />
                    
                    {/* Needle */}
                    <g transform={`rotate(${needleAngle})`}>
                        <line
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="-70"
                            stroke="#ff6b35"
                            strokeWidth="3"
                            strokeLinecap="round"
                            filter="url(#glow)"
                        />
                        <circle
                            cx="0"
                            cy="0"
                            r="4"
                            fill="#ff6b35"
                        />
                    </g>
                </svg>
            </div>
            
            {/* MPH Display */}
            <div className="text-center">
                <motion.div 
                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-1 md:mb-2"
                    key={mph}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {mph}
                </motion.div>
                <div className="text-sm md:text-lg text-gray-400 tracking-wider">MPH</div>
            </div>
            
            {/* Loading text */}
            <motion.div 
                className="text-center space-y-1 md:space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="text-xs sm:text-sm text-gray-300">
                    Loading Experience
                </div>
                <div className="text-xs text-gray-500 px-4">
                    {progress < 100 ? 'Preparing your journey...' : 'Ready to accelerate!'}
                </div>
            </motion.div>
        </div>
    );
};

export default function Index() {
    const [dimension, setDimension] = useState({width: 0, height:0});
    const [testProgress, setTestProgress] = useState(0);
    const { loadingState, setWordsComplete, setMinimumTimeElapsed } = useLoading();

    useEffect(() => {
        setDimension({width: window.innerWidth, height: window.innerHeight});
        
        // Set minimum time for speedometer experience (shorter but still engaging)
        const minimumDuration = 3000; // 3 seconds minimum
        setTimeout(() => {
            console.log("Minimum preloader time elapsed");
            setMinimumTimeElapsed(true);
        }, minimumDuration);
        
        // Immediately mark words as complete since we're not using word animation
        setTimeout(() => {
            setWordsComplete(true);
        }, 500);

        // Simulate progress for testing if no real progress is happening
        const progressInterval = setInterval(() => {
            setTestProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2; // Increment by 2% every 100ms
            });
        }, 100);

        return () => clearInterval(progressInterval);
    }, [setMinimumTimeElapsed, setWordsComplete]);

    // Use real progress if available, otherwise use test progress
    const displayProgress = loadingState.totalFrames > 0 ? loadingState.framesProgress : testProgress;
    
    // Speedometer finishes when frames are loaded and minimum time elapsed
    const canFinish = (loadingState.framesLoaded || testProgress >= 100) && loadingState.minimumTimeElapsed;

    console.log('Preloader render - displayProgress:', displayProgress, 'canFinish:', canFinish, 'loadingState:', loadingState);

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
                {/* Speedometer Preloader */}
                <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Speedometer progress={displayProgress} />
                </motion.div>
                
                {/* Car brand text overlay */}
                <motion.div
                    className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <h1 className="text-2xl md:text-4xl font-bold text-white tracking-wider">
                        AMSSEEL CARS
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-2">
                        Premium Car Rental Experience
                    </p>
                </motion.div>
                
                {/* Additional progress info for debugging */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                >
                    <div className="text-xs text-gray-500 space-y-1">
                        <div>Progress: {displayProgress}%</div>
                        <div>Frames: {loadingState.loadedFrames}/{loadingState.totalFrames}</div>
                        <div>Test Progress: {testProgress}%</div>
                        <div>Can Finish: {canFinish ? 'Yes' : 'No'}</div>
                    </div>
                    {(loadingState.framesLoaded || testProgress >= 100) && !canFinish && (
                        <div className="text-xs text-orange-400 mt-1">
                            Ready - Waiting for minimum time...
                        </div>
                    )}
                </motion.div>
                
                <svg>
                    <motion.path variants={curve} initial="initial" exit={canFinish ? "exit" : "initial"}></motion.path>
                </svg>
            </>
            }
        </motion.div>
    )
}