import { RevealGroup, RevealItem } from './Reveal';

interface Props {
  id: string; // id for the heading, referenced by the section's aria-labelledby
  eyebrow: string;
  title: string;
}

/** Mono eyebrow with the small red tick, then the section's single headline. */
export default function SectionHeading({ id, eyebrow, title }: Props) {
  return (
    <RevealGroup as="header" className="section-heading">
      <RevealItem as="p" className="eyebrow t-label text-text-2">
        <span className="eyebrow-tick" aria-hidden="true" />
        {eyebrow}
      </RevealItem>
      <RevealItem as="h2" id={id} className="t-section">
        {title}
      </RevealItem>
    </RevealGroup>
  );
}
