import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * The site's public address, used in share cards, the canonical link, robots.txt and
 * sitemap.xml. Set SITE_URL in the host's environment (Vercel: Project → Settings →
 * Environment Variables) if the address differs, or when a custom domain is added.
 */
const SITE_URL = (process.env.SITE_URL ?? 'https://ayush-suryawanshi.vercel.app').replace(/\/+$/, '');

/** Fills %SITE_URL% in index.html and writes robots.txt and sitemap.xml next to the build. */
function siteUrl(): Plugin {
  let outDir = 'dist';
  return {
    name: 'site-url',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL),
    closeBundle() {
      writeFileSync(
        resolve(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\nDisallow: /lab\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      );
      writeFileSync(
        resolve(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}/</loc></url>\n</urlset>\n`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
});
