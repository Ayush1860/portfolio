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
export const posts: BlogPost[] = [
  {
    title: 'SecureRAG: Zero-Leak RAG on AWS Lambda for $0.20/month',
    date: '2026-10-25',
    excerpt:
      'A retrieval-augmented generation service that enforces role-based access, so no caller can retrieve or decrypt documents outside their policy, running on AWS Lambda for cents a month.',
    url: 'https://builder.aws.com/content/3L32dyZpm8iTILaa6i0OghNxfDM/securerag-zero-leak-rag-on-aws-lambda-for-dollar020month',
    cover: { src: '/blog/securerag-cover.webp', width: 2400, height: 1350, alt: 'SecureRAG article cover' },
  },
  {
    title: "Your company's AI assistant can leak the layoff list. Here's why, and how to build RAG that can't",
    date: '2026-11-06',
    excerpt:
      'Similarity search ignores permissions, so enterprise RAG can surface confidential data. A three-layer AWS design to stop it: filter before retrieval, keep permissions fresh, guard the output.',
    url: 'https://builder.aws.com/content/3LjluHhD2V8TjEIVkWbFtODVQZa/your-companys-ai-assistant-can-leak-the-layoff-list-heres-why-and-how-to-build-rag-that-cant',
    cover: { src: '/blog/rag-leak-cover.webp', width: 1600, height: 900, alt: 'Article cover: an AI assistant leaking confidential data' },
  },
];
