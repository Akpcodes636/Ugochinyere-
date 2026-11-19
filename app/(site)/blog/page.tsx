import type { Metadata } from 'next';
import { BlogGrid } from '@/components/PostCard';
import { JsonLd } from '@/components/JsonLd';
import { getPosts } from '@/lib/content';
import { modifiedAt, SITE_NAME, SITE_URL } from '@/lib/format';

export const revalidate = 60;

const description = 'Insights on website development, SEO and building a stronger online presence for your business.';

export const metadata: Metadata = {
  title: 'Blog',
  description,
  alternates: { canonical: '/blog' },
  openGraph: { title: 'Blog | The Digital PM', description, url: '/blog' },
};

export default async function BlogIndex() {
  const posts = await getPosts();
  return (
    <section className="blog">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `${SITE_NAME} Blog`,
          url: SITE_URL + '/blog',
          description,
          blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.published_at, dateModified: modifiedAt(p) })),
        }}
      />
      <div className="wrap">
        <div className="heading">
          <div className="eyebrow">Ideas, guidance &amp; practical tips</div>
          <h2>From the Blog.</h2>
          <p>{description}</p>
        </div>
        <div id="blog-all">
          {posts.length ? (
            <BlogGrid posts={posts} />
          ) : (
            <div className="empty-state">
              <div className="eyebrow">Coming soon</div>
              <h3>Useful insights are on the way.</h3>
              <p>New articles will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
