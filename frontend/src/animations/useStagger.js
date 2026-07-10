import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./useReducedMotion";

export const useStagger = (childSelector = "> *", options = {}) => {
  const ref = useRef(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    if (isReduced) return;
    const parent = ref.current;
    if (!parent) return;

    const children = parent.querySelectorAll(childSelector);
    if (children.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(children, {
        opacity: 0,
        y: options.y ?? 25,
        duration: options.duration ?? 0.8,
        stagger: options.stagger ?? 0.1,
        ease: options.ease ?? "power3.out",
        delay: options.delay ?? 0
      });
    }, parent);

    return () => ctx.revert();
  }, [childSelector, isReduced, options]);

  return ref;
};
