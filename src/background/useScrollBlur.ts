import type Lenis from 'lenis';
import { BLUR_MAX, LOCK_AT, PX_PER_POINT, SCRIM_MAX } from './config';

const CHASE = 0.12; // share of the remaining distance covered per 60 Hz frame

/**
 * Scroll -> background blur.
 *
 * Blur rises from 0 at the top of the page to BLUR_MAX when the Projects section's
 * top edge is LOCK_AT of the way down the viewport, then stays clamped there.
 * Only CSS variables are written (--blur, --scrim, --blur-progress): no React state.
 *
 * Pass `lenis = null` under reduced motion: the value then follows native scroll
 * directly, with no smoothing.
 */
export function startScrollBlur(lenis: Lenis | null, projects: HTMLElement): () => void {
  const root = document.documentElement.style;
  const smoothed = lenis !== null;
  let lockY = 1;
  let target = 0;
  let current = 0;
  let last = -1;
  let raf = 0;
  let time = 0;

  const write = () => {
    if (current === last) return;
    root.setProperty('--blur', `${(current * PX_PER_POINT).toFixed(2)}px`);
    root.setProperty('--scrim', ((current / BLUR_MAX) * SCRIM_MAX).toFixed(3));
    root.setProperty('--blur-progress', (current / BLUR_MAX).toFixed(3));
    last = current;
  };

  const tick = (now: number) => {
    // 12% per frame at 60 Hz, scaled by real elapsed time so 120 Hz glides the same.
    const frames = Math.min((now - time) / (1000 / 60), 4);
    time = now;
    current += (target - current) * (1 - Math.pow(1 - CHASE, frames));
    if (Math.abs(target - current) < 0.01) current = target;
    write();
    raf = current === target ? 0 : requestAnimationFrame(tick);
  };

  const follow = (scroll: number, jump = false) => {
    const p = Math.min(Math.max(scroll / lockY, 0), 1);
    target = p * p * (3 - 2 * p) * BLUR_MAX; // smoothstep, clamped at the lock
    if (jump || !smoothed) {
      current = target;
      write();
    } else if (!raf && current !== target) {
      time = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const measure = () => {
    const top = projects.getBoundingClientRect().top + window.scrollY;
    lockY = Math.max(1, top - window.innerHeight * LOCK_AT);
    follow(window.scrollY, true);
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
    cancelAnimationFrame(raf);
    observer.disconnect();
    window.removeEventListener('resize', measure);
    window.removeEventListener('scroll', onNativeScroll);
    lenis?.off('scroll', onLenisScroll);
    root.removeProperty('--blur');
    root.removeProperty('--scrim');
    root.removeProperty('--blur-progress');
  };
}
