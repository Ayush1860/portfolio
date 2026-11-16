import type Lenis from 'lenis';

/** The page's Lenis instance, or null when smooth scroll is off (reduced motion). */
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Scroll to a section by id: Lenis when it is running, a native jump otherwise. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  // Sections carry scroll-margin-top: 80px (clears the nav). Lenis and scrollIntoView both
  // honour it, so no extra offset here: adding one doubled the gap to 160px.
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.2 });
  } else {
    el.scrollIntoView({ block: 'start' });
  }
}
