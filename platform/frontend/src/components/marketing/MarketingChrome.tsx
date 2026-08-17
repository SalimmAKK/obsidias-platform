import Link from 'next/link';

/**
 * Shared chrome for every marketing page: side rails, nav, footer. Static
 * markup, no hooks, so it all renders on the server.
 *
 * The nav is the floating pill carried over from the previous system —
 * inset from the top with its own hairline ring and blur rather than an
 * edge-to-edge sticky bar, so the paper reads continuously behind it. Only
 * its finish changed for Atelier Zero: paper fill instead of glass white,
 * Inter Tight instead of Geist, and the serif mark in the logo circle.
 */

export function MarketingNav() {
  return (
    <nav className="o-nav" aria-label="Main">
      <div className="o-nav-pill">
        <Link href="/" className="o-nav-logo">
          <span className="o-nav-mark" aria-hidden="true">O</span>
          Obsidias
        </Link>
        <div className="o-nav-links">
          <Link href="/features">Features</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
        <Link href="/login" className="o-btn o-btn-primary o-btn-sm">
          Request access
          <span className="o-btn-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 19L19 5M19 5H8M19 5v11" />
            </svg>
          </span>
        </Link>
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="o-footer">
      <div className="o-wide">
        <div className="o-foot-card">
          <div className="o-foot-top">
            <div className="o-foot-brand">
              <Link href="/" className="o-nav-logo">
                <span className="o-nav-mark" aria-hidden="true">O</span>
                Obsidias
              </Link>
              <p>
                AI lead qualification and booking for real estate agencies in
                Saudi Arabia and the Gulf. Every lead answered in under 90
                seconds, scored against budget, authority, need, and timeline
                before an agent opens the thread.
              </p>
            </div>

            <div className="o-foot-grid">
              <div className="o-foot-col">
                <h5>Platform</h5>
                <ul>
                  <li><Link href="/features">Features</Link></li>
                  <li><Link href="/how-it-works">How it works</Link></li>
                  <li><Link href="/pricing">Pricing</Link></li>
                  <li><Link href="/login">Sign in</Link></li>
                </ul>
              </div>
              <div className="o-foot-col">
                <h5>Connects to</h5>
                <ul>
                  <li><a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noreferrer noopener">WhatsApp Cloud API</a></li>
                  <li><a href="https://cal.com" target="_blank" rel="noreferrer noopener">Cal.com</a></li>
                  <li><a href="https://hubspot.com" target="_blank" rel="noreferrer noopener">HubSpot</a></li>
                  <li><a href="https://slack.com" target="_blank" rel="noreferrer noopener">Slack</a></li>
                </ul>
              </div>
              <div className="o-foot-col">
                <h5>Legal</h5>
                <ul>
                  <li><Link href="/privacy" title="Non-functional in prototype">Privacy</Link></li>
                  <li><Link href="/terms" title="Non-functional in prototype">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="o-foot-bottom">
            <span>
              <span className="o-pulse" aria-hidden="true"></span>
              <b>Obsidias</b> · Proprietary · v1.0.0
            </span>
            <span className="right">
              <span>Cloud-hosted</span>
              <span>WhatsApp · Instagram · Email</span>
              <span style={{ color: 'var(--coral-text)' }}>2026</span>
            </span>
          </div>
        </div>

        <div className="o-foot-mega">
          <div className="o-foot-word m-reveal">
            Obsidias<span className="o-dot">.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
