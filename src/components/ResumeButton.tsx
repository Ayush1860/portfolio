import { site } from '../content/site';
import NewTabHint from './NewTabHint';

/** The one strong red element on the page. */
export default function ResumeButton() {
  return (
    <a className="btn btn-resume" href={site.resume.url} target="_blank" rel="noopener">
      {site.resume.label}
      <NewTabHint />
    </a>
  );
}
