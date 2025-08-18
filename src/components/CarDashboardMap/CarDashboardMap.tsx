"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
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

    // Create GSAP timeline with ScrollTrigger for sticky behavior and animation
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=200vh", // Make it stick for 2 viewport heights
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onEnter: () => {
          // Add visual feedback when entering sticky section
          gsap.to(".dashboard-element", {
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
          });
        },
        onLeave: () => {
          // Reset scale when leaving sticky section
          gsap.to(".dashboard-element", {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        },
        onUpdate: (self) => {
          const progress = self.progress;

          // Update progress indicators
          const scrollProgressBar = document.getElementById("scroll-progress");
          const routeProgressBar = document.getElementById("route-progress");
          const progressText = document.getElementById("progress-text");

          if (scrollProgressBar) {
            scrollProgressBar.style.height = `${progress * 100}%`;
          }

          if (routeProgressBar) {
            routeProgressBar.style.width = `${progress * 100}%`;
          }

          if (progressText) {
            progressText.textContent = `${Math.round(progress * 100)}%`;
          }

          // Add dynamic glow effect based on progress
          const glowIntensity = 0.3 + progress * 0.4;
          if (container) {
            container.style.filter = `drop-shadow(0 0 ${
              20 + progress * 30
            }px rgba(0, 255, 136, ${glowIntensity}))`;
          }
        },
      },
    });

    // Initialize path for drawing animation
    const pathLength = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });

    // // Animate the circle along the path and draw the path simultaneously
    // tl.to(
    //   circle,
    //   {
    //     motionPath: {
    //       path: path,
    //       align: path,
    //       alignOrigin: "0.5 0.5",
    //       autoRotate: false,
    //     },
    //     immediateRender: true,
    //   },
    //   0
    // ).to(
    //   path,
    //   {
    //     strokeDashoffset: 0,
    //   },
    //   0
    // );

    // Move map container to follow the circle with quickTo for smooth performance
    const xTo = gsap.quickTo(mapContainer, "x", { duration: 0.7 });
    const yTo = gsap.quickTo(mapContainer, "y", { duration: 0.7 });

    // Add ticker to continuously update map position based on circle position
    const updateMapPosition = () => {
      const circleX = gsap.getProperty(circle, "x") as number;
      const circleY = gsap.getProperty(circle, "y") as number;

      // Move map container opposite to circle movement for parallax effect
      xTo(-circleX * 0.3);
      yTo(-circleY * 0.3);
    };

    gsap.ticker.add(updateMapPosition);

    // Center the container position (similar to window.onload/onresize in your example)
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
    gsap.to(mapContainer, {
      duration: 1,
      opacity: 1,
      ease: "power2.inOut",
      delay: 0.3,
    });

    // Animate dashboard elements on load
    gsap.fromTo(
      ".dashboard-element",
      {
        opacity: 0,
        scale: 0.8,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
        delay: 0.5,
      }
    );

    // Cleanup
    return () => {
      gsap.ticker.remove(updateMapPosition);
      window.removeEventListener("resize", centerContainer);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section className="relative w-full bg-black">
      {/* Sticky Dashboard Container */}
      <div ref={containerRef} className="relative w-full h-screen">
        {/* Dashboard container - Full width */}
        <div className="relative w-full h-full">
          {/* Dashboard background - Full width */}
          <div className="relative w-full h-full">
            <Image
              src="/images/cardashboard.png"
              alt="Car Dashboard"
              fill
              className="object-cover"
              priority
            />

            {/* Screen area - positioned where the dashboard screen is */}
            <div className="absolute top-[15%] left-[20%] w-[60%] h-[60%] md:left-[25%] md:w-[50%] overflow-hidden rounded-lg bg-black/20 backdrop-blur-sm dashboard-glow map-overlay">
              {/* Map container that moves */}
              <div
                ref={mapContainerRef}
                className="absolute inset-0 opacity-0"
                style={{
                  width: "200%",
                  height: "200%",
                  left: "-50%",
                  top: "-50%",
                }}
              >
                <Image
                  src="/images/map.png"
                  alt="Map"
                  fill
                  className="object-cover opacity-90"
                  priority
                />

                {/* SVG overlay for path and circle */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 400 300"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="strong-glow">
                      <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <circle
                    ref={circleRef}
                    r="8"
                    fill="#00ff88"
                    stroke="#ffffff"
                    strokeWidth="3"
                    filter="url(#strong-glow)"
                    className="drop-shadow-lg gps-pulse"
                  />

                  <path
                    ref={pathRef}
                    stroke="#00ff88"
                    strokeWidth="4"
                    fill="none"
                    filter="url(#glow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M50,250 Q80,180 120,200 Q160,220 200,180 Q240,140 280,160 Q320,180 350,120 Q380,80 400,100"
                    className="drop-shadow-lg"
                  />
                </svg>
              </div>

              {/* Dashboard UI Elements */}
              <div className="absolute top-4 left-4 text-white text-sm font-mono bg-black/70 px-3 py-2 rounded-lg backdrop-blur-sm border border-green-400/30 dashboard-element">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  GPS Navigation
                </div>
              </div>

              <div className="absolute bottom-4 right-4 text-white text-xs font-mono bg-black/70 px-3 py-2 rounded-lg backdrop-blur-sm border border-green-400/30 dashboard-element">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Route Active
                </div>
              </div>

              {/* Speed and distance info */}
              <div className="absolute top-4 right-4 text-white text-xs font-mono bg-black/70 px-3 py-2 rounded-lg backdrop-blur-sm border border-blue-400/30 dashboard-element">
                <div>ETA: 15 min</div>
                <div>Distance: 8.2 km</div>
              </div>
            </div>

            {/* Additional dashboard elements */}
            <div className="absolute top-[8%] right-[4%] md:right-[8%] text-white dashboard-element">
              <div className="bg-black/50 px-4 py-3 md:px-6 md:py-4 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-center mb-1">
                  120
                </div>
                <div className="text-xs text-center text-gray-300">km/h</div>
              </div>
            </div>

            <div className="absolute bottom-[12%] left-[4%] md:left-[8%] text-white dashboard-element">
              <div className="bg-black/50 px-3 py-2 md:px-4 md:py-3 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-sm">⛽</div>
                  <div>
                    <div className="text-base md:text-lg font-semibold">
                      85%
                    </div>
                    <div className="text-xs text-gray-300">Fuel</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Temperature */}
            <div className="absolute top-[8%] left-[4%] md:left-[8%] text-white dashboard-element">
              <div className="bg-black/50 px-3 py-2 md:px-4 md:py-3 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2">
                  <div className="text-sm">🌡️</div>
                  <div>
                    <div className="text-base md:text-lg font-semibold">
                      22°C
                    </div>
                    <div className="text-xs text-gray-300">Outside</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gear indicator */}
            <div className="absolute bottom-[12%] right-[4%] md:right-[8%] text-white dashboard-element">
              <div className="bg-black/50 px-3 py-2 md:px-4 md:py-3 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold">D</div>
                  <div className="text-xs text-gray-300">Drive</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center text-white z-10 dashboard-element">
          <h2 className="text-4xl font-bold mb-4 text-shadow-lg">
            Smart Dashboard Experience
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Experience real-time navigation with our advanced dashboard system
          </p>
          <div className="mt-6 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Real-time GPS
            </div>
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Smart Navigation
            </div>
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              AI Powered
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute top-1/2 right-8 transform -translate-y-1/2 text-white/60 text-sm dashboard-element">
          <div className="flex flex-col items-center gap-4">
            <div className="text-xs font-mono rotate-90 whitespace-nowrap">
              SCROLL TO NAVIGATE
            </div>
            <div className="relative w-px h-20 bg-white/20">
              <div
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-green-400 to-blue-400 transition-all duration-300 ease-out"
                style={{ height: "0%" }}
                id="scroll-progress"
              ></div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Route progress indicator */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 dashboard-element">
          <div className="bg-black/70 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <div className="flex items-center gap-4 text-white text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full progress-indicator"></div>
                <span>Route Progress</span>
              </div>
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: "0%" }}
                  id="route-progress"
                ></div>
              </div>
              <span id="progress-text">0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content after sticky section */}
      <div className="relative w-full min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl mx-auto px-8">
          <h3 className="text-5xl font-bold mb-8">Journey Complete</h3>
          <p className="text-xl text-gray-300 mb-12">
            You&apos;ve experienced our advanced navigation system in action. The
            route has been successfully mapped and your destination is within
            reach.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-4">🎯</div>
              <h4 className="text-xl font-semibold mb-2">
                Precision Navigation
              </h4>
              <p className="text-gray-400">
                Real-time GPS tracking with centimeter accuracy
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold mb-2">Instant Updates</h4>
              <p className="text-gray-400">
                Live traffic and route optimization
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-4">🚗</div>
              <h4 className="text-xl font-semibold mb-2">Smart Integration</h4>
              <p className="text-gray-400">
                Seamlessly connected to your vehicle systems
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
