"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export default function FullscreenMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [clickedPoints, setClickedPoints] = useState<{x: number, y: number}[]>([]);
  const [isPathCreationMode, setIsPathCreationMode] = useState(false);
  const storeLocatorContainerRef = useRef<HTMLDivElement | null>(null);

  // Generate path string from clicked points
  const generatePathFromPoints = (points: {x: number, y: number}[]) => {
    if (points.length < 2) return "";
    
    let pathString = `M${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      if (i === 1) {
        pathString += ` L${points[i].x},${points[i].y}`;
      } else {
        // Use quadratic curves for smoother paths
        const prevPoint = points[i-1];
        const currentPoint = points[i];
        const controlX = (prevPoint.x + currentPoint.x) / 2;
        const controlY = (prevPoint.y + currentPoint.y) / 2;
        pathString += ` Q${controlX},${controlY} ${currentPoint.x},${currentPoint.y}`;
      }
    }
    
    return pathString;
  };

  useEffect(() => {
    if (!svgRef.current || !circleRef.current || !pathRef.current) {
      console.log("Refs not ready");
      return;
    }

    const svg = svgRef.current;
    const circle = circleRef.current;
    const path = pathRef.current;

    console.log("Initializing map animation");

    // Set initial viewBox for your custom map (1687×758)
    svg.setAttribute("viewBox", "0 0 1687 758");

    // Make sure the container is visible
    const container = svg.parentElement;
    if (container) {
      container.style.opacity = "1";
    }

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: "#scrollDist",
        start: "0 0",
        end: "100% 100%",
        scrub: 1,
        onUpdate: () => {
          // Get circle position during animation
          const circleX = gsap.getProperty(circle, "x") as number;
          const circleY = gsap.getProperty(circle, "y") as number;

          if (circleX && circleY) {
            // Create dynamic viewBox that follows the circle
            const viewBoxSize = 300; // Zoomed view size
            const newViewBox = {
              x: circleX - viewBoxSize / 2,
              y: circleY - viewBoxSize / 2,
              width: viewBoxSize,
              height: viewBoxSize,
            };

            // Update viewBox to follow the circle
            svg.setAttribute(
              "viewBox",
              `${newViewBox.x} ${newViewBox.y} ${newViewBox.width} ${newViewBox.height}`
            );
          }
        },
      },
    });

    // Set initial position to start of path (car rental location)
    gsap.set(circle, { x: 720, y: 611 });

    tl.to(
      circle,
      {
        motionPath: {
          path: path,
          align: path,
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
        },
        immediateRender: true,
      },
      0
    ).fromTo(
      path,
      {
        strokeDasharray: path.getTotalLength(),
        strokeDashoffset: path.getTotalLength(),
      },
      {
        strokeDashoffset: 0,
      },
      0
    );

    // fade in effect
    gsap.to(svg.parentElement, {
      duration: 1,
      opacity: 1,
      ease: "power2.inOut",
      delay: 0.3,
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Initialize Google Maps Store Locator
  useEffect(() => {
    if (!storeLocatorContainerRef.current) return;
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set');
      return;
    }

    const initStoreLocator = async () => {
      try {
        // Wait for custom elements to be defined
        await customElements.whenDefined('gmpx-api-loader');
        await customElements.whenDefined('gmpx-store-locator');

        const container = storeLocatorContainerRef.current;
        if (!container) return;

        // Create API loader
        const apiLoader = document.createElement('gmpx-api-loader') as any;
        apiLoader.setAttribute('key', apiKey);
        apiLoader.setAttribute('solution-channel', 'GMP_QB_locatorplus_v11_cF');
        
        // Create store locator
        const storeLocator = document.createElement('gmpx-store-locator') as any;
        storeLocator.setAttribute('map-id', 'DEMO_MAP_ID');
        storeLocator.style.width = '100%';
        storeLocator.style.height = '100%';
        storeLocator.style.setProperty('--gmpx-color-surface', '#fff');
        storeLocator.style.setProperty('--gmpx-color-on-surface', '#212121');
        storeLocator.style.setProperty('--gmpx-color-on-surface-variant', '#757575');
        storeLocator.style.setProperty('--gmpx-color-primary', '#1967d2');
        storeLocator.style.setProperty('--gmpx-color-outline', '#e0e0e0');
        storeLocator.style.setProperty('--gmpx-fixed-panel-width-row-layout', '28.5em');
        storeLocator.style.setProperty('--gmpx-fixed-panel-height-column-layout', '65%');
        storeLocator.style.setProperty('--gmpx-font-family-base', 'Roboto, sans-serif');
        storeLocator.style.setProperty('--gmpx-font-family-headings', 'Roboto, sans-serif');
        storeLocator.style.setProperty('--gmpx-font-size-base', '0.875rem');
        storeLocator.style.setProperty('--gmpx-hours-color-open', '#188038');
        storeLocator.style.setProperty('--gmpx-hours-color-closed', '#d50000');
        storeLocator.style.setProperty('--gmpx-rating-color', '#ffb300');
        storeLocator.style.setProperty('--gmpx-rating-color-empty', '#e0e0e0');
        
        container.innerHTML = '';
        container.appendChild(apiLoader);
        container.appendChild(storeLocator);

        // Configure the locator
        const CONFIGURATION = {
          locations: [
            {
              title: "Amseel Cars — Location voiture Agadir / Car Rental Agadir Without Deposit / Location Voiture Agadir Aéroport Sans Caution",
              address1: "Haut founty rdc imm sinwan",
              address2: "Agadir, Morocco",
              coords: { lat: 30.4008209, lng: -9.5775943 },
              placeId: "ChIJ6UYIlG63sw0Rkl2swhA3p08",
              actions: [
                {
                  label: "Book appointment",
                  defaultUrl: "https://www.amseelcars.com/cars"
                }
              ]
            }
          ],
          mapOptions: {
            center: { lat: 30.4008209, lng: -9.5775943 },
            fullscreenControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            zoom: 15,
            zoomControl: true,
            maxZoom: 17,
            mapId: ""
          },
          mapsApiKey: apiKey,
          capabilities: {
            input: false,
            autocomplete: false,
            directions: false,
            distanceMatrix: false,
            details: false,
            actions: true
          }
        };

        // Wait a bit for the element to be ready
        setTimeout(() => {
          if (storeLocator && typeof storeLocator.configureFromQuickBuilder === 'function') {
            storeLocator.configureFromQuickBuilder(CONFIGURATION);
          }
        }, 1000);
      } catch (error) {
        console.error('Error initializing Store Locator:', error);
      }
    };

    // Check if script is already loaded
    if (document.querySelector('script[src*="extended-component-library"]')) {
      initStoreLocator();
    } else {
      // Wait for script to load
      const checkScript = setInterval(() => {
        if (document.querySelector('script[src*="extended-component-library"]')) {
          clearInterval(checkScript);
          initStoreLocator();
        }
      }, 100);
      
      return () => clearInterval(checkScript);
    }
  }, []);

  // Handle map clicks to create custom path
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPathCreationMode) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1687;
    const y = ((e.clientY - rect.top) / rect.height) * 758;
    
    const newPoint = { x: Math.round(x), y: Math.round(y) };
    setClickedPoints(prev => [...prev, newPoint]);
    
    console.log(`Point added: ${newPoint.x},${newPoint.y}`);
    console.log('Current path:', generatePathFromPoints([...clickedPoints, newPoint]));
  };

  // Convert GPS coordinates to SVG coordinates (for real Google Maps data)
  // const convertGPSToSVG = (lat: number, lng: number) => {
  //   // Agadir approximate bounds (adjust these based on your actual map)
  //   const minLat = 30.3800;
  //   const maxLat = 30.4400;
  //   const minLng = -9.6200;
  //   const maxLng = -9.5400;
    
  //   const x = ((lng - minLng) / (maxLng - minLng)) * 1687;
  //   const y = ((maxLat - lat) / (maxLat - minLat)) * 758;
    
  //   return { x: Math.round(x), y: Math.round(y) };
  // };

  return (
    <div className="relative h-[100vh] bg-[#f2efe9] ">
      {/* Path Creation Controls */}
      {/* <div className="fixed top-4 left-4 z-50 bg-white p-4 rounded-lg shadow-lg max-w-md">
        <h3 className="font-bold mb-2">🗺️ Route Creator Tool</h3>
        
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setIsPathCreationMode(!isPathCreationMode)}
            className={`px-4 py-2 rounded flex-1 ${
              isPathCreationMode 
                ? 'bg-red-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}
          >
            {isPathCreationMode ? '🛑 Stop Creating' : '✏️ Create Path'}
          </button>
          <button
            onClick={() => setClickedPoints(prev => prev.slice(0, -1))}
            disabled={clickedPoints.length === 0}
            className={`px-3 py-2 rounded ${
              clickedPoints.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
            title="Remove last point"
          >
            ↶
          </button>
          <button
            onClick={() => setClickedPoints([])}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            title="Clear all points"
          >
            🗑️
          </button>
        </div>

        <div className="text-sm space-y-2">
          <div className="flex items-center justify-between">
            <span>Points: <strong>{clickedPoints.length}</strong></span>
            {isPathCreationMode && (
              <span className="text-blue-600">👆 Click on roads to add points</span>
            )}
          </div>
          
          {clickedPoints.length > 1 && (
            <div className="border-t pt-2">
              <div className="font-bold mb-1">Generated Path Code:</div>
              <textarea
                readOnly
                value={generatePathFromPoints(clickedPoints)}
                className="w-full h-20 text-xs font-mono bg-gray-100 p-2 rounded border resize-none"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <div className="text-xs text-gray-600 mt-1">
                ☝️ Click to select all, then copy to use in your code
              </div>
            </div>
          )}
          
          {isPathCreationMode && (
            <div className="bg-blue-50 p-2 rounded text-xs">
              <strong>💡 Tips:</strong>
              <br />• Click along the actual roads on the map
              <br />• Start from your car rental location (red pin)
              <br />• Add 5-10 points for a smooth route
              <br />• Follow the main streets and highways
            </div>
          )}
        </div>
      </div> */}

      {/* Scroll area */}
      <div id="scrollDist" className="absolute top-0 left-0 w-full h-full"></div>

      {/* Car Dashboard Container (sticky fills screen) */}
      <div
        id="mapContainer"
        className="sticky w-screen h-screen top-0 left-0 overflow-hidden bg-black flex items-center justify-center"
      >
        {/* Dashboard Background */}
        <div className="relative w-full h-full">
          <Image
            src="/images/cardashboard.png"
            alt="Car Dashboard"
            fill
            priority
            sizes="100vw"
            className="object-cover pointer-events-none select-none"
          />
  
          {/* Map Screen Area - positioned over the dashboard screen */}
          <div
            className="absolute 
                       top-[28%] left-[10%] w-[80%] h-[52%]
                       md:top-[31%] md:left-[15%] md:w-[70%] md:h-[49%]
                       lg:top-[32%] lg:left-[16.5%] lg:w-[65%] lg:h-[48%]
                       rounded-xl overflow-hidden border border-gray-600 shadow-inner"
          >
            {/* 
              To get the correct embed URL:
              1. Go to https://www.google.com/maps
              2. Search for "Amseel cars Agadir" or use the address: "Haut founty rdc imm sinwan, Agadir 80000, Morocco"
              3. Click the "Share" button
              4. Select "Embed a map"
              5. Copy the iframe src URL and replace the src below
            */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.1234567890!2d-9.577593!3d30.4007408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdb3b76e940846e9%3A0x4fa73710c2ac5d92!2sAmseel%20cars!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus"
              width="100%" 
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Amseel Cars Location - Agadir"
            ></iframe>
          </div>
          

        </div>
      </div>
      
    </div>
  );
}
