/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { getProject, getProjects } from '@/lib/content';
import { absolute, safeUrl, SITE_NAME, SITE_URL, src } from '@/lib/format';
import { renderMarkdown } from '@/lib/markdown';

export const revalidate = 60;

// Pre-render every project at build time; new ones render on first visit.
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project not found', robots: { index: false } };
  const title = `${project.title} — Website Project`;
  const description = project.description || undefined;
  const images = project.image ? [{ url: absolute(project.image), alt: project.alt || project.title }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { type: 'article', title, description, url: `/projects/${project.slug}`, images },
    twitter: { card: 'summary_large_image', title, description, images: images?.map((i) => i.url) },
  };
}

export default async function ProjectPage(props: PageProps<'/projects/[slug]'>) {
  const { slug } = await props.params;
  const [project, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();

  const i = all.findIndex((p) => p.id === project.id);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i < all.length - 1 ? all[i + 1] : null;
  const url = `${SITE_URL}/projects/${project.slug}`;
  const services = (project.tags || '').split('·').map((t) => t.trim()).filter(Boolean);

  return (
    <section>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          description: project.description || undefined,
          image: project.image ? absolute(project.image) : undefined,
          url,
          creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          ...(project.url ? { sameAs: project.url } : {}),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
            { '@type': 'ListItem', position: 2, name: 'Projects', item: SITE_URL + '/#work' },
            { '@type': 'ListItem', position: 3, name: project.title, item: url },
          ],
        }}
      />
      <div className="wrap">
        <article className="article project-page" id="project">
          <Link className="back-link" href="/#work">← Back to projects</Link>
          <div className="eyebrow" style={{ marginTop: 18 }}>Website project</div>
          <h1>{project.title}</h1>
          {services.length > 0 && <div className="meta">{services.join(' · ')}</div>}
          {project.description && <p className="lead">{project.description}</p>}

          <div className="project-actions">
            {project.url && (
              <a className="button" href={safeUrl(project.url)} target="_blank" rel="noopener">Visit live website ↗</a>
            )}
            <a className="button light" href="/#contact">Start a similar project</a>
          </div>

          {project.image && <img className="cover" src={src(project.image)} alt={project.alt || project.title + ' homepage screenshot'} />}

          {project.body ? (
            <div className="body" dangerouslySetInnerHTML={{ __html: renderMarkdown(project.body) }} />
          ) : (
            <div className="body">
              <h2>What we delivered</h2>
              <ul>
                {(services.length ? services : ['Custom Website Development', 'SEO']).map((s) => <li key={s}>{s}</li>)}
                <li>Google indexing set up from launch</li>
                <li>Technical SEO foundations included</li>
              </ul>
            </div>
          )}

          <div className="project-cta">
            <h2>Want a website like this?</h2>
            <p>Custom websites built to help your business communicate its value, reach the right people and generate enquiries.</p>
            <a className="button" href="/#contact">Let&apos;s talk</a>
          </div>

          {(prev || next) && (
            <nav className="project-nav" aria-label="More projects">
              {prev && <Link href={`/projects/${prev.slug}`}><small>Previous</small>← {prev.title}</Link>}
              {next && <Link className="next" href={`/projects/${next.slug}`}><small>Next</small>{next.title} →</Link>}
            </nav>
          )}
        </article>
      </div>
    </section>
  );
}
