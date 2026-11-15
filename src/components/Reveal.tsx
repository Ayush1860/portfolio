import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { groupVariants, itemVariants } from '../lib/motion';

type Tag = 'div' | 'ul' | 'li' | 'header' | 'p' | 'h2' | 'h3';

interface GroupProps {
  as?: Tag;
  className?: string;
  stagger?: number; // seconds between children
  delay?: number;
  children: ReactNode;
}

/**
 * Reveals its RevealItem (and GlassCard) descendants once, when 15% of it is in view.
 * The group itself never fades, so glass cards inside keep their backdrop blur.
 */
export function RevealGroup({ as = 'div', className, stagger, delay, children }: GroupProps) {
  const reduced = useReducedMotion() ?? false;
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      className={className}
      variants={groupVariants(reduced, stagger, delay)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </Component>
  );
}

interface ItemProps {
  as?: Tag;
  className?: string;
  id?: string;
  blur?: boolean;
  distance?: number;
  children: ReactNode;
}

/** A child of RevealGroup: opacity 0 -> 1, 24 px rise, 6 px blur -> sharp. */
export function RevealItem({ as = 'div', className, id, blur, distance, children }: ItemProps) {
  const reduced = useReducedMotion() ?? false;
  const Component = motion[as] as typeof motion.div;
  return (
    <Component id={id} className={className} variants={itemVariants(reduced, { blur, distance })}>
      {children}
    </Component>
  );
}
