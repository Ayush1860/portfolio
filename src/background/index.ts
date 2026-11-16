import { ANIMALS, AnimalEngine, type Tuning } from '../vendor/ascii-animals';
import { ANIMAL, ANIMAL_TUNING } from './config';

let engine: AnimalEngine | null = null;
let grid: HTMLElement | null = null;

/**
 * The engine can paint its cell grid into the canvas, but the canvas gets blurred on
 * scroll, and a fine repeating grid under a changing blur turns into moiré and bands.
 * So the engine's own grid is switched off, and the same grid is drawn by CSS on
 * `.bg-grid`: a sharp layer above the canvas that fades out as the blur rises.
 */
const engineTuning = (): Partial<Tuning> => ({ ...ANIMAL_TUNING, grid: 0 });
const defaultGridStrength = () => ANIMAL_TUNING.grid ?? ANIMALS[ANIMAL].defaults.grid;
let gridStrength = defaultGridStrength();

/** Match the CSS grid to the engine's current cell size and the grid strength. */
export function syncGrid() {
  if (!engine || !grid) return;
  // The cell size lives on the engine's private renderer; read it rather than re-deriving it.
  const { cw, ch } = (engine as unknown as { renderer: { cw: number; ch: number } }).renderer;
  grid.style.setProperty('--cell-w', `${cw}px`);
  grid.style.setProperty('--cell-h', `${ch}px`);
  grid.style.setProperty('--grid-strength', String(gridStrength));
}

export function getGridStrength() {
  return gridStrength;
}

export function setGridStrength(value: number) {
  gridStrength = value;
  syncGrid();
}

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
    engine = new AnimalEngine(canvas, { animal: ANIMAL, theme: 'dark', tuning: engineTuning() });
  } catch {
    return null; // no Canvas 2D: the page still works on the plain background
  }
  // Dev only: poke the engine from the console, e.g. __engine.set('speed', 2).
  if (import.meta.env.DEV) (window as unknown as { __engine?: AnimalEngine }).__engine = engine;

  grid = document.getElementById('bg-grid');
  syncGrid();
  // Created after the engine's own observer, so the engine has resized before this reads it.
  new ResizeObserver(syncGrid).observe(canvas);

  // Let the first frame draw, then CSS fades the background in over 600 ms.
  requestAnimationFrame(() => {
    wrap.classList.add('is-ready');
    grid?.classList.add('is-ready');
  });
  return engine;
}

export function getEngine() {
  return engine;
}

/** Back to the values in config.ts; used by /lab's reset button. */
export function resetBackground() {
  if (!engine) return;
  engine.setAnimal(ANIMAL, engineTuning());
  setGridStrength(defaultGridStrength());
}
