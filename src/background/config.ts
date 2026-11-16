import type { AnimalKey, Tuning } from '../vendor/ascii-animals';

/* Background animation: the crane from ascii-animals (see src/vendor/ascii-animals/SOURCE.md). */
export const ANIMAL: AnimalKey = 'cranes';

/**
 * Overrides on the crane's own defaults. Empty means "exactly as upstream".
 * Try values live on /lab, then copy the ones you want to keep here, e.g. { density: 1.2 }.
 */
export const ANIMAL_TUNING: Partial<Tuning> = {};

/* Scroll blur (see useScrollBlur.ts) */
export const BLUR_MAX = 70; // intensity scale
export const PX_PER_POINT = 0.2; // 70 -> 14px. Set to 1 for a literal 70px.
export const SCRIM_MAX = 0.35;
export const LOCK_AT = 0.25; // lock when Projects' top is 25% down the viewport
