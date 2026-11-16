import { AnimalEngine } from '../vendor/ascii-animals';
import { ANIMAL, ANIMAL_TUNING } from './config';

let engine: AnimalEngine | null = null;

/**
 * Start the background animation on the static canvas in index.html.
 * It lives outside React: nothing here re-renders, and scroll never touches its loop.
 * The engine handles resizing, prefers-reduced-motion (one still frame) and pausing itself.
 */
export function mountBackground(): AnimalEngine | null {
  if (engine) return engine;
  const wrap = document.getElementById('bg');
  const canvas = document.getElementById('animals');
  if (!wrap || !(canvas instanceof HTMLCanvasElement)) return null;

  try {
    engine = new AnimalEngine(canvas, { animal: ANIMAL, theme: 'dark', tuning: ANIMAL_TUNING });
  } catch {
    return null; // no Canvas 2D: the page still works on the plain background
  }
  // Dev only: poke the engine from the console, e.g. __engine.set('speed', 2).
  if (import.meta.env.DEV) (window as unknown as { __engine?: AnimalEngine }).__engine = engine;

  // Let the first frame draw, then CSS fades the canvas in over 600 ms.
  requestAnimationFrame(() => wrap.classList.add('is-ready'));
  return engine;
}

export function getEngine() {
  return engine;
}
