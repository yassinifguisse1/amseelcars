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
//       const totalImages = 833;

//       // Create a promise for each image load
//       const imagePromises = [];

//       for (let i = 1; i <= totalImages; i++) {
//         const imagePromise = new Promise<HTMLImageElement>(
//           (resolve, reject) => {
//             const img = document.createElement("img");
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
//             img.src = `/frames/${i}.webp`;
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

//   const currentIndex = useTransform(scrollYProgress, [0, 1], [1, 833]);

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
//                 {loadingProgress}% ({Math.round((loadingProgress / 100) * 833)}
//                 /833 frames)
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
    
    const {scrollYProgress} = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    });

    // Load images on client side only
    useEffect(() => {
        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            let loadedCount = 0;
            
            // Load all frames from 1 to 833
            const startFrame = 1;
            const endFrame = 833;
            const totalImages = endFrame - startFrame + 1; // 833 frames total

            for(let i = startFrame; i <= endFrame; i++){
                const img = new Image();
                // Pad the number to 5 digits (00694, 00695, etc.)
                const frameNumber = i.toString().padStart(5, '0');
                
                // Option to use mobile-specific frames if available
                // Uncomment these lines if you create mobile-optimized frames:
                // const isMobile = window.innerWidth < 768;
                // const frameFolder = isMobile ? '/frame/mobile' : '/frame';
                // img.src = `${frameFolder}/frame_${frameNumber}.webp`;
                
                img.src = `/frame/frame_${frameNumber}.webp`;
                
                img.onload = () => {
                    loadedCount++;
                    console.log(`Loaded frame ${i} (${loadedCount}/${totalImages})`);
                    if (loadedCount === totalImages) {
                        setImagesLoaded(true);
                        console.log('All frames loaded successfully!');
                    }
                };
                
                img.onerror = () => {
                    console.error(`Failed to load frame: /frame/frame_${frameNumber}.webp`);
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
    }, []);

    // Set canvas size responsively
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                // Get container dimensions
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                
                // Set canvas size to fill container
                canvas.width = containerWidth;
                canvas.height = containerHeight;
                
                // Set CSS size to match
                canvas.style.width = `${containerWidth}px`;
                canvas.style.height = `${containerHeight}px`;
                
                console.log(`Canvas resized to: ${containerWidth}x${containerHeight}`);
            }
        };

        // Initial resize
        resizeCanvas();

        // Listen for window resize
        window.addEventListener('resize', resizeCanvas);
        
        // Also listen for orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 100); // Small delay for orientation change
        });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('orientationchange', resizeCanvas);
        };
    }, []);

    const currentIndex = useTransform(scrollYProgress, [0, 1], [0, 832]); // 0-832 for 833 frames
    
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
                
                // Smart responsive cropping based on device orientation
                const canvasAspect = canvas.width / canvas.height;
                const imageAspect = img.naturalWidth / img.naturalHeight;
                const isMobile = canvas.width < 768; // Mobile breakpoint
                const isPortrait = canvas.height > canvas.width;
                
                let drawWidth, drawHeight, offsetX, offsetY;
                
                if (isMobile && isPortrait) {
                    // Mobile portrait: Focus on center-bottom (where car usually is)
                    drawHeight = canvas.height;
                    drawWidth = canvas.height * imageAspect;
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = -drawHeight * 0.1; // Shift up slightly to show more car
                } else if (canvasAspect > imageAspect) {
                    // Wider canvas - fit width and crop height
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / imageAspect;
                    offsetX = 0;
                    offsetY = (canvas.height - drawHeight) / 2;
                } else {
                    // Taller canvas - fit height and crop width
                    drawHeight = canvas.height;
                    drawWidth = canvas.height * imageAspect;
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = 0;
                }
                
                // Draw image with smart cropping
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
        },
        [images, imagesLoaded]
    );

    useMotionValueEvent(currentIndex, 'change', (latest) => {
        render(Math.round(Number(latest)));
    });

    return (
        <section 
            ref={containerRef}
            className="relative bg-black"
            style={{ height: "400vh" }}
        >
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-black">
                <canvas 
                    ref={canvasRef}
                    className="block"
                    style={{
                        display: 'block',
                        width: '100vw',
                        height: '100vh',
                        objectFit: 'cover'
                    }}
                />
                {!imagesLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black text-white text-xl">
                        <div className="text-center">
                            <div>Loading frames...</div>
                            <div className="text-sm mt-2">
                                {Math.round((images.filter(img => img.complete).length / 833) * 100)}%
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Cardrive