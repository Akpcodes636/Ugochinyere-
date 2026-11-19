import type { MetadataRoute } from 'next';
import { getPosts, getProjects } from '@/lib/content';
import { modifiedAt, SITE_URL } from '@/lib/format';

export const revalidate = 60; // so scheduled posts join the sitemap as soon as they go live

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);
  const latest = posts.map(modifiedAt).sort().pop();
  return [
    { url: SITE_URL + '/', changeFrequency: 'weekly', priority: 1 },
    { url: SITE_URL + '/blog', lastModified: latest, changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: modifiedAt(p),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
