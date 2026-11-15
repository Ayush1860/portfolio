import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { startScrollBlur } from './background/useScrollBlur';
import { prefersReducedMotion, setLenis } from './lib/scroll';
import Hero from './sections/Hero';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import Blogs from './sections/Blogs';
import Links from './sections/Links';

export default function App() {
  useEffect(() => {
    // Reduced motion: no Lenis (native scroll), and the blur follows scroll unsmoothed.
    const lenis = prefersReducedMotion()
      ? null
      : new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: true });
    setLenis(lenis);

    const projects = document.getElementById('projects');
    const stopBlur = projects ? startScrollBlur(lenis, projects) : undefined;

    return () => {
      stopBlur?.();
      setLenis(null);
      lenis?.destroy();
    };
  }, []);

  return (
    <main>
      <Hero />
      <Projects />
      <Skills />
      <Blogs />
      <Links />
    </main>
  );
}
