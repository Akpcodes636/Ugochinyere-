import type { Metadata, Viewport } from 'next';
import '../styles.css';
import '../admin.css';

export const metadata: Metadata = {
  title: 'Admin | The Digital PM',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="admin">{children}</body>
    </html>
  );
}
