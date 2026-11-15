import type { PointerEvent, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { HOVER_SPRING, itemVariants } from '../lib/motion';
import NewTabHint from './NewTabHint';

interface Props {
  href?: string | null; // when set, the whole card is one external link
  className?: string;
  children: ReactNode;
}

/** Point the card's glow at the cursor. CSS variables only: no React state. */
function trackPointer(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const box = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${event.clientX - box.left}px`);
  el.style.setProperty('--my', `${event.clientY - box.top}px`);
}

/**
 * Frosted-glass card. With an href the entire card is a single new-tab link.
 * Inside a RevealGroup it rises into place; on hover it lifts 4 px on a spring
 * while the border and cursor glow fade in through CSS.
 */
export default function GlassCard({ href, className = '', children }: Props) {
  const reduced = useReducedMotion() ?? false;
  const shared = {
    className: `glass card ${className}`,
    variants: itemVariants(reduced, { blur: false }),
    whileHover: reduced ? undefined : { y: -4 },
    transition: HOVER_SPRING,
    onPointerMove: trackPointer,
  };

  if (href) {
    return (
      <motion.a {...shared} className={`${shared.className} card-link`} href={href} target="_blank" rel="noopener">
        {children}
        <NewTabHint />
      </motion.a>
    );
  }
  return <motion.div {...shared}>{children}</motion.div>;
}
