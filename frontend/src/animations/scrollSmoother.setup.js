import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const setupScrollSmoother = () => {
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true
  });
};
