"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

/** Content stays visible without JS or observer support. Only offscreen content is hidden. */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || motion.matches || !("IntersectionObserver" in window)) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.dataset.reveal = "pending";
    const show = () => { delete element.dataset.reveal; observer.disconnect(); };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) show();
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    observer.observe(element);
    // Keyboard users must never land in invisible content.
    element.addEventListener("focusin", show);
    motion.addEventListener("change", show);
    return () => { observer.disconnect(); element.removeEventListener("focusin", show); motion.removeEventListener("change", show); delete element.dataset.reveal; };
  }, []);
  return <div ref={ref} className={`home-reveal ${className}`} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}
