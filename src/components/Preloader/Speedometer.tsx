// "use client";

// import { motion, useMotionValue, useSpring, animate } from "framer-motion";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useLoading } from "@/contexts/LoadingContext";


// type Props = {
//   value?: number;           // external value (0..max). If omitted, component auto-plays
//   min?: number;             // default 0
//   max?: number;             // default 160
//   size?: number;            // px (svg box), default 360
//   autoplay?: boolean;       // default true when value is undefined
//   className?: string;
// };

// const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
// const map = (n: number, a: number, b: number, c: number, d: number) =>
//   ((n - a) / (b - a)) * (d - c) + c;

// // SVG arc helper (degrees)
// function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
//   const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
//   const sx = cx + r * Math.cos(toRad(start));
//   const sy = cy + r * Math.sin(toRad(start));
//   const ex = cx + r * Math.cos(toRad(end));
//   const ey = cy + r * Math.sin(toRad(end));
//   const largeArcFlag = end - start <= 180 ? "0" : "1";
//   return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArcFlag} 1 ${ex} ${ey}`;
// }

// export default function Speedometer({
//   value,
//   min = 0,
//   max = 160,
//   size = 360,
//   autoplay,
//   className = "",
// }: Props) {
//  const { loadingState } = useLoading();
//   const box = size;
//   const cx = box / 2;
//   const cy = box / 2 + box * 0.12; // drop center a touch for nicer look
//   const radius = box * 0.36;

//   // angles
//   const START = -120;
//   const END = 120;

//   // motion state
//   const mv = useMotionValue(0); // raw value
//   const needle = useSpring(
//     mv, { stiffness: 10, damping: 10, mass: 1.9 }
//   ); // springed mph - smoother and slower

//   // keep in sync if value prop provided
//   useEffect(() => {
//     if (typeof value === "number") mv.set(clamp(value, min, max));
//   }, [value, min, max, mv]);
//  // whenever progress updates, ease the needle to the mapped value
//  useEffect(() => {
//     const target = map(loadingState.framesProgress, 0, 100, min, max);
//     // tween a bit so it’s smooth but responsive
//     const controls = animate(mv, target, { duration: 0.35, ease: [0.33,0,0.2,1] });
//     return () => controls.stop();
//   }, [loadingState.framesProgress, mv, min, max]);
//   // autoplay when no external value
//   useEffect(() => {
//     if (!loadingState.framesLoaded) return;
//   // small overshoot and settle
//   const controls = animate(mv, [max, max * 0.9, max], {
//     times: [0, 0.6, 1],
//     duration: 1.2,
//     ease: "easeOut",
//   });
//   return () => controls.stop();
//   }, [loadingState.framesLoaded, mv, max]);

//   // convert motion mph -> angle
//   const [angle, setAngle] = useState(START);
//   useEffect(() => {
//     const unsub = needle.on("change", (mph) => {
//       setAngle(map(mph, min, max, START, END));
//     });
//     return () => unsub();
//   }, [needle, min, max]);

//   // Rolling number with smooth animation
//   const [display, setDisplay] = useState(0);
//   const displaySpring = useSpring(0, { stiffness: 40, damping: 25, mass: 1.0 });
  
//   useEffect(() => {
//     const unsub = needle.on("change", (mph) => {
//       displaySpring.set(Math.round(mph));
//     });
//     return () => unsub();
//   }, [needle, displaySpring]);
  
//   useEffect(() => {
//     const unsub = displaySpring.on("change", (value) => {
//       setDisplay(Math.round(value));
//     });
//     return () => unsub();
//   }, [displaySpring]);

//   // ticks (every 5 mph; major each 20 mph)
//   const ticks = useMemo(() => {
//     const out: { mph: number; ang: number; major: boolean }[] = [];
//     for (let mph = min; mph <= max; mph += 5) {
//       const ang = map(mph, min, max, START, END);
//       out.push({ mph, ang, major: mph % 20 === 0 });
//     }
//     return out;
//   }, [min, max]);

//   // drag to rev
//   const ref = useRef<HTMLDivElement>(null);
//   const dragging = useRef(false);

//   const handlePointer = (e: React.PointerEvent) => {
//     if (!ref.current) return;
//     const rect = ref.current.getBoundingClientRect();
//     const x = e.clientX - rect.left - rect.width / 2;
//     const y = e.clientY - rect.top - (rect.height / 2 + box * 0.12);
//     const deg = Math.atan2(y, x) * (180 / Math.PI) + 90; // convert
//     // clamp to gauge sweep
//     const clampedDeg = clamp(deg, START, END);
//     const mph = map(clampedDeg, START, END, min, max);
//     mv.set(mph);
//   };

//   return (
//     <div
//       ref={ref}
//       className={`relative select-none touch-none ${className}`}
//       style={{ width: box, height: box }}
//       onPointerDown={(e) => {
//         dragging.current = true;
//         ref.current?.setPointerCapture(e.pointerId);
//         handlePointer(e);
//       }}
//       onPointerMove={(e) => dragging.current && handlePointer(e)}
//       onPointerUp={(e) => {
//         dragging.current = false;
//         ref.current?.releasePointerCapture(e.pointerId);
//       }}
//     >
//       {/* backdrop */}
//       <div className="absolute inset-0 rounded-full bg-[#0c0c0d]" />

//       <svg
//         viewBox={`0 0 ${box} ${box}`}
//         className="absolute inset-0"
//         aria-label="Speedometer"
//         role="img"
//       >
//         <defs>
//           <linearGradient id="g-arc" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#f59e0b" />
//             <stop offset="70%" stopColor="#f97316" />
//             <stop offset="100%" stopColor="#ef4444" />
//           </linearGradient>
//           <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
//             <feGaussianBlur stdDeviation="6" result="coloredBlur" />
//             <feMerge>
//               <feMergeNode in="coloredBlur" />
//               <feMergeNode in="SourceGraphic" />
//             </feMerge>
//           </filter>
//         </defs>

//         {/* Outer faint arc */}
//         <path
//           d={describeArc(cx, cy, radius, START, END)}
//           stroke="#2a2a2d"
//           strokeWidth={14}
//           fill="none"
//           strokeLinecap="round"
//         />

//         {/* Progress arc (animated by masking) */}
//         <clipPath id="clip-progress">
//           <path d={describeArc(cx, cy, radius, START, angle)} stroke="#fff" strokeWidth={16} fill="none" />
//         </clipPath>
//         <g clipPath="url(#clip-progress)" filter="url(#glow)">
//           <path
//             d={describeArc(cx, cy, radius, START, END)}
//             stroke="url(#g-arc)"
//             strokeWidth={16}
//             fill="none"
//             strokeLinecap="round"
//           />
//         </g>

//         {/* Ticks */}
//         {ticks.map(({ mph, ang, major }, i) => {
//           const inner = radius - (major ? 24 : 16);
//           const outer = radius + (major ? 2 : 0);
//           const rad = (ang - 90) * (Math.PI / 180);
//           const x1 = cx + inner * Math.cos(rad);
//           const y1 = cy + inner * Math.sin(rad);
//           const x2 = cx + outer * Math.cos(rad);
//           const y2 = cy + outer * Math.sin(rad);

//           // light up if under needle
//           const lit = ang <= angle;
//           return (
//             <line
//               key={i}
//               x1={x1}
//               y1={y1}
//               x2={x2}
//               y2={y2}
//               stroke={lit ? (mph > max * 0.75 ? "#ef4444" : "#f59e0b") : "#3a3a3f"}
//               strokeWidth={major ? 3 : 2}
//               opacity={lit ? 1 : 0.55}
//               strokeLinecap="round"
//             />
//           );
//         })}

//         {/* Labels (every 20 mph) */}
//         {ticks
//           .filter((t) => t.major)
//           .map(({ mph, ang }, i) => {
//             const r = radius - 40;
//             const rad = (ang - 90) * (Math.PI / 180);
//             const tx = cx + r * Math.cos(rad);
//             const ty = cy + r * Math.sin(rad);
//             return (
//               <text
//                 key={i}
//                 x={tx}
//                 y={ty}
//                 textAnchor="middle"
//                 dominantBaseline="middle"
//                 fontSize={box * 0.05}
//                 fill="#c9c9d1"
//                 opacity={0.9}
//               >
//                 {mph}
//               </text>
//             );
//           })}

//         {/* Needle pivot */}
//         <circle cx={cx} cy={cy} r={8} fill="#0b0b0c" />
//         <circle cx={cx} cy={cy} r={5} fill="#ffffff" opacity={0.9} />

//         {/* Needle */}
//         <motion.g
//           style={{
//             rotate: angle, // already spring-driven via state
//             originX: cx,
//             originY: cy,
//           }}
//         >
//           <rect
//             x={cx - 3}
//             y={cy - radius + 10}
//             width={6}
//             height={radius - 20}
//             rx={3}
//             fill="#ffffff"
//             opacity={0.95}
//             filter="url(#glow)"
//           />
//         </motion.g>
//       </svg>

//       {/* MPH readout */}
//       <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: box * 0.24 }}>
//         <div className="flex items-end gap-2">
//           <motion.span
//             key={Math.floor(display / 1)} // forces flip on integer change
//             initial={{ y: 10, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ 
//               type: "spring", 
//               stiffness: 120, 
//               damping: 20,
//               mass: 0.8
//             }}
//             className="tabular-nums font-semibold"
//             style={{ fontSize: box * 0.11, lineHeight: 1, color: "#fff" }}
//           >
//             {display}
//           </motion.span>
//           <span className="text-white/70" style={{ fontSize: box * 0.04 }}>
//             MPH
//           </span>
//         </div>
//       </div>

//       {/* Hint */}
//       <div className="absolute inset-x-0 bottom-3 text-center text-xs text-white/40">
//         Drag to rev
//       </div>
//     </div>
//   );
// }

"use client";

import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import { useLoading } from "@/contexts/LoadingContext";

type Props = {
  value?: number;     // external value (0..max); if omitted we follow LoadingContext
  min?: number;       // default 0
  max?: number;       // default 160
  size?: number;      // px square (SVG viewBox)
  autoplay?: boolean; // kept for API compatibility
  className?: string;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const map = (n: number, a: number, b: number, c: number, d: number) =>
  ((n - a) / (b - a)) * (d - c) + c;

function toRad(deg: number) {
  return (deg - 90) * (Math.PI / 180);
}

// SVG arc helper (degrees)
function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const sx = cx + r * Math.cos(toRad(start));
  const sy = cy + r * Math.sin(toRad(start));
  const ex = cx + r * Math.cos(toRad(end));
  const ey = cy + r * Math.sin(toRad(end));
  const largeArcFlag = end - start <= 180 ? "0" : "1";
  return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArcFlag} 1 ${ex} ${ey}`;
}

export default function Speedometer({
  value,
  min = 0,
  max = 160,
  size = 360,
  autoplay,
  className = "",
}: Props) {
  const { loadingState } = useLoading();
  const uid = useId();

  const box = size;
  const cx = box / 2;
  const cy = box / 2 + box * 0.12; // drop center slightly
  const radius = box * 0.36;

  // sweep
  const START = -120;
  const END = 120;

  // hydration-safe render
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

   /** Mobile detection (to slow things down) */
   const [isMobile, setIsMobile] = useState(false);
   useEffect(() => {
     const mql = window.matchMedia("(max-width: 768px)");
     const update = () => setIsMobile(mql.matches);
     update();
     mql.addEventListener("change", update);
     return () => mql.removeEventListener("change", update);
   }, []);

  // Master MPH value
  const mv = useMotionValue(0);

  // Smooth the needle
  // Heavier spring on mobile -> slower needle
  const needleSpringCfg = isMobile
    ? { stiffness: 28, damping: 34, mass: 2.4 }
    : { stiffness: 40, damping: 28, mass: 1.8 };
  const needle = useSpring(mv, needleSpringCfg);

  // Smooth incoming loader progress first
  const progressRaw = useMotionValue(0);
  const progressSpringCfg = isMobile
    ? { stiffness: 14, damping: 32, mass: 3.0 } // << slower on mobile
    : { stiffness: 26, damping: 26, mass: 2.0 };
  const progressSmooth = useSpring(progressRaw, progressSpringCfg);


  // Follow external value if provided
  useEffect(() => {
    if (typeof value === "number") mv.set(clamp(value, min, max));
  }, [value, min, max, mv]);

  // Compute a safe progress (prefer counts; fallback to provided %)
  useEffect(() => {
    const { loadedFrames, totalFrames, framesProgress } = loadingState;

    let raw: number;
    if (
      typeof loadedFrames === "number" &&
      typeof totalFrames === "number" &&
      totalFrames > 0
    ) {
      raw = (loadedFrames / totalFrames) * 100;
    } else {
      raw = typeof framesProgress === "number" ? framesProgress : 0;
    }

    progressRaw.set(clamp(raw, 0, 100)); // clamp BEFORE smoothing
  }, [loadingState, progressRaw]);

  // Map smoothed progress -> mph (and clamp AGAIN to catch spring overshoot)
  useEffect(() => {
    const unsub = progressSmooth.on("change", (p) => {
      const pClamped = clamp(p, 0, 100);
      mv.set(map(pClamped, 0, 100, min, max));
    });
    return () => unsub();
  }, [progressSmooth, mv, min, max]);

  // Celebrate once frames are fully loaded (within bounds)
  const didCelebrate = useRef(false);
  useEffect(() => {
    if (!loadingState.framesLoaded || didCelebrate.current) return;
    didCelebrate.current = true;
    const controls = animate(mv, [max, max * 0.95, max], {
      times: [0, 0.6, 1],
      duration: 1.1,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [loadingState.framesLoaded, mv, max]);

  // Angle + readout
  const [angle, setAngle] = useState(START);
  useEffect(() => {
    const unsub = needle.on("change", (mph) => {
      const safeMph = clamp(mph, min, max);
      setAngle(map(safeMph, min, max, START, END));
    });
    return () => unsub();
  }, [needle, min, max]);

  const displaySpring = useSpring(0, { stiffness: 18, damping: 22, mass: 1.8 });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const u1 = needle.on("change", (mph) => displaySpring.set(clamp(mph, min, max)));
    const u2 = displaySpring.on("change", (v) => setDisplay(clamp(Math.round(v), min, max)));
    return () => { u1(); u2(); };
  }, [needle, displaySpring, min, max]);

  // Ticks
  const ticks = useMemo(() => {
    const out: { mph: number; ang: number; major: boolean }[] = [];
    for (let mph = min; mph <= max; mph += 5) {
      const ang = map(mph, min, max, START, END);
      out.push({ mph, ang, major: mph % 20 === 0 });
    }
    return out;
  }, [min, max]);

  // Drag to rev (enable when loaded)
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const handlePointer = (e: React.PointerEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - (rect.height / 2 + box * 0.12);
    const deg = Math.atan2(y, x) * (180 / Math.PI) + 90;
    mv.set(map(clamp(deg, START, END), START, END, min, max));
  };

  // Hydration-safe angle
  const displayAngle = hydrated ? angle : START;

  // Tip (radial) line endpoints (at the current angle) — always visible
  const tipInnerR = radius - 8;
  const tipOuterR = radius + 10;
  const cosA = Math.cos(toRad(displayAngle));
  const sinA = Math.sin(toRad(displayAngle));
  const tipX1 = cx + tipInnerR * cosA;
  const tipY1 = cy + tipInnerR * sinA;
  const tipX2 = cx + tipOuterR * cosA;
  const tipY2 = cy + tipOuterR * sinA;

  // Unique IDs to avoid defs collisions
  const idGrad = `g-arc-${uid}`;
  const idGlow = `glow-${uid}`;
  const idClip = `clip-progress-${uid}`;


  if (!hydrated) {
    return (
      <div
        className={`relative mx-auto flex items-center justify-center select-none ${className}`}
        style={{ width: box, height: box }}
        role="img"
        aria-label="Speedometer"
      >
        <div className="absolute inset-0 rounded-full bg-[#0c0c0d]" />
        <div className="absolute inset-[12%] rounded-full border border-white/10" />
        <div className="absolute inset-[22%] rounded-full border border-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative select-none touch-none flex items-center justify-center mx-auto ${className}`}
      style={{ width: box, height: box }}
      onPointerDown={(e) => {
        if (!loadingState.framesLoaded) return;
        dragging.current = true;
        ref.current?.setPointerCapture(e.pointerId);
        handlePointer(e);
      }}
      onPointerMove={(e) => dragging.current && handlePointer(e)}
      onPointerUp={(e) => {
        dragging.current = false;
        ref.current?.releasePointerCapture(e.pointerId);
      }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 rounded-full bg-[#0c0c0d]" />

      <svg
        viewBox={`0 0 ${box} ${box}`}
        className="absolute inset-0"
        aria-label="Speedometer"
        role="img"
        suppressHydrationWarning
      >
        <defs>
          <linearGradient id={idGrad} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          <filter id={idGlow} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Mask for the progress arc, offset slightly outward to avoid being hidden */}
          <clipPath id={idClip}>
            <path
              d={describeArc(cx, cy, radius + 1, START, displayAngle)}
              stroke="#fff"
              strokeWidth={18}
              fill="none"
            />
          </clipPath>
        </defs>

        {/* Outer faint arc */}
        <path
          d={describeArc(cx, cy, radius, START, END)}
          stroke="#2a2a2d"
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />

        {/* Colored progress arc (masked) */}
        <g clipPath={`url(#${idClip})`} filter={`url(#${idGlow})`}>
          <path
            d={describeArc(cx, cy, radius, START, END)}
            stroke={`url(#${idGrad})`}
            strokeWidth={16}
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* White tip: short radial line so it's ALWAYS visible */}
        {hydrated && (
          <line
            x1={tipX1}
            y1={tipY1}
            x2={tipX2}
            y2={tipY2}
            stroke="#ffffff"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.95}
          />
        )}

        {/* Ticks */}
        {ticks.map(({ mph, ang, major }, i) => {
          const inner = radius - (major ? 24 : 16);
          const outer = radius + (major ? 2 : 0);
          const rad = toRad(ang);
          const x1 = cx + inner * Math.cos(rad);
          const y1 = cy + inner * Math.sin(rad);
          const x2 = cx + outer * Math.cos(rad);
          const y2 = cy + outer * Math.sin(rad);
          const lit = hydrated && ang <= displayAngle;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={lit ? (mph > max * 0.75 ? "#ef4444" : "#f59e0b") : "#3a3a3f"}
              strokeWidth={major ? 3 : 2}
              opacity={lit ? 1 : 0.55}
              strokeLinecap="round"
            />
          );
        })}

        {/* Labels (every 20 mph) */}
        {ticks.filter((t) => t.major).map(({ mph, ang }, i) => {
          const r = radius - 40;
          const rad = toRad(ang);
          const tx = cx + r * Math.cos(rad);
          const ty = cy + r * Math.sin(rad);
          return (
            <text
              key={i}
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={box * 0.05}
              fill="#c9c9d1"
              opacity={0.9}
            >
              {mph}
            </text>
          );
        })}

        {/* Needle pivot */}
        <circle cx={cx} cy={cy} r={8} fill="#0b0b0c" />
        <circle cx={cx} cy={cy} r={5} fill="#ffffff" opacity={0.9} />

        {/* Needle (rect) */}
        {/* <motion.g
          style={{
            rotate: displayAngle,
            originX: cx,
            originY: cy,
          }}
        >
          <rect
            x={cx - 3}
            y={cy - radius + 10}
            width={6}
            height={radius - 20}
            rx={3}
            fill="#ffffff"
            opacity={0.95}
            filter={`url(#${idGlow})`}
          />
        </motion.g> */}
      </svg>

      {/* MPH readout */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: box * 0.24 }}>
        <div className="flex items-end gap-2">
          <motion.span
            aria-live="polite"
            className="font-semibold"
            style={{
              fontSize: box * 0.11,
              lineHeight: 1,
              color: "#fff",
              textShadow: "0 0 10px rgba(0,0,0,0.65), 0 1px 2px rgba(0,0,0,0.7)",
              fontVariantNumeric: "tabular-nums",
            }}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {display}
          </motion.span>
          <span className="text-white/70" style={{ fontSize: box * 0.04 }}>
            MPH
          </span>
        </div>
      </div>

      {/* Hint */}
      <div className="absolute inset-x-0 bottom-3 text-center text-xs text-white/40 select-none">
        {loadingState.framesLoaded ? "Drag to rev" : "Loading…"}
      </div>
    </div>
  );
}

