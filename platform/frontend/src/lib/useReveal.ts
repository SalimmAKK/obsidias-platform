"use client";
import { useEffect } from "react";

/**
 * Observes every `.m-reveal` and `.m-lines` element on the page and adds
 * `.m-in` once it scrolls into view, then stops watching it (fires once —
 * re-animating on every scroll-by is a tic, not a flourish).
 *
 * The corresponding CSS is gated behind an `.m-js` class set on <html> by an
 * inline script in layout.tsx, so if this hook never runs, nothing is left
 * hidden. See styles/motion.css.
 */
export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll(".m-reveal, .m-lines");
    if (!nodes.length) return;

    // Reduced-motion users get the final state immediately rather than a
    // scroll-triggered one — the CSS also neutralises the transition, this
    // just avoids leaving anything waiting on an observer it doesn't need.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((el) => el.classList.add("m-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("m-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    nodes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
