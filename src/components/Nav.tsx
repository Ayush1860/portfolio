import { useEffect, useRef, type MouseEvent } from 'react';
import { site } from '../content/site';
import { scrollToId } from '../lib/scroll';
import ResumeButton from './ResumeButton';

export default function Nav() {
  const linksRef = useRef<HTMLElement>(null);

  // Mark the link of the section crossing the middle of the viewport.
  // Written straight to the DOM (aria-current), so scrolling never re-renders React.
  useEffect(() => {
    const nav = linksRef.current;
    if (!nav) return;
    const anchors = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[data-section]'));
    const sections = ['hero', ...site.nav.map((item) => item.id)]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const a of anchors) {
            if (a.dataset.section === entry.target.id) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          }
        }
      },
      { rootMargin: '-45% 0px -55% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => (event: MouseEvent) => {
    event.preventDefault();
    scrollToId(id);
  };

  return (
    <header className="nav">
      <div className="container-page nav-inner">
        <a className="nav-name" href="#hero" onClick={go('hero')}>
          {site.name}
        </a>

        <nav ref={linksRef} className="nav-links" aria-label="Sections">
          {site.nav.map((item) => (
            <a
              key={item.id}
              className="nav-link"
              href={`#${item.id}`}
              data-section={item.id}
              onClick={go(item.id)}
            >
              {item.label}
              <span className="nav-dot" aria-hidden="true" />
            </a>
          ))}
        </nav>

        <ResumeButton />
      </div>
    </header>
  );
}
