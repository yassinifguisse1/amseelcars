import "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- matches React's generic VideoHTMLAttributes<T>
  interface VideoHTMLAttributes<T> {
    /** Prioritize loading the poster / media (Chromium; improves LCP when used with poster). */
    fetchPriority?: "high" | "low" | "auto";
  }
}

export {};
