import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep old static-site URLs working (and pass their SEO value on).
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/blog.html', destination: '/blog', permanent: true },
      {
        source: '/post.html',
        has: [{ type: 'query', key: 'slug', value: '(?<slug>[a-z0-9-]+)' }],
        destination: '/blog/:slug',
        permanent: true,
      },
      { source: '/post.html', destination: '/blog', permanent: true },
      { source: '/admin/index.html', destination: '/admin', permanent: true },
    ];
  },
};

export default nextConfig;
