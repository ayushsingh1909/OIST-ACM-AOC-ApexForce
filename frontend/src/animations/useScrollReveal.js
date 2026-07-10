import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export const useScrollReveal = (options = {}) => {
  const elementRef = useRef(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    if (isReduced) return;
    const el = elementRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: options.y ?? 30,
        duration: options.duration ?? 0.8,
        ease: options.ease ?? "power2.out",
        scrollTrigger: {
          trigger: el,
          start: options.start ?? "top 85%",
          toggleActions: options.toggleActions ?? "play none none none",
          ...options.scrollTrigger
        }
      });
    }, el);

    return () => ctx.revert();
  }, [isReduced, options]);

  return elementRef;
};
