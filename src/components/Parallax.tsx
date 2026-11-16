import { useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

/**
 * Parallax is on for mouse and trackpad only. Touch scrolling runs off the main
 * thread, so scroll-linked transforms judder there; reduced motion turns it off too.
 */
export function useParallaxEnabled() {
  const reduced = useReducedMotion() ?? false;
  const [finePointer] = useState(() => window.matchMedia('(pointer: fine)').matches);
  return finePointer && !reduced;
}

interface Props {
  /**
   * Pixels of drift either side of centre as the element crosses the viewport.
   * Positive moves faster than the page (foreground); negative moves slower (background).
   */
  shift: number;
  className?: string;
  children: ReactNode;
}

/**
 * Moves its children at a slightly different speed from the page while they are on
 * screen. The offset is zero when the element is centred in the viewport, so layout
 * is unchanged where it matters. Driven by motion values: no React re-renders.
 */
export default function Parallax({ shift, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useParallaxEnabled();
  // 0 when the element's top reaches the bottom of the viewport, 1 when its bottom leaves the top.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [shift, -shift]);

  return (
    <motion.div ref={ref} className={className} style={enabled ? { y } : undefined}>
      {children}
    </motion.div>
  );
}
