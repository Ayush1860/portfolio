import type { FieldConfig, Palette, RGB, Species } from './config';

/**
 * Procedural butterfly sprites.
 *
 * A butterfly is described in "wing space" (u = sideways, v = forwards, roughly
 * -1..1) by two petal-shaped lobes per side plus a body and antennae. That shape
 * is sampled onto a square grid of cells, already turned to face the flight
 * direction, once per flap frame. Each frame is then painted into small offscreen
 * canvases at a few depth sizes, so drawing a butterfly at runtime is one drawImage.
 */

export const FRAME_COUNT = 6; // 0 = wings fully open, 5 = folded
export const VARIANT_COUNT = 3; // shimmer variants per frame

const LEVEL_SCALES = [1, 0.66, 0.46, 0.3]; // depth sizes, nearest first
const EXTENT = 1.3; // half-width of the sampled square, in wing-space units
const ROOT_V = 0.02; // where the wings attach along the body
const SUBSAMPLES = 3;
const MIN_COVERAGE = 3; // of SUBSAMPLES², to fill a cell

export interface SpriteLevel {
  pitch: number; // cell pitch in CSS px
  size: number; // sprite width and height in CSS px
  frames: HTMLCanvasElement[][]; // [frame][variant]
}

export interface SpriteSet {
  cells: number; // cells per side
  levels: SpriteLevel[];
  filled: Int16Array[]; // per frame: (col, row) pairs of filled cells
}

interface Lobe {
  centre: number; // direction of the lobe, radians from sideways toward forwards
  half: number; // angular half-width
  length: number;
  power: number; // < 1 gives a fuller, rounder petal
}

const FOREWING: Lobe = { centre: rad(38), half: rad(52), length: 1.2, power: 0.62 };
const HINDWING: Lobe = { centre: rad(-52), half: rad(44), length: 0.72, power: 0.9 };

function rad(deg: number) {
  return (deg * Math.PI) / 180;
}

function lobeRadius(lobe: Lobe, theta: number) {
  const d = (theta - lobe.centre) / lobe.half;
  if (d <= -1 || d >= 1) return 0;
  return lobe.length * Math.pow(Math.cos((d * Math.PI) / 2), lobe.power);
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

/** Butterfly: brightness 0..1 at a point in wing space, or -1 if the point is empty. */
function butterflyTone(u: number, v: number, open: number): number {
  const side = Math.abs(u);

  // Body: a narrow capsule, slightly brighter at the head.
  if (v > -0.5 && v < 0.44) {
    const taper = v < 0 ? 1 - 0.45 * (v / -0.5) : 1;
    if (side < 0.08 * taper) return 0.78 + 0.18 * ((v + 0.5) / 0.94);
  }

  // Antennae.
  if (v > 0.4 && v < 0.82 && distToSegment(side, v, 0.03, 0.43, 0.2, 0.78) < 0.042) return 0.5;

  // Wings: flapping squeezes them toward the body.
  const x = side / open;
  const y = v - ROOT_V;
  const r = Math.hypot(x, y);
  const theta = Math.atan2(y, x);
  const edge = Math.max(lobeRadius(FOREWING, theta), lobeRadius(HINDWING, theta));
  if (edge <= 0 || r > edge) return -1;

  const q = r / edge; // 0 at the body, 1 at the wing edge
  let tone = 0.26 + 0.74 * Math.exp(-(((q - 0.58) / 0.34) ** 2)); // bright band mid-wing
  tone *= 0.88 + 0.12 * Math.cos(theta * 10); // veins
  if (q > 0.86) tone *= 0.64; // darker rim
  return Math.min(1, Math.max(0, tone));
}

/* Crane, seen from above in flight: neck stretched forwards, legs trailing, long wings. */
const CRANE_SPAN = 0.9; // where the solid wing ends and the finger feathers begin
const CRANE_FINGERS = [-1.5, -0.5, 0.5, 1.5]; // primaries, splayed fore and aft at the tip
const CRANE_FINGER_LENGTH = 0.3;

function craneTone(u: number, v: number, open: number): number {
  const side = Math.abs(u);

  // Beak, head and the long neck.
  if (v > 0.8 && v < 0.98 && side < 0.012 + 0.03 * (1 - (v - 0.8) / 0.18)) return 0.62;
  if (Math.hypot(side, (v - 0.76) * 0.8) < 0.082) return 1;
  if (v > 0.2 && v <= 0.76 && side < 0.036) return 0.82;

  // Body, tail fan, then the legs held straight out behind.
  if ((side / 0.105) ** 2 + (v / 0.28) ** 2 < 1) return 0.9;
  if (v < -0.2 && v > -0.42 && side < 0.05 + (-0.2 - v) * 0.3) return 0.6;
  if (v <= -0.4 && v > -0.88 && side < 0.03) return 0.42;

  // Wings. A beat foreshortens the span and sweeps the tips back.
  const x = side / open;
  const sweep = 0.13 + 0.32 * (1 - open);
  const centreAt = (s: number) => 0.04 + 0.1 * s - sweep * s * s;

  if (x <= CRANE_SPAN) {
    const half = 0.18 * (1 - 0.5 * Math.pow(x / CRANE_SPAN, 1.5));
    const d = (v - centreAt(x)) / half; // -1 trailing edge .. 1 leading edge
    if (d < -1 || d > 1) return -1;
    let tone = 0.82 - 0.28 * (x / CRANE_SPAN); // paler toward the body
    tone *= 0.9 + 0.1 * Math.cos(x * 24); // feather bands
    if (d < -0.2) tone *= 0.72; // darker flight feathers along the trailing edge
    return tone;
  }

  // Dark finger feathers fanning out past the wingtip.
  const rootV = centreAt(CRANE_SPAN);
  const tipV = centreAt(CRANE_SPAN + CRANE_FINGER_LENGTH);
  for (const k of CRANE_FINGERS) {
    const d = distToSegment(
      x,
      v,
      CRANE_SPAN - 0.02,
      rootV + k * 0.05,
      CRANE_SPAN + CRANE_FINGER_LENGTH * (1 - 0.12 * Math.abs(k)),
      tipV + k * 0.13,
    );
    if (d < 0.03) return 0.4;
  }
  return -1;
}

interface Shape {
  tone: (u: number, v: number, open: number) => number;
  folded: number; // wing width on the last flap frame, as a share of fully open
  centreShift: number; // moves the shape back so it sits centred in the sprite
  detail: number; // multiplier on cells per side; thin shapes need finer cells
  flapRate: number; // multiplier on wing-beat frequency
}

const SHAPES: Record<Species, Shape> = {
  butterfly: { tone: butterflyTone, folded: 0.26, centreShift: 0.13, detail: 1, flapRate: 1 },
  crane: { tone: craneTone, folded: 0.5, centreShift: -0.05, detail: 1.3, flapRate: 0.5 },
};

/** How fast this species beats its wings, relative to the butterfly. */
export function speciesFlapRate(species: Species) {
  return SHAPES[species].flapRate;
}

/** Tone per cell for one flap frame, with the shape turned to face `direction`. */
function rasterise(shape: Shape, cells: number, open: number, direction: number): Float32Array {
  const out = new Float32Array(cells * cells).fill(-1);
  const cos = Math.cos(direction);
  const sin = Math.sin(direction);
  const step = (2 * EXTENT) / cells;

  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      let hits = 0;
      let sum = 0;
      for (let sy = 0; sy < SUBSAMPLES; sy++) {
        for (let sx = 0; sx < SUBSAMPLES; sx++) {
          // Screen-space offset from the sprite centre (y points down).
          const px = -EXTENT + (col + (sx + 0.5) / SUBSAMPLES) * step;
          const py = -EXTENT + (row + (sy + 0.5) / SUBSAMPLES) * step;
          const forwards = px * cos + py * sin;
          const sideways = -px * sin + py * cos;
          const tone = shape.tone(sideways, forwards + shape.centreShift, open);
          if (tone >= 0) {
            hits++;
            sum += tone;
          }
        }
      }
      if (hits >= MIN_COVERAGE) out[row * cells + col] = sum / hits;
    }
  }
  return out;
}

/** Stable pseudo-random value in 0..1 for a cell, so shimmer doesn't crawl between frames. */
function cellNoise(col: number, row: number, variant: number) {
  let h = Math.imul(col + 1, 374761393) ^ Math.imul(row + 1, 668265263) ^ Math.imul(variant + 1, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function rampColour(ramp: RGB[], t: number) {
  const scaled = Math.min(0.9999, Math.max(0, t)) * (ramp.length - 1);
  const i = Math.floor(scaled);
  const f = scaled - i;
  const a = ramp[i];
  const b = ramp[i + 1];
  const mix = (k: number) => Math.round(a[k] + (b[k] - a[k]) * f);
  return `rgb(${mix(0)},${mix(1)},${mix(2)})`;
}

function paint(
  tones: Float32Array,
  cells: number,
  pitch: number,
  dpr: number,
  variant: number,
  shimmer: number,
  ramp: RGB[],
) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = Math.ceil(cells * pitch * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const gap = Math.max(0.5, pitch * 0.18); // the gap is what makes cells read as a grid
  const fill = pitch - gap;

  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const tone = tones[row * cells + col];
      if (tone < 0) continue;
      const noise = (cellNoise(col, row, variant) - 0.5) * shimmer * 1.1;
      ctx.fillStyle = rampColour(ramp, tone + noise);
      ctx.fillRect(col * pitch + gap / 2, row * pitch + gap / 2, fill, fill);
    }
  }
  return canvas;
}

/** Wing width for a flap frame: 1 when open, `folded` on the last frame (never a bare line). */
function openness(frame: number, folded: number) {
  return 1 - (1 - folded) * Math.pow(frame / (FRAME_COUNT - 1), 1.4);
}

export function buildSprites(cfg: FieldConfig, palette: Palette, dpr: number): SpriteSet {
  const shape = SHAPES[cfg.species];
  const cells = Math.max(10, Math.round(20 * cfg.asciiDetail * shape.detail));
  // Keep the on-screen size steady as detail changes: more cells means smaller cells.
  const basePitch = (cfg.cellSize * cfg.size * 26) / cells;
  const direction = rad(cfg.direction);

  const tones: Float32Array[] = [];
  const filled: Int16Array[] = [];
  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const t = rasterise(shape, cells, openness(frame, shape.folded), direction);
    const coords: number[] = [];
    for (let i = 0; i < t.length; i++) if (t[i] >= 0) coords.push(i % cells, Math.floor(i / cells));
    tones.push(t);
    filled.push(Int16Array.from(coords));
  }

  const levels: SpriteLevel[] = LEVEL_SCALES.map((scale) => {
    const pitch = Math.max(2, Math.round(basePitch * scale));
    return {
      pitch,
      size: cells * pitch,
      frames: tones.map((t) =>
        Array.from({ length: VARIANT_COUNT }, (_, variant) =>
          paint(t, cells, pitch, dpr, variant, cfg.shimmer, palette.ramp),
        ),
      ),
    };
  });

  return { cells, levels, filled };
}
