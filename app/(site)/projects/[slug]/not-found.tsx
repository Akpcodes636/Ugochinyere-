import Link from 'next/link';

export default function ProjectNotFound() {
  return (
    <section>
      <div className="wrap">
        <article className="article">
          <div className="eyebrow">Projects</div>
          <h1>Project not found.</h1>
          <p>This project may have been moved or removed.</p>
          <Link className="back-link" href="/#work">← Back to projects</Link>
        </article>
      </div>
    </section>
  );
}
