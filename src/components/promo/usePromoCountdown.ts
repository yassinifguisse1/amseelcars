"use client";

import { useEffect, useState } from "react";
import {
  getPromoCountdown,
  isBlackFridayPromoLive,
  type PromoCountdown,
} from "@/lib/blackFridayPromo";

export function usePromoCountdown(isLive = isBlackFridayPromoLive) {
  const [live, setLive] = useState(false);
  const [countdown, setCountdown] = useState<PromoCountdown>(() =>
    getPromoCountdown(),
  );

  useEffect(() => {
    const tick = () => {
      setLive(isLive());
      setCountdown(getPromoCountdown());
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isLive]);

  return { live, countdown };
}
