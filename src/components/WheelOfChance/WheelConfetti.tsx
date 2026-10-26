"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CONFETTI_COLORS = ["#EC1C25", "#c9a227", "#ffffff", "#e8d5a3", "#25D366", "#ff6b6b", "#60a5fa"];
const BALLOON_COLORS = ["#EC1C25", "#c9a227", "#3b82f6", "#ec4899", "#22c55e", "#f97316"];

type ConfettiPiece = {
  id: number;
  x: number;
  drift: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
  shape: "rect" | "circle";
};

type Balloon = {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  sway: number;
};

type Star = {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
  color: string;
};

function buildBurst(seed: number) {
  // Deterministic-ish mix from seed so remounts still feel fresh
  const rand = () => {
    seed = (seed * 16807 + 7) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const confetti: ConfettiPiece[] = Array.from({ length: 72 }, (_, id) => ({
    id,
    x: 2 + rand() * 96,
    drift: (rand() - 0.5) * 140,
    delay: rand() * 0.45,
    duration: 2.2 + rand() * 2.2,
    rotate: (rand() - 0.5) * 900,
    color: CONFETTI_COLORS[id % CONFETTI_COLORS.length]!,
    size: 7 + rand() * 10,
    shape: rand() > 0.5 ? "rect" : "circle",
  }));

  const balloons: Balloon[] = Array.from({ length: 14 }, (_, id) => ({
    id,
    x: 6 + rand() * 88,
    delay: 0.1 + rand() * 0.8,
    duration: 3.2 + rand() * 2.4,
    color: BALLOON_COLORS[id % BALLOON_COLORS.length]!,
    size: 28 + rand() * 22,
    sway: (rand() - 0.5) * 60,
  }));

  const stars: Star[] = Array.from({ length: 28 }, (_, id) => ({
    id,
    x: 4 + rand() * 92,
    y: 6 + rand() * 70,
    delay: rand() * 0.6,
    size: 10 + rand() * 18,
    color: rand() > 0.5 ? "#c9a227" : "#fff7d6",
  }));

  return { confetti, balloons, stars };
}

/** Full-viewport win party: confetti, balloons, glowing stars. */
export function WheelConfetti({ active }: { active: boolean }) {
  const burst = useMemo(() => buildBurst(Date.now() % 100000), [active]);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="wheel-party"
          className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-hidden
        >
          {/* Soft glow wash */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0.25, 0] }}
            transition={{ duration: 2.8, times: [0, 0.15, 0.55, 1] }}
            style={{
              background:
                "radial-gradient(circle at 50% 35%, rgba(201,162,39,0.45) 0%, rgba(236,28,37,0.22) 35%, transparent 70%)",
            }}
          />

          {/* Glowing stars popping across the screen */}
          {burst.stars.map((s) => (
            <motion.span
              key={`star-${s.id}`}
              className="absolute"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                color: s.color,
                filter: `drop-shadow(0 0 ${s.size * 0.45}px ${s.color})`,
              }}
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{
                scale: [0, 1.35, 1, 1.15, 0],
                opacity: [0, 1, 1, 0.85, 0],
                rotate: [-20, 0, 15, 0],
              }}
              transition={{
                duration: 2.4,
                delay: s.delay,
                ease: "easeOut",
              }}
            >
              <svg viewBox="0 0 24 24" className="h-full w-full fill-current" aria-hidden>
                <path d="M12 2.4l2.6 6.4 6.9.6-5.2 4.6 1.6 6.7L12 16.9 6.1 20.3l1.6-6.7L2.5 9.4l6.9-.6L12 2.4z" />
              </svg>
            </motion.span>
          ))}

          {/* Balloons rising */}
          {burst.balloons.map((b) => (
            <motion.div
              key={`balloon-${b.id}`}
              className="absolute bottom-[-12%]"
              style={{ left: `${b.x}%` }}
              initial={{ y: 40, opacity: 0 }}
              animate={{
                y: [40, "-125vh"],
                x: [0, b.sway, -b.sway * 0.6, b.sway * 0.4],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: b.duration,
                delay: b.delay,
                ease: "easeOut",
              }}
            >
              <span
                className="relative block rounded-[50%_50%_48%_48%] shadow-lg"
                style={{
                  width: b.size,
                  height: b.size * 1.2,
                  background: `radial-gradient(circle at 35% 28%, #fff8, transparent 42%), ${b.color}`,
                }}
              >
                <span
                  className="absolute left-1/2 top-full h-10 w-px -translate-x-1/2 origin-top"
                  style={{ background: "rgba(255,255,255,0.55)" }}
                />
              </span>
            </motion.div>
          ))}

          {/* Confetti rain */}
          {burst.confetti.map((p) => (
            <motion.span
              key={`c-${p.id}`}
              className="absolute top-[-4%]"
              style={{
                left: `${p.x}%`,
                width: p.size,
                height: p.shape === "rect" ? p.size * 0.4 : p.size,
                borderRadius: p.shape === "circle" ? 999 : 2,
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}88`,
              }}
              initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{
                y: ["0vh", "110vh"],
                x: [0, p.drift],
                opacity: [1, 1, 0.2],
                rotate: p.rotate,
                scale: [1, 0.8],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.22, 0.7, 0.3, 1],
              }}
            />
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
