// "use client";
// import { useEffect, useRef } from "react";
// import Image from "next/image";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { MotionPathPlugin } from "gsap/MotionPathPlugin";

// gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// export default function CarDashboardMap() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const mapContainerRef = useRef<HTMLDivElement>(null);
//   const circleRef = useRef<SVGCircleElement>(null);
//   const pathRef = useRef<SVGPathElement>(null);

//   useEffect(() => {
//     if (
//       !containerRef.current ||
//       !mapContainerRef.current ||
//       !pathRef.current ||
//       !circleRef.current
//     )
//       return;

//     const path = pathRef.current;
//     const circle = circleRef.current;
//     const mapContainer = mapContainerRef.current;
//     const container = containerRef.current;

//     // Create GSAP timeline with ScrollTrigger for sticky behavior and animation
//     const tl = gsap.timeline({
//       defaults: { ease: "none" },
//       scrollTrigger: {
//         trigger: container,
//         start: "top top",
//         end: "+=200vh", // Make it stick for 2 viewport heights
//         pin: true,
//         pinSpacing: true,
//         scrub: 1,
//       },
//     });

//     // Initialize path for drawing animation
//     const pathLength = path.getTotalLength();
//     gsap.set(path, {
//       strokeDasharray: pathLength,
//       strokeDashoffset: pathLength,
//     });

//     // Animate the circle along the path and draw the path simultaneously
//     tl.to(
//       circle,
//       {
//         motionPath: {
//           path: path,
//           align: path,
//           alignOrigin: [0.5, 0.5],
//           autoRotate: false,
//         },
//         immediateRender: true,
//       },
//       0
//     ).to(
//       path,
//       {
//         strokeDashoffset: 0,
//       },
//       0
//     );

//     // Move map container to follow the circle with quickTo for smooth performance
//     const xTo = gsap.quickTo(mapContainer, "x", { duration: 0.7 });
//     const yTo = gsap.quickTo(mapContainer, "y", { duration: 0.7 });

//     // Add ticker to continuously update map position based on circle position
//     const updateMapPosition = () => {
//       const circleX = gsap.getProperty(circle, "x") as number;
//       const circleY = gsap.getProperty(circle, "y") as number;

//       // Move map container opposite to circle movement for parallax effect
//       xTo(-circleX * 0.3);
//       yTo(-circleY * 0.3);
//     };

//     gsap.ticker.add(updateMapPosition);

//     // Center the container position
//     const centerContainer = () => {
//       gsap.set(mapContainer, {
//         left: "50%",
//         top: "50%",
//         xPercent: -50,
//         yPercent: -50,
//       });
//     };

//     centerContainer();
//     window.addEventListener("resize", centerContainer);

//     // Fade in animation
//     gsap.to(mapContainer, {
//       duration: 1,
//       opacity: 1,
//       ease: "power2.inOut",
//       delay: 0.3,
//     });

//     // Cleanup
//     return () => {
//       gsap.ticker.remove(updateMapPosition);
//       window.removeEventListener("resize", centerContainer);
//       ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
//     };
//   }, []);

//   return (
//     <section className="relative w-full bg-black">
//       {/* Sticky Dashboard Container */}
//       <div ref={containerRef} className="relative w-full h-screen">
//         {/* Dashboard background - Full width */}
//         <div className="relative w-full h-full">
//           <Image
//             src="/images/cardashboard.png"
//             alt="Car Dashboard"
//             fill
//             className="object-cover"
//             priority
//           />

//           {/* Screen area - positioned where the dashboard screen is */}
//           <div className="absolute top-[30%] left-[20%] w-full h-[50%] md:left-[16%] md:w-[66%] overflow-hidden rounded-lg">
//             {/* Map container that moves */}
//             <div
//               ref={mapContainerRef}
//               className="absolute inset-0 opacity-0"
//               style={{
//                 width: "200%",
//                 height: "200%",
//                 left: "-50%",
//                 top: "-50%",
//               }}
//             >
//               <Image
//                 src="/images/map.png"
//                 alt="Map"
//                 fill
//                 className="object-cover"
//                 priority
//               />

//               {/* SVG overlay for path and circle */}
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="absolute inset-0 w-full h-full"
//                 viewBox="0 0 400 300"
//                 preserveAspectRatio="xMidYMid meet"
//               >
//                 <defs>
//                   <filter id="glow">
//                     <feGaussianBlur stdDeviation="3" result="coloredBlur" />
//                     <feMerge>
//                       <feMergeNode in="coloredBlur" />
//                       <feMergeNode in="SourceGraphic" />
//                     </feMerge>
//                   </filter>
//                   <filter id="strong-glow">
//                     <feGaussianBlur stdDeviation="5" result="coloredBlur" />
//                     <feMerge>
//                       <feMergeNode in="coloredBlur" />
//                       <feMergeNode in="SourceGraphic" />
//                     </feMerge>
//                   </filter>
//                 </defs>

//                 <circle
//                   ref={circleRef}
//                   r="8"
//                   fill="#00ff88"
//                   stroke="#ffffff"
//                   strokeWidth="3"
//                   filter="url(#strong-glow)"
//                   className="drop-shadow-lg gps-pulse"
//                 />

//                 <path
//                   ref={pathRef}
//                   stroke="#00ff88"
//                   strokeWidth="4"
//                   fill="none"
//                   filter="url(#glow)"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M50,250 Q80,180 120,200 Q160,220 200,180 Q240,140 280,160 Q320,180 350,120 Q380,80 400,100"
//                   className="drop-shadow-lg"
//                 />
//               </svg>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export default function CarDashboardMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (
      !containerRef.current ||
      !mapContainerRef.current ||
      !pathRef.current ||
      !circleRef.current
    )
      return;

    const path = pathRef.current;
    const circle = circleRef.current;
    const mapContainer = mapContainerRef.current;
    const container = containerRef.current;

    // Initialize path for drawing animation
    const pathLength = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });

    // Create GSAP timeline with ScrollTrigger
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=300vh", // Extended scroll distance for smoother animation
        pin: true,
        pinSpacing: true,
        scrub: 1.2, // Slightly smoother scrub
      },
    });

    // Animate the circle along the path and draw the path simultaneously
    tl.to(
      circle,
      {
        motionPath: {
          path: path,
          align: path,
          alignOrigin: [0.5, 0.5],
          autoRotate: false,
        },
        immediateRender: true,
      },
      0
    ).to(
      path,
      {
        strokeDashoffset: 0,
      },
      0
    );

    // Move map container to follow the circle with better performance
    const xTo = gsap.quickTo(mapContainer, "x", {
      duration: 0.8,
      ease: "power2.out",
    });
    const yTo = gsap.quickTo(mapContainer, "y", {
      duration: 0.8,
      ease: "power2.out",
    });

    // Update map position based on circle position
    const updateMapPosition = () => {
      const circleX = gsap.getProperty(circle, "x");
      const circleY = gsap.getProperty(circle, "y");

      // Move map container opposite to circle movement for parallax effect
      xTo(-circleX * 0.25); // Slightly reduced multiplier for smoother movement
      yTo(-circleY * 0.25);
    };

    gsap.ticker.add(updateMapPosition);

    // Center the container position
    const centerContainer = () => {
      gsap.set(mapContainer, {
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
      });
    };

    centerContainer();
    window.addEventListener("resize", centerContainer);

    // Fade in animation
    gsap.fromTo(
      mapContainer,
      { opacity: 0, scale: 0.95 },
      {
        duration: 1.2,
        opacity: 1,
        scale: 1,
        ease: "power2.out",
        delay: 0.5,
      }
    );

    // Cleanup
    return () => {
      gsap.ticker.remove(updateMapPosition);
      window.removeEventListener("resize", centerContainer);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      tl.kill();
    };
  }, []);

  return (
    <div className="w-full bg-black">
      {/* Content before dashboard */}
      <section className="h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">Premium Car Rental</h1>
          <p className="text-xl text-gray-300">
            Experience luxury on every journey
          </p>
        </div>
      </section>

      {/* Sticky Dashboard Container */}
      <div ref={containerRef} className="relative w-full h-screen bg-black">
        {/* Dashboard background */}
        <div className="relative w-full h-full">
          <img
            src="/images/cardashboard.png"
            alt="Car Dashboard"
            className="w-full h-full object-cover"
          />

          {/* Screen area - positioned where the dashboard screen should be */}
          <div className="absolute top-[28%] left-[18%] w-[64%] h-[44%] overflow-hidden rounded-lg border-2 border-gray-800 shadow-2xl">
            {/* Map container that moves */}
            <div
              ref={mapContainerRef}
              className="absolute opacity-0 bg-white"
              style={{
                width: "250%",
                height: "250%",
                left: "-75%",
                top: "-75%",
              }}
            >
              <img
                src="/images/map.png"
                alt="Map"
                className="w-full h-full object-cover"
              />

              {/* SVG overlay for path and circle */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 500 400"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <filter
                    id="glow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter
                    id="strong-glow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id="circleGradient" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#00ff88" />
                    <stop offset="100%" stopColor="#00cc66" />
                  </radialGradient>
                </defs>

                {/* Animated circle */}
                <circle
                  ref={circleRef}
                  r="10"
                  fill="url(#circleGradient)"
                  stroke="#ffffff"
                  strokeWidth="3"
                  filter="url(#strong-glow)"
                  className="drop-shadow-lg"
                >
                  <animate
                    attributeName="r"
                    values="8;12;8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Animated path */}
                <path
                  ref={pathRef}
                  stroke="#00ff88"
                  strokeWidth="5"
                  fill="none"
                  filter="url(#glow)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M50,320 Q100,280 150,300 Q200,320 250,280 Q300,240 350,260 Q400,280 420,220 Q440,180 470,200 Q480,190 490,180"
                  className="drop-shadow-lg"
                />
              </svg>
            </div>

            {/* Dashboard UI Elements Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top status bar */}
              <div className="absolute top-2 left-4 right-4 flex justify-between items-center text-white text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>GPS Active</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>11:24 AM</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-3 bg-white"></div>
                    <div className="w-1 h-3 bg-white"></div>
                    <div className="w-1 h-2 bg-white"></div>
                    <div className="w-1 h-1 bg-gray-400"></div>
                  </div>
                </div>
              </div>

              {/* Bottom navigation */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black bg-opacity-70 rounded-lg px-4 py-2 text-white text-center">
                  <div className="text-sm text-green-400 mb-1">
                    Current Route
                  </div>
                  <div className="text-lg font-semibold">
                    Downtown Business District
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Estimated arrival: 15 minutes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content after dashboard */}
      <section className="h-screen bg-gradient-to-t from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-5xl font-bold mb-4">Your Journey Awaits</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            With our premium GPS navigation system, every destination becomes an
            adventure. Experience seamless travel with real-time updates and
            precise location tracking.
          </p>
        </div>
      </section>
    </div>
  );
}
