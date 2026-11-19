import Link from 'next/link';
import { CONTACT_EMAIL, SOCIALS } from '@/lib/format';

const NAV = [
  ['/#services', 'What I Do'],
  ['/#work', 'Websites'],
  ['/#google', 'Google Profiles'],
  ['/#reviews', 'Reviews'],
  ['/#blog', 'Blog'],
] as const;

export function Header() {
  return (
    <header>
      <div className="wrap nav">
        <Link className="logo" href="/">THE DIGITAL <span>PM.</span></Link>
        <nav>
          {NAV.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <a className="button" href="/#contact">Let&apos;s Talk</a>
      </div>
    </header>
  );
}

const footHeading = { fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' } as const;
const footList = { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 9 } as const;

export function Footer() {
  return (
    <footer>
      <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 28, alignItems: 'start' }}>
        <div>
          <Link className="logo" style={{ color: 'white' }} href="/">THE DIGITAL <span>PM.</span></Link>
          <br />
          <small style={{ color: '#c3bbb4' }}>Helping good businesses get found.</small>
        </div>
        <div>
          <strong style={footHeading}>Explore</strong>
          <div style={footList}>
            {NAV.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </div>
        </div>
        <div>
          <strong style={footHeading}>Connect</strong>
          <div style={footList}>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href={SOCIALS.instagram} target="_blank" rel="noopener">Instagram</a>
            <a href={SOCIALS.tiktok} target="_blank" rel="noopener">TikTok</a>
            <a href={SOCIALS.linkedin} target="_blank" rel="noopener">LinkedIn</a>
            <a href={SOCIALS.upwork} target="_blank" rel="noopener">Upwork</a>
          </div>
        </div>
      </div>
      <div className="wrap" style={{ borderTop: '1px solid #393331', marginTop: 25, paddingTop: 15 }}>
        <small style={{ color: '#c3bbb4' }}>© {new Date().getFullYear()} The Digital PM. All rights reserved.</small>
      </div>
    </footer>
  );
}
