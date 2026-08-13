import Link from 'next/link';

// Shared nav and footer across every marketing page (landing, features,
// how-it-works). Kept in one place so adding a page means updating links
// here once, not in three separate files. No "use client" needed — this is
// static markup with no hooks, so it can render on the server.

export function MarketingNav() {
  return (
    <nav className="l-nav">
      <Link href="/" className="l-nav-logo">OBSIDIAS</Link>
      <div className="l-nav-links">
        <Link href="/features">Features</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/#pricing">Pricing</Link>
        <Link href="/login" className="l-nav-cta">Request access</Link>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="l-footer">
      <Link href="/" className="l-footer-logo">OBSIDIAS</Link>
      <div className="l-footer-links">
        <Link href="/features">Features</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/#demo">See it work</Link>
        <Link href="/#channels">Channels</Link>
        <Link href="/#pricing">Pricing</Link>
        <Link href="/privacy" title="Non-functional in prototype">Privacy</Link>
        <Link href="/terms" title="Non-functional in prototype">Terms</Link>
      </div>
      <small>2026 Obsidias Services</small>
    </footer>
  );
}
