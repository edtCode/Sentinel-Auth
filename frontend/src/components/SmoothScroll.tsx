import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    const stopForGesture = () => lenis.stop();
    const resumeAfterGesture = () => lenis.start();

    window.addEventListener("gesture-scroll:active", stopForGesture);
    window.addEventListener("gesture-scroll:inactive", resumeAfterGesture);

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("gesture-scroll:active", stopForGesture);
      window.removeEventListener("gesture-scroll:inactive", resumeAfterGesture);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
