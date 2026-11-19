import Link from 'next/link';
import { formatDate, src } from '@/lib/format';
import type { BlogPost } from '@/lib/types';

export function PostCard({ post: p }: { post: BlogPost }) {
  const href = `/blog/${encodeURIComponent(p.slug)}`;
  return (
    <article className="post-card">
      {p.cover && (
        <Link href={href}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src(p.cover)} alt={p.title} loading="lazy" />
        </Link>
      )}
      <div className="info">
        {p.published_at && <time dateTime={p.published_at}>{formatDate(p.published_at)}</time>}
        <h3>{p.title}</h3>
        <p>{p.excerpt || ''}</p>
        <Link href={href}>Read article →</Link>
      </div>
    </article>
  );
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return <div className="blog-grid">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>;
}
