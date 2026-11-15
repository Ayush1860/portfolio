import { ArrowUpRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import NewTabHint from '../components/NewTabHint';
import SectionHeading from '../components/SectionHeading';
import { blogsSection, posts, type BlogPost } from '../content/blogs';

const dateFormat = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' });

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <GlassCard href={post.url} className="blog-card">
      {post.cover ? (
        <img
          className="blog-cover"
          src={post.cover.src}
          width={post.cover.width}
          height={post.cover.height}
          alt={post.cover.alt}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="blog-cover blog-cover-empty" aria-hidden="true" />
      )}
      <div className="blog-body">
        <p className="t-label text-text-3">
          {post.date ? (
            <time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time>
          ) : (
            blogsSection.undated
          )}
          {' · '}
          {blogsSection.source}
        </p>
        <h3 className="t-card">{post.title}</h3>
        <p className="card-copy text-text-2 line-clamp-2">{post.excerpt}</p>
        {post.url ? (
          <p className="card-foot">
            {blogsSection.readLabel}
            <ArrowUpRight className="arrow" aria-hidden />
          </p>
        ) : (
          <p className="card-foot card-foot-muted">{blogsSection.missingLabel}</p>
        )}
      </div>
    </GlassCard>
  );
}

export default function Blogs() {
  return (
    <section id="blogs" className="section" aria-labelledby="blogs-title">
      <div className="container-page">
        <SectionHeading id="blogs-title" eyebrow={blogsSection.eyebrow} title={blogsSection.title} />
        <ul className="blog-grid">
          {posts.map((post) => (
            <li key={post.title}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
        <p className="blog-more">
          <a className="text-link" href={blogsSection.more.url} target="_blank" rel="noopener">
            {blogsSection.more.label}
            <ArrowUpRight className="arrow" aria-hidden />
            <NewTabHint />
          </a>
        </p>
      </div>
    </section>
  );
}
