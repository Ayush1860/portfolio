import { site } from '../content/site';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-page footer-inner">
        <p>{site.footer.copyright}</p>
        <p>{site.footer.note}</p>
      </div>
    </footer>
  );
}
