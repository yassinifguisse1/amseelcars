"use client";

import { useId } from "react";

/** Compact flag marks for the header locale switcher (SVG for consistent rendering). */

export function FlagFr({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 3 2"
      width={22}
      height={15}
      aria-hidden
    >
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#CE1126" />
    </svg>
  );
}

export function FlagGb({ className }: { className?: string }) {
  const clipId = `gb-${useId().replace(/:/g, "")}`;
  return (
    <svg
      className={className}
      viewBox="0 0 60 30"
      width={22}
      height={11}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="60" height="30" rx="1.5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path fill="#012169" d="M0 0h60v30H0z" />
        <path
          stroke="#fff"
          strokeWidth="6"
          d="M0 0l60 30M60 0L0 30"
        />
        <path
          stroke="#C8102E"
          strokeWidth="4"
          d="M0 0l60 30M60 0L0 30"
        />
        <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60" />
        <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60" />
      </g>
    </svg>
  );
}

export function FlagEs({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 3 2"
      width={22}
      height={15}
      aria-hidden
    >
      <rect width="3" height="2" fill="#AA151B" />
      <rect y="0.5" width="3" height="1" fill="#F1BF00" />
    </svg>
  );
}

export function FlagDe({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 3 2"
      width={22}
      height={15}
      aria-hidden
    >
      <rect width="3" height="0.6667" fill="#000" />
      <rect y="0.6667" width="3" height="0.6667" fill="#DD0000" />
      <rect y="1.3334" width="3" height="0.6666" fill="#FFCE00" />
    </svg>
  );
}

export function FlagPl({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 3 2"
      width={22}
      height={15}
      aria-hidden
    >
      <rect width="3" height="1" fill="#fff" />
      <rect y="1" width="3" height="1" fill="#DC143C" />
    </svg>
  );
}
