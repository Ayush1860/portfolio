/** Tunable values for the butterfly field. Adjust live on /lab, then copy them here. */
export interface FieldConfig {
  /* Movement */
  density: number; // multiplier on butterflies per screen area
  speed: number; // multiplier on drift speed
  size: number; // multiplier on butterfly size
  direction: number; // shared heading in degrees: 0 = right, 90 = down
  spread: number; // each butterfly's heading varies by ± this many degrees
  farthestDepth: number; // smallest depth z; 1 is nearest
  farBias: number; // > 1 pushes more butterflies toward the far end
  holdCourse: number; // how firmly a butterfly returns to its own heading
  separation: number; // personal space; 0 turns avoidance off
  /* Flight */
  flutter: number; // sideways wobble
  glide: number; // how often flapping pauses; 0 = never
  flapRate: number; // multiplier on wing-beat frequency
  /* Look */
  shimmer: number; // per-cell brightness noise
  sparkle: number; // white flash frequency
  distanceFade: number; // how much far butterflies dim (0 = none)
  trail: number; // trail length multiplier; 0 = no trails
  trailFade: number; // fraction of the trail removed per 60 Hz frame
  grid: number; // dot-grid spacing and dot size
  asciiDetail: number; // cells per butterfly
  cellSize: number; // cell pitch in CSS px at depth 1
}

export const DEFAULT_CONFIG: FieldConfig = {
  density: 1.05,
  speed: 1.05,
  size: 1.25,
  direction: 49,
  spread: 8,
  farthestDepth: 0.18,
  farBias: 1.7,
  holdCourse: 5,
  separation: 700,
  flutter: 0,
  glide: 2.75,
  flapRate: 1,
  shimmer: 0.3,
  sparkle: 0.12,
  distanceFade: 0.75,
  trail: 1.55,
  trailFade: 0.15,
  grid: 1.05,
  asciiDetail: 1.3,
  cellSize: 5,
};

/* Population */
export const AREA_PER_BUTTERFLY = 60000; // px² of viewport per butterfly at density 1
export const MAX_DESKTOP = 40;
export const MAX_MOBILE = 14;
export const MIN_COUNT = 4;
export const MOBILE_WIDTH = 768;
export const LOW_CORE_COUNT = 4;

/* Rendering */
export const DPR_CAP = 1.5;
export const RESIZE_DEBOUNCE_MS = 150;
export const BASE_SPEED = 68; // px/s at depth 1, speed 1
export const BASE_FLAP_HZ = 2.6;

/* Scroll blur (see useScrollBlur.ts) */
export const BLUR_MAX = 70; // intensity scale
export const PX_PER_POINT = 0.2; // 70 -> 14px. Set to 1 for a literal 70px.
export const SCRIM_MAX = 0.35;
export const LOCK_AT = 0.25; // lock when Projects' top is 25% down the viewport

/* Colours. The live values are the --wing-* tokens in tokens.css; these are fallbacks. */
export type RGB = [number, number, number];

export interface Palette {
  ramp: RGB[];
  spark: string;
}

const FALLBACK_RAMP = ['#0A2A66', '#003B8F', '#3E74D6', '#9CC2FF'];
const FALLBACK_SPARK = '#FFFFFF';

function parseHex(value: string): RGB | null {
  const m = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const ramp = FALLBACK_RAMP.map(
    (fallback, i) => parseHex(css.getPropertyValue(`--wing-${i + 1}`)) ?? parseHex(fallback)!,
  );
  const spark = css.getPropertyValue('--wing-spark').trim() || FALLBACK_SPARK;
  return { ramp, spark };
}
