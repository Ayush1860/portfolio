/**
 * Marks <html> with data-past-40 / data-past-80 once the page has scrolled that far.
 * CSS does the rest (nav glass, scroll cue), so scrolling never re-renders React.
 */
export function startScrollFlags(): () => void {
  const root = document.documentElement;
  const marks = [40, 80];
  const state = marks.map(() => false);

  const update = () => {
    const y = window.scrollY;
    marks.forEach((mark, i) => {
      const past = y > mark;
      if (past === state[i]) return;
      state[i] = past;
      root.toggleAttribute(`data-past-${mark}`, past);
    });
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  return () => {
    window.removeEventListener('scroll', update);
    marks.forEach((mark) => root.removeAttribute(`data-past-${mark}`));
  };
}
