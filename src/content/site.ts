/** Site-wide copy: identity, hero, nav and footer. */
export const site = {
  name: 'Ayush Suryawanshi',
  label: 'M.Tech · MANIT Bhopal',
  // TODO: final hero line — one sentence on what Ayush builds.
  heroLine:
    'I build computer-vision and generative-AI systems, currently transformer-based 3D asset generation.',
  resume: { label: 'Résumé', url: '/resume.pdf' }, // TODO: add public/resume.pdf
  nav: [
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'blogs', label: 'Blogs' },
    { id: 'links', label: 'Links' },
  ],
  cta: {
    primary: { label: 'See projects', target: 'projects' },
    secondary: { label: 'Get in touch', target: 'links' },
  },
  scrollCue: 'Scroll',
  footer: {
    copyright: '© 2026 Ayush Suryawanshi',
    note: 'Built with React and a lot of butterflies',
  },
} as const;
