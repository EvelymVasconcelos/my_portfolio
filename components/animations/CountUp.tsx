"use client";

import { useState, useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  target: number;
  suffix?: string;
}

export const CountUp = ({ target, suffix = "" }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    // Com movimento reduzido, a "animação" dura zero: o primeiro quadro já mostra o número final.
    const duration = reduceMotion ? 0 : 3000;
    const startTime = performance.now();
    const frame = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(frame);
    };
    let raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, reduceMotion]);

  return <span ref={ref}>{count}{suffix}</span>;
};
