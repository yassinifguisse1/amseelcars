// "use client";
// import {
//   useMotionValueEvent,
//   useScroll,
//   useTransform,
//   motion,
// } from "framer-motion";
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import Image from "next/image";

// const Cardrive = () => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [images, setImages] = useState<HTMLImageElement[]>([]);
//   const [imagesLoaded, setImagesLoaded] = useState(false);
//   const [loadingProgress, setLoadingProgress] = useState(0);

//   const { scrollYProgress } = useScroll({
//     target: containerRef,
//     offset: ["start end", "end start"],
//   });

//   // Load images on client side only
//   useEffect(() => {
//     const loadImages = async () => {
//       let loadedCount = 0;
//       const totalImages = 763;

//       // Create a promise for each image load
//       const imagePromises = [];

//       for (let i = 400; i <= totalImages; i++) {
//         const imagePromise = new Promise<HTMLImageElement>(
//           (resolve, reject) => {
//             const img = document.createElement("img");
//             const frameNumber = i.toString().padStart(5, '0');
//             img.onload = () => {
//               loadedCount++;
//               const progress = Math.round((loadedCount / totalImages) * 100);
//               setLoadingProgress(progress);
//               console.log(
//                 `Loaded ${loadedCount}/${totalImages} frames (${progress}%)`
//               );
//               resolve(img);
//             };
//             img.onerror = () => {
//               console.error(`Failed to load frame ${i}`);
//               reject(new Error(`Failed to load frame ${i}`));
//             };
//             img.src = `/frame/frame_${frameNumber}.webp`;
//           }
//         );

//         imagePromises.push(imagePromise);
//       }

//       try {
//         const images = await Promise.all(imagePromises);
//         setImages(images);
//         setImagesLoaded(true);
//         console.log("All frames loaded successfully!");
//       } catch (error) {
//         console.error("Error loading frames:", error);
//         // Load what we can
//         const partialImages = await Promise.allSettled(imagePromises);
//         const successfulImages = partialImages
//           .filter(
//             (result): result is PromiseFulfilledResult<HTMLImageElement> =>
//               result.status === "fulfilled"
//           )
//           .map((result) => result.value);

//         setImages(successfulImages);
//         setImagesLoaded(true);
//         console.log(`Loaded ${successfulImages.length}/${totalImages} frames`);
//       }
//     };

//     loadImages();
//   }, []);

//   // Set canvas size
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (canvas && images.length > 0) {
//       // Set canvas size to viewport
//       const resizeCanvas = () => {
//         canvas.width = window.innerWidth;
//         canvas.height = window.innerHeight;
//       };

//       resizeCanvas();
//       window.addEventListener("resize", resizeCanvas);

//       return () => window.removeEventListener("resize", resizeCanvas);
//     }
//   }, [images]);

//   const render = useCallback(
//     (index: number) => {
//       const canvas = canvasRef.current;
//       if (!canvas || !images.length) return;

//       const ctx = canvas.getContext("2d");
//       if (!ctx) return;

//       const imageIndex = Math.max(0, Math.min(index - 1, images.length - 1));
//       const img = images[imageIndex];

//       if (img && img.complete) {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         // Calculate aspect ratio and draw image to fill canvas
//         const canvasAspect = canvas.width / canvas.height;
//         const imageAspect = img.naturalWidth / img.naturalHeight;

//         let drawWidth, drawHeight, offsetX, offsetY;

//         if (canvasAspect > imageAspect) {
//           // Canvas is wider than image
//           drawWidth = canvas.width;
//           drawHeight = canvas.width / imageAspect;
//           offsetX = 0;
//           offsetY = (canvas.height - drawHeight) / 2;
//         } else {
//           // Canvas is taller than image
//           drawWidth = canvas.height * imageAspect;
//           drawHeight = canvas.height;
//           offsetX = (canvas.width - drawWidth) / 2;
//           offsetY = 0;
//         }

//         ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
//       }
//     },
//     [images]
//   );

//   // Initial render when images are available
//   useEffect(() => {
//     if (images.length > 0) {
//       render(1); // Render first frame
//     }
//   }, [images, render]);

//   const currentIndex = useTransform(scrollYProgress, [0, 1], [400, 763]);

//   // Logo parallax transforms
//   const logoY = useTransform(scrollYProgress, [0, 1], ["100vh", "-20vh"]);
//   const logoOpacity = useTransform(
//     scrollYProgress,
//     [0, 0.2, 0.8, 1],
//     [0, 1, 1, 0]
//   );
//   const logoScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2]);

//   useMotionValueEvent(currentIndex, "change", (latest) => {
//     const frameIndex = Math.round(Number(latest));
//     console.log("Rendering frame:", frameIndex, "Progress:", latest);
//     render(frameIndex);
//   });

//   return (
//     <section
//       ref={containerRef}
//       className="relative bg-black"
//       style={{ height: "400vh" }}
//     >
//       <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
//         {/* Parallax Logo - Behind the car */}
//         <motion.div
//           className="absolute left-1/2 transform -translate-x-1/2 z-0 pointer-events-none"
//           style={{
//             y: logoY,
//             opacity: logoOpacity,
//             scale: logoScale,
//           }}
//         >
//           <Image
//             src="/images/Logo.webp"
//             alt="Logo"
//             width={500}
//             height={500}
//             className="drop-shadow-2xl"
//             style={{
//               filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))",
//             }}
//           />
//         </motion.div>

//         {/* Video Canvas - In front of logo */}
//         <canvas
//           ref={canvasRef}
//           className="w-full h-full object-cover relative z-10"
//           style={{
//             display: "block",
//             maxWidth: "100%",
//             maxHeight: "100%",
//           }}
//         />

//         {/* Loading Screen */}
//         {!imagesLoaded && (
//           <div className="absolute inset-0 flex items-center justify-center bg-black text-white text-xl z-20">
//             <div className="text-center">
//               <div className="mb-4">Loading frames...</div>
//               <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
//                 <div
//                   className="bg-white h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${loadingProgress}%` }}
//                 ></div>
//               </div>
//               <div className="text-sm">
//                 {loadingProgress}% ({Math.round((loadingProgress / 100) * 763)}
//                 /763 frames)
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Cardrive;

"use client"
import { useMotionValueEvent, useScroll, useTransform, motion } from 'framer-motion'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLoading } from '@/contexts/LoadingContext'

const Cardrive = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [images, setImages] = useState<HTMLImageElement[]>([])
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [totalFrames, setTotalFrames] = useState(364)
    const { updateFramesProgress, setFramesLoaded, setWordsComplete, setMinimumTimeElapsed } = useLoading()
    
    const {scrollYProgress} = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });

    // Load images with better performance and progress tracking
    useEffect(() => {
        const loadImages = async (useMobileFrames = true) => {
            // Initialize loading states
            setWordsComplete(true); // Speedometer doesn't use word animation
            setMinimumTimeElapsed(false);
            
            // Check if mobile device
            const isMobileDevice = window.innerWidth < 768;
            setIsMobile(isMobileDevice);
            
            let startFrame, endFrame, totalImages, frameFolder;
            
            if (isMobileDevice && useMobileFrames) {
                // Use mobile frames - reduced range for better performance
                startFrame = 400;
                endFrame = 763; // Reduced from 763 to 600 for mobile performance
                totalImages = endFrame - startFrame + 1;
                frameFolder = '/mobile-frames';
                setTotalFrames(totalImages);
                console.log('Loading mobile frames:', startFrame, 'to', endFrame, '(', totalImages, 'total)');
                console.log('Mobile frame folder:', frameFolder);
                
                // Test if mobile frames directory exists by trying to load first frame
                const testImg = new Image();
                const testFrameNumber = startFrame.toString().padStart(5, '0');
                testImg.onload = () => {
                    console.log('Mobile frames directory exists, proceeding with mobile frames');
                };
                testImg.onerror = () => {
                    console.log('Mobile frames directory not found, falling back to desktop frames');
                    setTimeout(() => loadImages(false), 100);
                    return;
                };
                testImg.src = `${frameFolder}/frame_${testFrameNumber}.webp`;
            } else {
                // Use desktop frames (fallback for mobile if mobile frames fail)
                startFrame = 400;
                endFrame = 763;
                totalImages = endFrame - startFrame + 1;
                frameFolder = '/frame';
                setTotalFrames(totalImages);
                console.log('Loading desktop frames:', startFrame, 'to', endFrame, '(', totalImages, 'total)');
                console.log('Desktop frame folder:', frameFolder);
            }

            // Initialize progress tracking
            updateFramesProgress(0, totalImages);
            
            // Set minimum time for speedometer display (2 seconds)
            setTimeout(() => {
                setMinimumTimeElapsed(true);
            }, 2000);
            
            const loadedImages: HTMLImageElement[] = [];
            let loadedCount = 0;
            
            // Create loading promises with better error handling
            const loadPromises = [];
            
            for(let i = startFrame; i <= endFrame; i++){
                const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image();
                    const frameNumber = i.toString().padStart(5, '0');
                    
                    // Set loading attributes for better performance
                    img.loading = 'eager'; // Load immediately
                    img.decoding = 'sync'; // Synchronous decoding for smoother playback
                    
                    img.onload = () => {
                        loadedCount++;
                        updateFramesProgress(loadedCount, totalImages);
                        
                        // Add image to loadedImages array only when it's actually loaded
                        loadedImages[i - startFrame] = img;
                        
                        if (loadedCount === totalImages) {
                            setImages(loadedImages); // Set images only when all are loaded
                            setImagesLoaded(true);
                            setFramesLoaded(true);
                            console.log('All frames loaded successfully!', `Loaded ${loadedCount}/${totalImages} frames`);
                        }
                        resolve(img);
                    };
                    
                    img.onerror = () => {
                        console.error(`Failed to load frame: ${frameFolder}/frame_${frameNumber}.webp`);
                        loadedCount++;
                        updateFramesProgress(loadedCount, totalImages);
                        
                        // Create a placeholder image for failed loads
                        const placeholder = new Image();
                        placeholder.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
                        loadedImages[i - startFrame] = placeholder;
                        
                        if (loadedCount === totalImages) {
                            setImages(loadedImages); // Set images even with some failures
                            setImagesLoaded(true);
                            setFramesLoaded(true);
                            console.log(`Loaded ${loadedCount}/${totalImages} frames (some failed)`);
                        }
                        reject(new Error(`Failed to load frame ${i}`));
                    };
                    
                    img.src = `${frameFolder}/frame_${frameNumber}.webp`;
                });
                
                loadPromises.push(loadPromise);
            }
            
            // Wait for all images with timeout
            try {
                const results = await Promise.allSettled(loadPromises);
                const failedCount = results.filter(result => result.status === 'rejected').length;
                console.log('Image loading completed', `Failed: ${failedCount}/${totalImages}`);
                
                // If too many frames failed and we're on mobile, try desktop frames as fallback
                if (isMobileDevice && useMobileFrames && failedCount > totalImages * 0.5) {
                    console.log('Too many mobile frames failed, falling back to desktop frames...');
                    setTimeout(() => loadImages(false), 1000);
                    return;
                }
            } catch (error) {
                console.error('Some frames failed to load:', error);
                
                // If we're on mobile and mobile frames failed, try desktop frames
                if (isMobileDevice && useMobileFrames) {
                    console.log('Mobile frames failed, falling back to desktop frames...');
                    setTimeout(() => loadImages(false), 1000);
                    return;
                }
            }
        };

        loadImages();
        
        // Handle orientation/resize changes that might switch between mobile/desktop
        const handleResize = () => {
            const newIsMobile = window.innerWidth < 768;
            if (newIsMobile !== isMobile) {
                console.log('Device type changed, reloading frames...');
                setImagesLoaded(false);
                setImages([]);
                // Reload images for new device type
                setTimeout(loadImages, 100);
            }
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 500);
        });
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, [isMobile, updateFramesProgress, setFramesLoaded, setWordsComplete, setMinimumTimeElapsed]);

    // Set canvas size responsively
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                // Use visual viewport for mobile compatibility
                const containerWidth = window.innerWidth;
                const containerHeight = isMobile ? 
                    (window.visualViewport?.height || window.innerHeight) : 
                    window.innerHeight;
                
                // Set canvas resolution with higher pixel ratio for mobile
                const pixelRatio = isMobile ? 
                    Math.min(window.devicePixelRatio || 1, 2) : // Limit to 2x on mobile for performance
                    (window.devicePixelRatio || 1);
                
                canvas.width = containerWidth * pixelRatio;
                canvas.height = containerHeight * pixelRatio;
                
                // Set CSS size
                canvas.style.width = `${containerWidth}px`;
                canvas.style.height = `${containerHeight}px`;
                
                // Scale context for retina displays
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(pixelRatio, pixelRatio);
                    // Ensure smooth rendering on mobile
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                }
                
                console.log(`Canvas resized to: ${containerWidth}x${containerHeight}, ratio: ${pixelRatio}, mobile: ${isMobile}`);
            }
        };

        // Initial resize with delay for mobile
        if (isMobile) {
            setTimeout(resizeCanvas, 100);
        } else {
            resizeCanvas();
        }

        // Listen for window resize
        window.addEventListener('resize', resizeCanvas);
        
        // Listen for orientation change on mobile with longer delay
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 800); // Longer delay for mobile orientation change
        });

        // Handle visual viewport changes on mobile (address bar show/hide)
        if (window.visualViewport && isMobile) {
            const handleViewportChange = () => {
                setTimeout(resizeCanvas, 150);
            };
            window.visualViewport.addEventListener('resize', handleViewportChange);
            
            return () => {
                window.removeEventListener('resize', resizeCanvas);
                window.removeEventListener('orientationchange', resizeCanvas);
                window.visualViewport?.removeEventListener('resize', handleViewportChange);
            };
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('orientationchange', resizeCanvas);
        };
    }, [isMobile]);

    const currentIndex = useTransform(scrollYProgress, [0, 1], [0, totalFrames - 1]); // Dynamic based on device
    
    // Button parallax transforms - comes from bottom and stops slightly below center
    const buttonY = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], ['30vh', '28vh', '12vh', '8vh']);
    const buttonOpacity = useTransform(scrollYProgress, [0, 0.2, 0.3, 1], [0, 0, 1, 1]);
    const buttonScale = useTransform(scrollYProgress, [0.2, 0.5, 0.6], [0.4, 1, 1]);
    
    // Logo parallax transforms
    // const logoY = useTransform(scrollYProgress, [0, 1], ['100vh', '-20vh']);
    // const logoOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    // const logoScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2]);

    // Optimized render function with caching
    const lastRenderedIndex = useRef(-1);
    const render = useCallback(
        (index: number) => {
            const canvas = canvasRef.current;
            if (!canvas || !imagesLoaded || !images.length) {
                console.log('Render skipped - canvas:', !!canvas, 'imagesLoaded:', imagesLoaded, 'images.length:', images.length);
                return;
            }
            
            const imageIndex = Math.max(0, Math.min(Math.round(index), images.length - 1));
            
            // Skip if same frame (performance optimization) - but allow first frame
            if (imageIndex === lastRenderedIndex.current && lastRenderedIndex.current !== -1) return;
            lastRenderedIndex.current = imageIndex;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.log('No canvas context available');
                return;
            }

            const img = images[imageIndex];
            
            if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                // Get actual display dimensions (not canvas resolution)
                const displayWidth = parseInt(canvas.style.width) || canvas.width;
                const displayHeight = parseInt(canvas.style.height) || canvas.height;
                
                // Clear canvas completely
                ctx.clearRect(0, 0, displayWidth, displayHeight);
                
                // Optimized drawing calculations
                const canvasAspect = displayWidth / displayHeight;
                const imageAspect = img.naturalWidth / img.naturalHeight;
                
                let drawWidth, drawHeight, offsetX, offsetY;
                
                // Simplified aspect ratio calculation
                if (canvasAspect > imageAspect) {
                    // Canvas is wider - fit to width
                    drawWidth = displayWidth;
                    drawHeight = displayWidth / imageAspect;
                    offsetX = 0;
                    offsetY = (displayHeight - drawHeight) / 2;
                } else {
                    // Canvas is taller - fit to height
                    drawHeight = displayHeight;
                    drawWidth = displayHeight * imageAspect;
                    offsetX = (displayWidth - drawWidth) / 2;
                    offsetY = 0;
                }
                
                // Enhanced rendering with better quality settings
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = isMobile ? 'medium' : 'high';
                
                // Draw image with error handling
                try {
                    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                    console.log(`Successfully rendered frame ${imageIndex}`);
                } catch (error) {
                    console.error('Error drawing frame:', error, 'Frame:', imageIndex);
                }
            } else {
                console.log(`Image not ready for frame ${imageIndex}:`, {
                    complete: img?.complete,
                    naturalWidth: img?.naturalWidth,
                    naturalHeight: img?.naturalHeight
                });
            }
        },
        [images, imagesLoaded, isMobile]
    );

    // Initial render when images are loaded and canvas is ready
    useEffect(() => {
        if (imagesLoaded && images.length > 0) {
            console.log('Images loaded, attempting initial render...', {
                imagesLoaded,
                imagesLength: images.length,
                firstImage: images[0] ? {
                    complete: images[0].complete,
                    naturalWidth: images[0].naturalWidth,
                    naturalHeight: images[0].naturalHeight,
                    src: images[0].src
                } : 'No first image'
            });
            
            // Small delay to ensure canvas is properly initialized
            const timer = setTimeout(() => {
                console.log('Rendering initial frame...');
                render(0); // Render first frame immediately
            }, 50);
            
            return () => clearTimeout(timer);
        }
    }, [imagesLoaded, images, render]);

    // Additional effect to ensure first frame renders when canvas is ready
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && imagesLoaded && images.length > 0) {
            // Check if canvas has been properly sized
            const hasValidSize = canvas.width > 0 && canvas.height > 0;
            if (hasValidSize) {
                console.log('Canvas ready, rendering first frame...');
                render(0);
            } else {
                // Wait a bit more for canvas to be sized
                const timer = setTimeout(() => {
                    console.log('Delayed first frame render...');
                    render(0);
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [imagesLoaded, images, render]);

    // Add throttling state for mobile
    const lastRenderTime = useRef(0);

    useMotionValueEvent(currentIndex, 'change', (latest) => {
        const frameIndex = Math.round(Number(latest));
        
        // Throttle rendering on mobile for better performance
        if (isMobile) {
            const now = Date.now();
            if (now - lastRenderTime.current < 16) return; // ~60fps limit
            lastRenderTime.current = now;
        }
        
        console.log(`Scroll progress: ${scrollYProgress.get()}, Frame: ${frameIndex}, Mobile: ${isMobile}`);
        render(frameIndex);
    });


    // Fallback render effect - ensures first frame is shown
    useEffect(() => {
        if (imagesLoaded && images.length > 0) {
            const fallbackTimer = setTimeout(() => {
                console.log('Fallback render - ensuring first frame is shown');
                render(0);
            }, 200);
            
            return () => clearTimeout(fallbackTimer);
        }
    }, [imagesLoaded, images, render]);

    return (
        <motion.section 
            ref={containerRef}
            className="relative bg-black"
            style={{ height: isMobile ? "250svh" : "300svh", touchAction: 'pan-y' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
        >
            <div className="sticky top-0 h-[100svh] w-full flex items-center justify-center  bg-black">
                {/* Video Canvas */}
                <canvas 
                    ref={canvasRef}
                    className="block"
                    style={{
                        display: 'block',
                        width: '100vw',
                        height: isMobile ? '100svh' : '100vh',
                        objectFit: 'cover',
                        pointerEvents: 'none',
                        zIndex: 10,
                        // position: 'absolute',
                        // top: 0,
                        // left: 0,
                        // touchAction: 'none'
                    }}
                />

                {/* Parallax Button - Explore All Cars */}
                <motion.div
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
                    style={{
                        y: buttonY,
                        opacity: buttonOpacity,
                        scale: buttonScale,
                    }}
                >
                    <Link href="/cars">
                        <motion.button
                            className={`
                                relative px-8 py-4 bg-white text-black font-bold text-lg
                                rounded-full border-2 border-white
                                hover:bg-transparent hover:text-white
                                transition-all duration-300 ease-out
                                shadow-2xl backdrop-blur-sm
                                ${isMobile ? 'px-6 py-3 text-base' : ''}
                            `}
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0 0 30px rgba(255, 255, 255, 0.5)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <span className="relative z-10 flex items-center gap-2 text-[13px] sm:text-[18px][ md:text-base lg:text-lg ">
                            Découvrir toutes les voitures
                                <motion.span
                                    className="inline-block"
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ 
                                        duration: 1.5, 
                                        repeat: Infinity, 
                                        ease: "easeInOut" 
                                    }}
                                >
                                    →
                                </motion.span>
                            </span>
                            
                            {/* Animated background gradient */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-100 to-white opacity-0"
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                            
                            {/* Ripple effect on hover */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-white opacity-0"
                                whileHover={{
                                    opacity: [0, 1, 0],
                                    scale: [1, 1.2, 1.4],
                                }}
                                transition={{ duration: 0.6 }}
                            />
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Loading handled by global preloader now */}
            </div>
        </motion.section>
    );
}

export default Cardrive