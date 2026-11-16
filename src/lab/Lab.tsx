import { useEffect, useState } from 'react';
import { getField } from '../background';
import {
  BLUR_MAX,
  DEFAULT_CONFIG,
  PX_PER_POINT,
  type FieldConfig,
  type Species,
} from '../background/config';

const SPECIES: { value: Species; label: string }[] = [
  { value: 'butterfly', label: 'Butterfly' },
  { value: 'crane', label: 'Crane' },
];

type NumericKey = {
  [K in keyof FieldConfig]: FieldConfig[K] extends number ? K : never;
}[keyof FieldConfig];

interface Slider {
  key: NumericKey;
  label: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: Slider[] = [
  { key: 'density', label: 'Density', min: 0.2, max: 2.5, step: 0.05 },
  { key: 'speed', label: 'Speed', min: 0, max: 3, step: 0.05 },
  { key: 'size', label: 'Size', min: 0.5, max: 2, step: 0.05 },
  { key: 'cellSize', label: 'Cell size', min: 3, max: 8, step: 0.5 },
  { key: 'direction', label: 'Direction', min: 0, max: 360, step: 1 },
  { key: 'flapRate', label: 'Flap rate', min: 0.2, max: 2.5, step: 0.05 },
  { key: 'glide', label: 'Glide', min: 0, max: 6, step: 0.25 },
  { key: 'flutter', label: 'Flutter', min: 0, max: 2, step: 0.05 },
  { key: 'shimmer', label: 'Shimmer', min: 0, max: 1, step: 0.01 },
  { key: 'sparkle', label: 'Sparkle', min: 0, max: 1, step: 0.01 },
  { key: 'distanceFade', label: 'Distance fade', min: 0, max: 1, step: 0.01 },
  { key: 'trail', label: 'Trail', min: 0, max: 4, step: 0.05 },
  { key: 'asciiDetail', label: 'ASCII detail', min: 0.6, max: 2, step: 0.05 },
];

/** Bare page for tuning the butterfly field before it goes behind real content. */
export default function Lab() {
  const [cfg, setCfg] = useState<FieldConfig>({ ...DEFAULT_CONFIG });
  const [blur, setBlur] = useState(0);

  const change = (key: NumericKey, value: number) => {
    setCfg((current) => ({ ...current, [key]: value }));
    getField()?.setConfig({ [key]: value });
  };

  const changeSpecies = (species: Species) => {
    setCfg((current) => ({ ...current, species }));
    getField()?.setConfig({ species });
  };

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--blur', `${(blur * PX_PER_POINT).toFixed(2)}px`);
    root.setProperty('--blur-progress', (blur / BLUR_MAX).toFixed(3));
  }, [blur]);

  const reset = () => {
    setCfg({ ...DEFAULT_CONFIG });
    setBlur(0);
    getField()?.setConfig({ ...DEFAULT_CONFIG });
  };

  return (
    <main className="lab">
      <form className="lab-panel glass" onSubmit={(event) => event.preventDefault()}>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="t-label text-text">Butterfly lab</h1>
          <a className="t-label text-blue-text" href="/">
            Back to site
          </a>
        </div>

        <div className="lab-species" role="group" aria-label="Animal">
          {SPECIES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className="lab-reset t-label"
              aria-pressed={cfg.species === value}
              onClick={() => changeSpecies(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {SLIDERS.map(({ key, label, min, max, step }) => (
          <label key={key} className="lab-row">
            <span className="t-label text-text-2">{label}</span>
            <output className="t-label text-text-3">{cfg[key].toFixed(2)}</output>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={cfg[key]}
              onChange={(event) => change(key, Number(event.target.value))}
            />
          </label>
        ))}

        <label className="lab-row">
          <span className="t-label text-text-2">Blur</span>
          <output className="t-label text-text-3">
            {blur} · {(blur * PX_PER_POINT).toFixed(1)}px
          </output>
          <input
            type="range"
            min={0}
            max={BLUR_MAX}
            step={1}
            value={blur}
            onChange={(event) => setBlur(Number(event.target.value))}
          />
        </label>

        <button type="button" className="lab-reset t-label" onClick={reset}>
          Reset to config.ts
        </button>
      </form>
    </main>
  );
}
