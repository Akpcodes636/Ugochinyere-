/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { getPost, getPosts } from '@/lib/content';
import { renderMarkdown } from '@/lib/markdown';
import { absolute, formatDate, modifiedAt, readingTime, SITE_NAME, SITE_URL, src, wordCount } from '@/lib/format';

export const revalidate = 60;

// Pre-render every published post at build time; new posts render on first visit.
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return { title: 'Article not found', robots: { index: false } };
  const description = post.excerpt || undefined;
  const images = post.cover ? [{ url: absolute(post.cover), alt: post.title }] : undefined;
  return {
    title: post.title,
    description,
    authors: post.author ? [{ name: post.author }] : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.published_at,
      modifiedTime: modifiedAt(post),
      authors: post.author ? [post.author] : undefined,
      images,
    },
    twitter: { card: 'summary_large_image', title: post.title, description, images: images?.map((i) => i.url) },
  };
}

export default async function PostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const modified = modifiedAt(post);
  // Show "Updated …" only when it falls on a later day than the publish date.
  const updatedLabel = formatDate(modified) !== formatDate(post.published_at) ? formatDate(modified) : '';
  const words = wordCount(post.body);
  const minutes = readingTime(words);
  return (
    <section>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt || undefined,
          image: post.cover ? absolute(post.cover) : undefined,
          datePublished: post.published_at,
          dateModified: modifiedAt(post),
          author: post.author ? { '@type': 'Person', name: post.author } : { '@id': SITE_URL + '/#business' },
          publisher: { '@type': 'Organization', '@id': SITE_URL + '/#business', name: SITE_NAME, url: SITE_URL },
          inLanguage: 'en-GB',
          mainEntityOfPage: url,
          url,
          wordCount: words,
          timeRequired: `PT${minutes}M`,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE_URL + '/blog' },
            { '@type': 'ListItem', position: 3, name: post.title, item: url },
          ],
        }}
      />
      <div className="wrap">
        <article className="article" id="post">
          <Link className="back-link" href="/#blog">← Back to the blog</Link>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="subtitle">{post.excerpt}</p>}
          <div className="meta">
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            {updatedLabel && <> · Updated <time dateTime={modified}>{updatedLabel}</time></>}
            {post.author ? ' · ' + post.author : ''}
            {' · '}{minutes} min read
          </div>
          {post.cover && <img className="cover" src={src(post.cover)} alt={post.title} />}
          <div className="body" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
        </article>
      </div>
    </section>
  );
}
