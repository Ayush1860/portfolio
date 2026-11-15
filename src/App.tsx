import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { prefersReducedMotion, setLenis } from './lib/scroll';
import Hero from './sections/Hero';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import Blogs from './sections/Blogs';
import Links from './sections/Links';

export default function App() {
  useEffect(() => {
    if (prefersReducedMotion()) return; // native scroll
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: true });
    setLenis(lenis);
    return () => {
      setLenis(null);
      lenis.destroy();
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
