/** Site-wide copy: identity, hero, nav and footer. */
export const site = {
  name: 'Ayush Suryawanshi',
  label: 'M.Tech · MANIT Bhopal',
  heroLine:
    'I research AI/ML and build generative-AI systems, currently detecting hallucinations in retrieval-augmented generation.',
  resume: { label: 'Résumé', url: '/resume.pdf' },
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
    note: 'Built with React and a lot of cranes',
  },
} as const;
