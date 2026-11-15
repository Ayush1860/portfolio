import { ButterflyField } from './ButterflyField';

let field: ButterflyField | null = null;

/**
 * Attach the butterfly field to the static canvas in index.html.
 * Starts after first paint so it never competes with the initial render.
 */
export function mountBackground(): ButterflyField | null {
  if (field) return field;
  const wrap = document.getElementById('bg');
  const canvas = document.getElementById('butterflies');
  if (!wrap || !(canvas instanceof HTMLCanvasElement)) return null;

  try {
    field = new ButterflyField(canvas, wrap);
  } catch {
    return null; // no Canvas 2D: the page still works on the plain background
  }
  // Dev only: poke the field from the console, e.g. __field.setConfig({ speed: 0 }).
  if (import.meta.env.DEV) (window as unknown as { __field?: ButterflyField }).__field = field;

  const begin = () => {
    field?.start();
    wrap.classList.add('is-ready'); // CSS fades the canvas in over 600 ms
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(begin, { timeout: 500 });
  else setTimeout(begin, 50);

  return field;
}

export function getField() {
  return field;
}
