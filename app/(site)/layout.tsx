import type { Metadata, Viewport } from 'next';
import 'intl-tel-input/styles';
import '../styles.css';
import { Footer, Header } from '@/components/SiteChrome';
import { SITE_NAME, SITE_URL, SOCIALS } from '@/lib/format';

const description =
  'The Digital PM helps businesses increase visibility through SEO-optimised website development, Google Business Profile setup and optimisation, and keyword research.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SEO Websites & Google Business Profile Optimisation | The Digital PM',
    template: '%s | The Digital PM',
  },
  description,
  applicationName: SITE_NAME,
  authors: [{ name: 'Ugochinyere', url: SOCIALS.linkedin }],
  creator: 'Ugochinyere',
  publisher: SITE_NAME,
  category: 'business',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_GB',
    title: 'SEO Websites & Google Business Profile Optimisation | The Digital PM',
    description,
    url: '/',
    images: [{ url: '/assets/images/founder.jpg', alt: 'Ugochinyere, founder of The Digital PM' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO Websites & Google Business Profile Optimisation | The Digital PM',
    description,
    images: ['/assets/images/founder.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
