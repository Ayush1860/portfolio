import type Lenis from 'lenis';
import { BLUR_MAX, LOCK_AT, PX_PER_POINT, SCRIM_MAX } from './config';

/**
 * Scroll -> background blur.
 *
 * Blur rises from 0 at the top of the page to BLUR_MAX when the Projects section's
 * top edge is LOCK_AT of the way down the viewport, then stays clamped there.
 * Only CSS variables are written (--blur, --scrim, --blur-progress): no React state.
 *
 * The value follows the scroll position exactly. Lenis already eases the scroll
 * itself, so a wheel flick still glides; easing the blur a second time made it trail
 * behind, leaving the next section sitting on a sharp background and then blurring
 * late. With `lenis = null` (reduced motion) it follows native scroll the same way.
 */
export function startScrollBlur(lenis: Lenis | null, projects: HTMLElement): () => void {
  const root = document.documentElement.style;
  let lockY = 1;
  let last = -1;

  const follow = (scroll: number) => {
    const p = Math.min(Math.max(scroll / lockY, 0), 1);
    const eased = p * p * (3 - 2 * p); // smoothstep, clamped at the lock
    if (eased === last) return;
    last = eased;
    root.setProperty('--blur', `${(eased * BLUR_MAX * PX_PER_POINT).toFixed(2)}px`);
    root.setProperty('--scrim', (eased * SCRIM_MAX).toFixed(3));
    root.setProperty('--blur-progress', eased.toFixed(3));
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
    root.removeProperty('--blur');
    root.removeProperty('--scrim');
    root.removeProperty('--blur-progress');
  };
}
