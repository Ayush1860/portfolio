# ascii-animals (vendored)

The background animation on this site is the crane from **ascii animals**.

- Source: https://github.com/DesignerStephen1/ascii-animals
- Commit: `93f2b669b950f035f8cd787dba685d6dc643b0d6`
- Licence: MIT, Copyright (c) 2026 drewdi, Copyright (c) 2026 Stephen Zhang. See `LICENSE` in this folder.
  The same notice ships with the built site at `/licenses/ascii-animals-LICENSE.txt`.

## What is here

Copied unchanged from the upstream `src/` folder:

- `engine.ts` (one default changed, below), `flock.ts`, `renderer.ts`, `ink.ts`, `math.ts`, `index.ts`
- `animals/cranes.ts`, `animals/shapes.ts`

Not copied: the other animals, `react.tsx`, `animals/candidates.ts`, and the demo page.

## Changes from upstream

- `animals/index.ts` is rewritten to register only the crane.
- `engine.ts`: the constructor's default animal is `"cranes"` instead of `"butterflies"`,
  because the butterfly is not vendored.

To update, copy the files again from upstream and re-apply those two changes.
