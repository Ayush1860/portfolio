// Trimmed for this site: the upstream file registers every animal; only the crane ships here.
// See ../SOURCE.md for where this code comes from and what was changed.
import type { Animal } from "../flock";
import { cranes } from "./cranes";

/** Every animal, in the order the choices show them. */
export const ANIMALS = {
  cranes,
} satisfies Record<string, Animal<any>>;

export type AnimalKey = keyof typeof ANIMALS;

export const ANIMAL_KEYS = Object.keys(ANIMALS) as AnimalKey[];
