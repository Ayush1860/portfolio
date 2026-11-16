/**
 * Liquid glass: edge refraction for a glass element.
 *
 * The body of the glass stays clear; in a band along the rim (the bezel) whatever is
 * behind it is pulled toward the centre and stretched, the way a thick rounded pane
 * of glass bends light at its edges. Red, green and blue bend by slightly different
 * amounts, which gives the thin colour fringe on the rim.
 *
 * How: an SVG filter used inside `backdrop-filter`. A displacement map is drawn for
 * the element's exact size and corner radius; each pixel's red and green values say
 * how far to shift the backdrop in x and y. Only Chromium runs SVG filters inside
 * backdrop-filter, so other browsers keep the plain frosted glass from the CSS.
 */

export interface LiquidGlassOptions {
  /** Width of the refracting band along the rim, px. */
  bezel?: number;
  /** How far the backdrop is pulled inward at the very edge, px. */
  strength?: number;
  /** Colour fringing: how much less green and blue bend than red (0 = none). */
  aberration?: number;
  /** 'all' follows the element's rounded outline; 'bottom' bends along the bottom edge only. */
  edges?: 'all' | 'bottom';
}

const DEFAULTS: Required<LiquidGlassOptions> = { bezel: 28, strength: 40, aberration: 0.06, edges: 'all' };
const SVG_NS = 'http://www.w3.org/2000/svg';
const MAP_PIXEL_BUDGET = 160_000; // larger panes get a lower-resolution map; it is smooth, so it scales cleanly

/** Chromium (Chrome, Edge, Opera, Brave, Arc) is the only engine that applies url() filters to a backdrop. */
export const liquidGlassSupported =
  typeof navigator !== 'undefined' && /\bChrom(e|ium)\//.test(navigator.userAgent);

let defs: SVGDefsElement | null = null;
let nextId = 1;

function sharedDefs() {
  if (defs) return defs;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  defs = document.createElementNS(SVG_NS, 'defs');
  svg.appendChild(defs);
  document.body.appendChild(svg);
  return defs;
}

function node(name: string, attrs: Record<string, string | number>) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
  return el;
}

/**
 * Draw the displacement map. Red = x shift, green = y shift, 128 = none.
 * `k` is the map's resolution relative to the element (1 = one map pixel per CSS px).
 */
function drawMap(width: number, height: number, radius: number, o: Required<LiquidGlassOptions>, k: number) {
  const w = Math.max(1, Math.round(width * k));
  const h = Math.max(1, Math.round(height * k));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const image = ctx.createImageData(w, h);
  const data = image.data;

  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.min(radius, halfW, halfH);
  const bezel = Math.max(1, Math.min(o.bezel, o.edges === 'all' ? Math.min(halfW, halfH) : height));

  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      // Position in CSS px, relative to the element's centre.
      const px = (i + 0.5) / k - halfW;
      const py = (j + 0.5) / k - halfH;

      let depth: number; // distance inside the edge
      let nx = 0; // unit vector pointing into the glass
      let ny = 0;

      if (o.edges === 'bottom') {
        depth = halfH - py;
        ny = -1;
      } else {
        // Signed distance to a rounded rectangle, and its gradient.
        const qx = Math.abs(px) - (halfW - r);
        const qy = Math.abs(py) - (halfH - r);
        if (qx > 0 && qy > 0) {
          const len = Math.hypot(qx, qy) || 1;
          depth = r - len;
          nx = (-qx / len) * Math.sign(px);
          ny = (-qy / len) * Math.sign(py);
        } else if (qx > qy) {
          depth = -(qx - r);
          nx = -Math.sign(px);
        } else {
          depth = -(qy - r);
          ny = -Math.sign(py);
        }
      }

      // Strongest right at the rim, easing to nothing at the inner edge of the bezel.
      const t = Math.min(1, Math.max(0, depth / bezel));
      const pull = Math.pow(1 - t, 2.4);
      const at = (j * w + i) * 4;
      data[at] = Math.round(128 + 127 * nx * pull);
      data[at + 1] = Math.round(128 + 127 * ny * pull);
      data[at + 2] = 128;
      data[at + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Give `el` refracting edges. Sets `--liquid-filter` on the element, which the
 * `.glass` CSS puts in front of its backdrop blur. Returns a cleanup function.
 */
export function attachLiquidGlass(el: HTMLElement, options: LiquidGlassOptions = {}): () => void {
  if (!liquidGlassSupported) return () => {};
  const o = { ...DEFAULTS, ...options };
  const id = `liquid-glass-${nextId++}`;
  const filter = node('filter', { id, filterUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' });
  sharedDefs().appendChild(filter);

  let lastKey = '';
  let frame = 0;

  const build = () => {
    frame = 0;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    if (width < 2 || height < 2) return;
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    const key = `${width}x${height}r${radius}`;
    if (key === lastKey) return;
    lastKey = key;

    const k = Math.min(1, Math.sqrt(MAP_PIXEL_BUDGET / (width * height)));
    const href = drawMap(width, height, radius, o, k);
    if (!href) return;

    // The map's 0..255 spans -0.5..0.5 of `scale`, so scale is twice the largest shift.
    const scale = o.strength * 2;
    const box = { x: 0, y: 0, width, height };
    const channel = (name: string, matrix: string, amount: number) => [
      node('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'map',
        scale: amount.toFixed(2),
        xChannelSelector: 'R',
        yChannelSelector: 'G',
        result: `${name}-shifted`,
      }),
      node('feColorMatrix', { in: `${name}-shifted`, type: 'matrix', values: matrix, result: name }),
    ];

    filter.replaceChildren(
      node('feImage', { ...box, href, preserveAspectRatio: 'none', result: 'map' }),
      // One pass per colour channel, each bent a little less than the last.
      ...channel('red', '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', scale),
      ...channel('green', '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', scale * (1 - o.aberration)),
      ...channel('blue', '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', scale * (1 - 2 * o.aberration)),
      node('feBlend', { in: 'red', in2: 'green', mode: 'screen', result: 'red-green' }),
      node('feBlend', { in: 'red-green', in2: 'blue', mode: 'screen' }),
    );
    for (const [name, value] of Object.entries(box)) filter.setAttribute(name, String(value));
    el.style.setProperty('--liquid-filter', `url(#${id})`);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(build);
  };
  const observer = new ResizeObserver(schedule);
  observer.observe(el);
  build();

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    filter.remove();
    el.style.removeProperty('--liquid-filter');
  };
}
