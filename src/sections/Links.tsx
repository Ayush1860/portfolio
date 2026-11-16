import { ArrowRight } from 'lucide-react';
import NewTabHint from '../components/NewTabHint';
import Parallax from '../components/Parallax';
import { RevealGroup, RevealItem } from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { links, linksSection, type ProfileLink } from '../content/links';
import { PARALLAX } from '../lib/motion';

function LinkRow({ link }: { link: ProfileLink }) {
  const Icon = link.icon;
  const isEmail = link.id === 'email';
  const classes = `link-row${isEmail ? ' link-row-email' : ''}`;

  const body = (
    <>
      <Icon className="link-icon" aria-hidden />
      <span className="link-label">{link.label}</span>
      <span className="link-handle">{link.handle ?? linksSection.missingLabel}</span>
      <ArrowRight className="link-arrow" aria-hidden />
    </>
  );

  if (!link.url) return <div className={`${classes} link-row-pending`}>{body}</div>;

  // Email opens the mail app; everything else opens a new tab.
  return isEmail ? (
    <a className={classes} href={link.url}>
      {body}
    </a>
  ) : (
    <a className={classes} href={link.url} target="_blank" rel="noopener">
      {body}
      <NewTabHint />
    </a>
  );
}

export default function Links() {
  return (
    <section id="links" className="section" aria-labelledby="links-title">
      <div className="container-page">
        <SectionHeading id="links-title" eyebrow={linksSection.eyebrow} title={linksSection.title} />
        <Parallax shift={PARALLAX.content}>
          <RevealGroup as="ul" className="link-list" stagger={0.06}>
            {links.map((link) => (
              <RevealItem as="li" key={link.id}>
                <LinkRow link={link} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Parallax>
      </div>
    </section>
  );
}
