"use client";

import { useEffect, useRef, useState } from "react";
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
    <div className="relative h-[500vh] bg-[#f2efe9] ">
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
          <img
            src="/images/cardashboard.png"
            alt="Car Dashboard"
            className="w-full h-full object-cover"
          />
          
          {/* Map Screen Area - positioned over the dashboard screen */}
          <div className="absolute top-[32%] left-[16.5%] w-[65%] h-[48%] rounded-xl overflow-hidden border border-gray-600 shadow-inner">
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1687 758"
              className="w-full h-full cursor-crosshair bg-gray-900"
              style={{ transform: 'scale(1.2)', transformOrigin: 'center center' }}
              onClick={handleMapClick}
            >
          {/* Map background - your custom Agadir map */}
          <image
            href="/images/myownmap.png"
            width="1687"
            height="758"
            onError={(e) => {
              console.log("Custom map failed to load");
              (e.target as SVGImageElement).style.display = "none";
            }}
          />

          {/* Business route path - Click on map to create accurate route */}
          <path
            ref={pathRef}
            id="p"
            stroke="#2563eb"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            d={clickedPoints.length > 1 ? generatePathFromPoints(clickedPoints) : "M720,611 L710,596 Q703.5,583.5 697,571 Q686,557.5 675,544 Q672,537.5 669,531 Q657,528.5 645,526 Q637,521 629,516 Q629.5,522.5 630,529 Q627.5,519 625,509 Q619,503.5 613,498 Q605.5,499 598,500 Q599.5,487.5 601,475 Q604.5,465.5 608,456 Q618,448.5 628,441 Q638.5,439.5 649,438 Q658.5,429.5 668,421 Q680.5,411.5 693,402 Q712.5,391.5 732,381 Q745,376 758,371 Q765.5,375.5 773,380 Q792,374.5 811,369 Q842.5,349 874,329 Q897.5,313.5 921,298 Q929.5,294 938,290 Q946,287 954,284 Q957.5,275.5 961,267 Q963.5,258.5 966,250 Q962.5,240 959,230 Q950,228 941,226 Q940.5,207.5 940,189 Q938,167 936,145 Q945.5,143.5 955,142 Q954.5,132 954,122 Q956.5,122 959,122"}
            strokeDasharray={isPathCreationMode ? "5,5" : "none"}
          />

          {/* Show clicked points as dots when creating path */}
          {isPathCreationMode && clickedPoints.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={point.x + 10}
                y={point.y - 10}
                fontSize="12"
                fill="#ef4444"
                fontWeight="bold"
              >
                {index + 1}
              </text>
            </g>
          ))}

          {/* GPS tracking circle */}
          <circle
            ref={circleRef}
            id="c"
            r="8"
            fill="#2563eb"
            stroke="white"
            strokeWidth="2"
          >
            <animate
              attributeName="r"
              values="8;16;8"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>

        
            </svg>
          </div>
        </div>
      </div>
      
    </div>
  );
}
