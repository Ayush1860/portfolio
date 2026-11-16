import type { Variants } from 'motion/react';

/* JS mirrors of the motion tokens in tokens.css, for the Motion library. Keep them in sync. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]; // --ease-out
export const DUR = { fast: 0.16, base: 0.32, slow: 0.7 }; // --dur-fast / --dur-base / --dur-slow
export const HOVER_SPRING = { type: 'spring', stiffness: 300, damping: 24 } as const;
export const REDUCED_FADE = 0.2; // reduced motion: a short fade, no movement

/**
 * Scroll parallax: three depths in front of the background canvas. The canvas is
 * fixed, so it is the farthest layer; headings move a little slower than the page,
 * content a little faster, and the hero card fastest.
 */
export const PARALLAX = {
  hero: 0.22, // the hero card rises this much faster than the page as you scroll away
  heading: -28, // section headings: px of drift, slower than the page
  content: 28, // cards, panels and rows: px of drift, faster than the page
};

interface ItemOptions {
  blur?: boolean; // glass elements skip this: a filter would cut off their backdrop blur
  distance?: number;
}

/** One revealed element: rises, fades and sharpens into place. */
export function itemVariants(reduced: boolean, { blur = true, distance = 24 }: ItemOptions = {}): Variants {
  if (reduced) {
    return { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: REDUCED_FADE } } };
  }
  return {
    hidden: { opacity: 0, y: distance, ...(blur ? { filter: 'blur(6px)' } : {}) },
    shown: {
      opacity: 1,
      y: 0,
      ...(blur ? { filter: 'blur(0px)', transitionEnd: { filter: 'none' } } : {}),
      transition: { duration: DUR.slow, ease: EASE_OUT },
    },
  };
}

/** A parent that only orchestrates: it staggers its revealed children. */
export function groupVariants(reduced: boolean, stagger = 0.07, delay = 0): Variants {
  return {
    hidden: {},
    shown: { transition: reduced ? {} : { staggerChildren: stagger, delayChildren: delay } },
  };
}
