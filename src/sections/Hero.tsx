import type { MouseEvent } from 'react';
import { ArrowDown } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react';
import { useParallaxEnabled } from '../components/Parallax';
import { site } from '../content/site';
import { DUR, EASE_OUT, PARALLAX, REDUCED_FADE, itemVariants } from '../lib/motion';
import { scrollToId } from '../lib/scroll';

const CANVAS_FADE = 0.6; // the background fades in first (background.css), then the card

export default function Hero() {
  const reduced = useReducedMotion() ?? false;
  const parallax = useParallaxEnabled();
  const { primary, secondary } = site.cta;

  // Parallax: the card is the nearest layer, so it rises a little faster than the page.
  const { scrollY } = useScroll();
  const lift = useTransform(scrollY, [0, 1], [0, -PARALLAX.hero], { clamp: false });

  // Load sequence: the card rises 24 px and fades in, then its lines follow 80 ms apart.
  const card: Variants = reduced
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: REDUCED_FADE } } }
    : {
        hidden: { opacity: 0, y: 24 },
        shown: {
          opacity: 1,
          y: 0,
          transition: {
            duration: DUR.slow,
            ease: EASE_OUT,
            delay: CANVAS_FADE,
            delayChildren: CANVAS_FADE + 0.12,
            staggerChildren: 0.08,
          },
        },
      };
  const line = itemVariants(reduced, { distance: 16 });

  const go = (id: string) => (event: MouseEvent) => {
    event.preventDefault();
    scrollToId(id);
  };

  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <motion.div className="hero-anchor" style={parallax ? { y: lift } : undefined}>
        <motion.div className="hero-card glass" variants={card} initial="hidden" animate="shown">
          <motion.p className="t-label text-text-2" variants={line}>
            {site.label}
          </motion.p>
          <motion.h1 id="hero-title" className="hero-name" variants={line}>
            {site.name}
          </motion.h1>
          <motion.p className="hero-line text-text-2" variants={line}>
            {site.heroLine}
          </motion.p>
          <motion.div className="hero-actions" variants={line}>
            <a className="btn btn-outline" href={`#${primary.target}`} onClick={go(primary.target)}>
              {primary.label}
            </a>
            <a className="btn btn-quiet" href={`#${secondary.target}`} onClick={go(secondary.target)}>
              {secondary.label}
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      <p className="scroll-cue t-label text-text-3" aria-hidden="true">
        {site.scrollCue}
        <ArrowDown className="scroll-cue-icon" />
      </p>
    </section>
  );
}
