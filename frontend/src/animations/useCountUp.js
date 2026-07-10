import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./useReducedMotion";

export const useCountUp = (endValue, duration = 1.6, delay = 0) => {
  const ref = useRef(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isReduced) {
      el.innerText = endValue;
      return;
    }

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: endValue,
        duration: duration,
        delay: delay,
        ease: "power3.out",
        onUpdate: () => {
          if (el) el.innerText = Math.round(obj.val);
        }
      });
    }, el);

    return () => ctx.revert();
  }, [endValue, duration, delay, isReduced]);

  return ref;
};
