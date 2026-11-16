import { useEffect, useState } from 'react';
import { getEngine, getGridStrength, resetBackground, setGridStrength, syncGrid } from '../background';
import { BLUR_MAX, PX_PER_POINT } from '../background/config';
import { applyBlur } from '../background/useScrollBlur';
import { SHARED_CONTROLS, type KnobSpec, type Tuning } from '../vendor/ascii-animals';

/** Bare page for tuning the background animation before it goes behind real content. */
export default function Lab() {
  const engine = getEngine();
  const [tuning, setTuning] = useState<Tuning | null>(() =>
    engine ? { ...engine.tuning, grid: getGridStrength() } : null,
  );
  const [blur, setBlur] = useState(0);

  useEffect(() => applyBlur(blur / BLUR_MAX), [blur]);

  if (!engine || !tuning) return null;

  // The same knobs the original demo exposes: shared movement, the animal's own, shared look.
  const groups: [string, KnobSpec[]][] = [
    ['Movement', SHARED_CONTROLS.movement],
    ...engine.animal.controls,
    ['Look', SHARED_CONTROLS.look],
  ];

  // The grid is drawn by CSS, not the engine (see background/index.ts), so its knob goes there.
  const snapshot = (): Tuning => ({ ...engine.tuning, grid: getGridStrength() });

  const change = (key: string, value: number | boolean) => {
    if (key === 'grid') setGridStrength(Number(value));
    else engine.set(key, value);
    syncGrid(); // ASCII detail changes the cell size
    setTuning(snapshot());
  };

  const reset = () => {
    resetBackground();
    setTuning(snapshot());
    setBlur(0);
  };

  return (
    <main className="lab">
      <form className="lab-panel glass" onSubmit={(event) => event.preventDefault()}>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="t-label text-text">{engine.animal.label} lab</h1>
          <a className="t-label text-blue-text" href="/">
            Back to site
          </a>
        </div>

        {groups.map(([title, knobs]) => (
          <fieldset key={title} className="lab-group">
            <legend className="t-label text-text-3">{title}</legend>
            {knobs.map((knob) => {
              const value = tuning[knob.key];
              if ('toggle' in knob) {
                return (
                  <label key={knob.key} className="lab-toggle" title={knob.hint}>
                    <span className="t-label text-text-2">{knob.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) => change(knob.key, event.target.checked)}
                    />
                  </label>
                );
              }
              const disabled = knob.disabledWhen ? Boolean(tuning[knob.disabledWhen]) : false;
              return (
                <label key={knob.key} className="lab-row" title={knob.hint}>
                  <span className="t-label text-text-2">{knob.label}</span>
                  <output className="t-label text-text-3">{Number(value).toFixed(2)}</output>
                  <input
                    type="range"
                    min={knob.min}
                    max={knob.max}
                    step={knob.step}
                    value={Number(value)}
                    disabled={disabled}
                    onChange={(event) => change(knob.key, Number(event.target.value))}
                  />
                </label>
              );
            })}
          </fieldset>
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
