import { useCallback, useRef } from 'react';
import { attachLiquidGlass, type LiquidGlassOptions } from './liquidGlass';

/**
 * Ref for a `.glass` element that should refract what is behind it at its edges.
 * Usage: <div ref={useLiquidGlass()} className="glass" />
 */
export function useLiquidGlass<T extends HTMLElement = HTMLElement>(options?: LiquidGlassOptions) {
  const initial = useRef(options);
  const detach = useRef<(() => void) | null>(null);

  return useCallback((el: T | null) => {
    detach.current?.();
    detach.current = el ? attachLiquidGlass(el, initial.current) : null;
  }, []);
}
