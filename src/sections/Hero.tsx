import { ArrowDown } from 'lucide-react';
import { site } from '../content/site';
import { scrollToId } from '../lib/scroll';

export default function Hero() {
  const { primary, secondary } = site.cta;

  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <div className="hero-card glass">
        <p className="t-label text-text-2">{site.label}</p>
        <h1 id="hero-title" className="hero-name">
          {site.name}
        </h1>
        <p className="hero-line text-text-2">{site.heroLine}</p>
        <div className="hero-actions">
          <a
            className="btn btn-outline"
            href={`#${primary.target}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToId(primary.target);
            }}
          >
            {primary.label}
          </a>
          <a
            className="btn btn-quiet"
            href={`#${secondary.target}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToId(secondary.target);
            }}
          >
            {secondary.label}
          </a>
        </div>
      </div>

      <p className="scroll-cue t-label text-text-3" aria-hidden="true">
        {site.scrollCue}
        <ArrowDown className="scroll-cue-icon" />
      </p>
    </section>
  );
}
