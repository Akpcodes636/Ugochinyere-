import Link from 'next/link';

export default function PostNotFound() {
  return (
    <section>
      <div className="wrap">
        <article className="article" id="post">
          <div className="eyebrow">Blog</div>
          <h1>Article not found.</h1>
          <p>This article may have been moved or removed.</p>
          <Link className="back-link" href="/#blog">← Back to the blog</Link>
        </article>
      </div>
    </section>
  );
}
