import type { ReactNode } from 'react';
import NewTabHint from './NewTabHint';

interface Props {
  href?: string | null; // when set, the whole card is one external link
  className?: string;
  children: ReactNode;
}

/** Frosted-glass card. With an href the entire card is a single new-tab link. */
export default function GlassCard({ href, className = '', children }: Props) {
  const classes = `glass card ${className}`;

  if (href) {
    return (
      <a className={`${classes} card-link`} href={href} target="_blank" rel="noopener">
        {children}
        <NewTabHint />
      </a>
    );
  }
  return <div className={classes}>{children}</div>;
}
