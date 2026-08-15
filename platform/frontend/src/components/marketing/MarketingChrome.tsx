import Link from 'next/link';

/**
 * Shared nav and footer for every marketing page. Static markup, no hooks,
 * so it renders on the server.
 *
 * The nav is a floating glass pill rather than an edge-to-edge sticky bar —
 * it sits inset from the top with its own hairline ring and backdrop blur,
 * so the canvas reads continuously behind it.
 */

export function MarketingNav() {
  return (
    <nav className="o-nav" aria-label="Main">
      <div className="o-nav-pill">
        <Link href="/" className="o-nav-logo">
          <span className="o-nav-mark" aria-hidden="true" />
          Obsidias
        </Link>
        <div className="o-nav-links">
          <Link href="/features">Features</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
        <Link href="/login" className="o-btn o-btn-ink o-btn-sm">
          Request access
          <span className="o-btn-icon" aria-hidden="true">
            <i className="ti ti-arrow-up-right" />
          </span>
        </Link>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="o-footer">
      <div className="o-wide o-footer-inner">
        <Link href="/" className="o-footer-logo">
          <span className="o-nav-mark" aria-hidden="true" />
          Obsidias
        </Link>
        <div className="o-footer-links">
          <Link href="/features">Features</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/#demo">See it work</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy" title="Non-functional in prototype">Privacy</Link>
          <Link href="/terms" title="Non-functional in prototype">Terms</Link>
        </div>
        <p className="o-mono o-footer-meta">2026 Obsidias Services</p>
      </div>
    </footer>
  );
}
