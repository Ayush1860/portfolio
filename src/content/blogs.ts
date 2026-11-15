export interface BlogCover {
  src: string; // WebP/AVIF in /public, 16:9
  width: number;
  height: number;
  alt: string;
}

export interface BlogPost {
  title: string;
  date: string | null; // ISO date, e.g. '2026-03-14'; null = not published yet
  excerpt: string; // two lines
  url: string | null; // null = link still to come
  cover: BlogCover | null; // null = placeholder panel
}

export const blogsSection = {
  eyebrow: 'Blogs',
  title: 'Writing',
  source: 'AWS Builder Center',
  readLabel: 'Read',
  missingLabel: 'Link coming soon',
  undated: 'Coming soon',
  more: { label: 'More posts', url: 'https://builder.aws.com/community/@ayush1806' },
};

// Metadata is kept by hand here: no scraping.
// TODO: two real posts — Builder Center URL, title, date, two-line excerpt, cover image.
export const posts: BlogPost[] = [
  {
    title: 'First post title goes here',
    date: null,
    excerpt:
      'A two-line summary of the post: what it covers, and what a reader will be able to do after reading it.',
    url: null,
    cover: null,
  },
  {
    title: 'Second post title goes here',
    date: null,
    excerpt:
      'A two-line summary of the post: what it covers, and what a reader will be able to do after reading it.',
    url: null,
    cover: null,
  },
];
