import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./useReducedMotion";

export const useCardHover = (options = {}) => {
  const ref = useRef(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    if (isReduced) return;
    const el = ref.current;
    if (!el) return;

    const handleMouseEnter = () => {
      gsap.to(el, {
        y: options.y ?? -6,
        scale: options.scale ?? 1.012,
        boxShadow: options.shadow ?? "0 20px 40px rgba(17, 17, 17, 0.04)",
        borderColor: options.borderColor ?? "#111111",
        duration: 0.35,
        ease: "power2.out"
      });
      const arrow = el.querySelector(".hover-arrow");
      if (arrow) {
        gsap.to(arrow, { x: 5, duration: 0.25, ease: "power2.out" });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        y: 0,
        scale: 1,
        boxShadow: options.initialShadow ?? "0 4px 20px rgba(17, 17, 17, 0.015)",
        borderColor: options.initialBorderColor ?? "rgba(17, 17, 17, 0.06)",
        duration: 0.35,
        ease: "power2.out"
      });
      const arrow = el.querySelector(".hover-arrow");
      if (arrow) {
        gsap.to(arrow, { x: 0, duration: 0.25, ease: "power2.out" });
      }
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isReduced, options]);

  return ref;
};
