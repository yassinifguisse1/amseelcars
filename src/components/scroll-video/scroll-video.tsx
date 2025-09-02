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
import { useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import React, { useCallback, useEffect, useRef, useState } from 'react'

const Cardrive = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [images, setImages] = useState<HTMLImageElement[]>([])
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [totalFrames, setTotalFrames] = useState(364)
    
    const {scrollYProgress} = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });

    // Load images on client side only
    useEffect(() => {
        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            let loadedCount = 0;
            
            // Check if mobile device
            const isMobileDevice = window.innerWidth < 768;
            setIsMobile(isMobileDevice);
            
            let startFrame, endFrame, totalImages, frameFolder;
            
            if (isMobileDevice) {
                // Use mobile frames (753-833)
                startFrame = 400;
                endFrame = 763;
                totalImages = endFrame - startFrame + 1; // 81 frames total
                frameFolder = '/mobile-frames';
                setTotalFrames(totalImages);
                console.log('Loading mobile frames:', startFrame, 'to', endFrame);
            } else {
                // Use desktop frames (400-763)
                startFrame = 400;
                endFrame = 763;
                totalImages = endFrame - startFrame + 1; // 364 frames total
                frameFolder = '/frame';
                setTotalFrames(totalImages);
                console.log('Loading desktop frames:', startFrame, 'to', endFrame);
            }

            for(let i = startFrame; i <= endFrame; i++){
                const img = new Image();
                // Pad the number to 3 digits for mobile frames, 5 for desktop
                const frameNumber = isMobileDevice ? 
                    i.toString().padStart(5, '0') : 
                    i.toString().padStart(5, '0');
                
                img.src = `${frameFolder}/frame_${frameNumber}.webp`;
                
                img.onload = () => {
                    loadedCount++;
                    console.log(`Loaded frame ${i} (${loadedCount}/${totalImages})`);
                    if (loadedCount === totalImages) {
                        setImagesLoaded(true);
                        console.log('All frames loaded successfully!');
                    }
                };
                
                img.onerror = () => {
                    console.error(`Failed to load frame: ${frameFolder}/frame_${frameNumber}.webp`);
                    loadedCount++; // Still count it to avoid hanging
                    if (loadedCount === totalImages) {
                        setImagesLoaded(true);
                    }
                };
                
                loadedImages.push(img);
            }
            setImages(loadedImages);
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
    }, [isMobile]);

    // Set canvas size responsively
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                // Use window dimensions for mobile compatibility
                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;
                
                // Set canvas resolution
                const pixelRatio = window.devicePixelRatio || 1;
                canvas.width = containerWidth * pixelRatio;
                canvas.height = containerHeight * pixelRatio;
                
                // Set CSS size
                canvas.style.width = `${containerWidth}px`;
                canvas.style.height = `${containerHeight}px`;
                
                // Scale context for retina displays
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(pixelRatio, pixelRatio);
                }
                
                console.log(`Canvas resized to: ${containerWidth}x${containerHeight}, ratio: ${pixelRatio}`);
            }
        };

        // Initial resize
        resizeCanvas();

        // Listen for window resize
        window.addEventListener('resize', resizeCanvas);
        
        // Listen for orientation change on mobile with longer delay
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 500); // Longer delay for mobile orientation change
        });

        // Also listen for mobile browser address bar changes
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    resizeCanvas();
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Only add scroll listener on mobile for address bar handling
        if (window.innerWidth <= 768) {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('orientationchange', resizeCanvas);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const currentIndex = useTransform(scrollYProgress, [0, 1], [0, totalFrames - 1]); // Dynamic based on device
    
    // Logo parallax transforms
    // const logoY = useTransform(scrollYProgress, [0, 1], ['100vh', '-20vh']);
    // const logoOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    // const logoScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2]);

    const render = useCallback(
        (index: number) => {
            const canvas = canvasRef.current;
            if (!canvas || !imagesLoaded || !images.length) return;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const imageIndex = Math.max(0, Math.min(Math.round(index), images.length - 1));
            const img = images[imageIndex];
            
            if (img && img.complete) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Get actual display dimensions (not canvas resolution)
                const displayWidth = parseInt(canvas.style.width) || canvas.width;
                const displayHeight = parseInt(canvas.style.height) || canvas.height;
                
                // Smart responsive cropping based on device orientation
                const canvasAspect = displayWidth / displayHeight;
                const imageAspect = img.naturalWidth / img.naturalHeight;
                const isMobileDevice = displayWidth < 768; // Mobile breakpoint
                const isPortrait = displayHeight > displayWidth;
                
                let drawWidth, drawHeight, offsetX, offsetY;
                
                if (isMobileDevice) {
                    // Mobile: Use mobile-optimized frames that are already sized for mobile
                    if (isPortrait) {
                        // Portrait mobile: fit to screen width
                        drawWidth = displayWidth;
                        drawHeight = displayWidth / imageAspect;
                        offsetX = 0;
                        offsetY = (displayHeight - drawHeight) / 2;
                    } else {
                        // Landscape mobile: fit to screen height
                        drawHeight = displayHeight;
                        drawWidth = displayHeight * imageAspect;
                        offsetX = (displayWidth - drawWidth) / 2;
                        offsetY = 0;
                    }
                } else {
                    // Desktop: Use desktop frames with smart cropping
                    if (canvasAspect > imageAspect) {
                        // Wider canvas - fit width and crop height
                        drawWidth = displayWidth;
                        drawHeight = displayWidth / imageAspect;
                        offsetX = 0;
                        offsetY = (displayHeight - drawHeight) / 2;
                    } else {
                        // Taller canvas - fit height and crop width
                        drawHeight = displayHeight;
                        drawWidth = displayHeight * imageAspect;
                        offsetX = (displayWidth - drawWidth) / 2;
                        offsetY = 0;
                    }
                }
                
                // Draw image with smart cropping
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
        },
        [images, imagesLoaded]
    );

    useMotionValueEvent(currentIndex, 'change', (latest) => {
        const frameIndex = Math.round(Number(latest));
        console.log(`Scroll progress: ${scrollYProgress.get()}, Frame: ${frameIndex}`);
        render(frameIndex);
    });

    // Initial render when component mounts
    useEffect(() => {
        if (imagesLoaded && images.length > 0) {
            render(0); // Render first frame
        }
    }, [imagesLoaded, images, render]);

    return (
        <section 
            ref={containerRef}
            className="relative bg-black"
            style={{ height: isMobile ? "250svh" : "300svh", touchAction: 'pan-y' }}
        >
            <div className="sticky top-0 h-[100svh] w-full flex items-center justify-center  bg-black">
                <canvas 
                    ref={canvasRef}
                    className="block"
                    style={{
                        display: 'block',
                        width: '100vw',
                        height: '100vh',
                        objectFit: 'cover',
                        pointerEvents: 'none',
                        zIndex: 1000
                    }}
                />
                {!imagesLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black text-white text-xl z-50">
                        <div className="text-center">
                            <div>Loading frames...</div>
                            <div className="text-sm mt-2">
                                {Math.round((images.filter(img => img.complete).length / totalFrames) * 100)}%
                            </div>
                            <div className="text-xs mt-1 text-gray-400">
                                {isMobile ? 'Mobile frames' : 'Desktop frames'} ({totalFrames} total)
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Cardrive