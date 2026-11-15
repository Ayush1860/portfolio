interface Props {
  id: string; // id for the heading, referenced by the section's aria-labelledby
  eyebrow: string;
  title: string;
}

/** Mono eyebrow with the small red tick, then the section's single headline. */
export default function SectionHeading({ id, eyebrow, title }: Props) {
  return (
    <header className="section-heading">
      <p className="eyebrow t-label text-text-2">
        <span className="eyebrow-tick" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 id={id} className="t-section">
        {title}
      </h2>
    </header>
  );
}
