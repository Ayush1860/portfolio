import type Lenis from 'lenis';
import { BLUR_MAX, LOCK_AT, PX_PER_POINT, SCRIM_MAX } from './config';
import { setBackgroundFrameRate } from './index';

/** Behind this much blur the animation can drop to a lower frame rate unnoticed. */
const SLOW_FROM = 0.5;
const SLOW_FPS = 30;

/**
 * Write the blur state (0 sharp -> 1 fully blurred) to the background layers.
 *
 * The CSS variables go on the three background elements only, never on :root:
 * custom properties inherit, so setting one on :root restyles the whole page on
 * every scroll frame.
 */
let lastEased = -1;
export function applyBlur(eased: number) {
  if (eased === lastEased) return;
  lastEased = eased;
  const blur = `${(eased * BLUR_MAX * PX_PER_POINT).toFixed(2)}px`;
  const scrim = (eased * SCRIM_MAX).toFixed(3);
  const progress = eased.toFixed(3);
  for (const id of ['bg', 'bg-scrim', 'bg-grid']) {
    const style = document.getElementById(id)?.style;
    if (!style) continue;
    style.setProperty('--blur', blur);
    style.setProperty('--scrim', scrim);
    style.setProperty('--blur-progress', progress);
  }
  setBackgroundFrameRate(eased >= SLOW_FROM ? SLOW_FPS : null);
}

/**
 * Scroll -> background blur.
 *
 * Blur rises from 0 at the top of the page to BLUR_MAX when the Projects section's
 * top edge is LOCK_AT of the way down the viewport, then stays clamped there.
 * No React state is involved.
 *
 * The value follows the scroll position exactly. Lenis already eases the scroll
 * itself, so a wheel flick still glides; easing the blur a second time made it trail
 * behind. With `lenis = null` (reduced motion) it follows native scroll the same way.
 */
export function startScrollBlur(lenis: Lenis | null, projects: HTMLElement): () => void {
  let lockY = 1;

  const follow = (scroll: number) => {
    const p = Math.min(Math.max(scroll / lockY, 0), 1);
    applyBlur(p * p * (3 - 2 * p)); // smoothstep, clamped at the lock
  };

  const measure = () => {
    const top = projects.getBoundingClientRect().top + window.scrollY;
    lockY = Math.max(1, top - window.innerHeight * LOCK_AT);
    follow(window.scrollY);
  };

  const onLenisScroll = ({ scroll }: { scroll: number }) => follow(scroll);
  const onNativeScroll = () => follow(window.scrollY);

  measure();
  window.addEventListener('resize', measure);
  const observer = new ResizeObserver(measure); // fonts or content changing the layout
  observer.observe(document.body);

  if (lenis) lenis.on('scroll', onLenisScroll);
  else window.addEventListener('scroll', onNativeScroll, { passive: true });

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', measure);
    window.removeEventListener('scroll', onNativeScroll);
    lenis?.off('scroll', onLenisScroll);
    applyBlur(0);
  };
}
