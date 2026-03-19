import { useState, useEffect } from 'react'

const FEATURES = [
  { icon: '⚡', title: 'Instant shortening', desc: 'Base62 codes, Bloom filter for speed' },
  { icon: '📊', title: 'Deep analytics', desc: 'Clicks, referrers, browsers, OS, countries' },
  { icon: '🤖', title: 'AI slug suggestions', desc: 'GPT-4o-mini suggests memorable slugs' },
  { icon: '🔒', title: 'Password protection', desc: 'BCrypt-hashed gate on any link' },
  { icon: '⏱️', title: 'Link expiry', desc: 'Set TTL from 1 day to 1 year' },
  { icon: '📱', title: 'QR codes', desc: 'PNG and SVG download' },
  { icon: '🔗', title: 'Link-in-bio', desc: 'Public page at /u/username' },
  { icon: '👤', title: 'User accounts', desc: 'JWT auth, links tied to your account' },
  { icon: '🌐', title: 'Browser extension', desc: 'Chrome extension for one-click shortening' },
  { icon: '📦', title: 'Bulk shorten', desc: 'Up to 20 URLs at once' },
  { icon: '🔑', title: 'API access', desc: 'Full REST API with key auth' },
  { icon: '📈', title: 'Shareable stats', desc: 'Public analytics page at /{code}+' },
]

const FAQ_ITEMS = [
  { q: 'Is it free?', a: 'Yes, completely free and open source.' },
  { q: 'Do I need an account?', a: 'No, anonymous shortening works. Create an account to manage your links.' },
  { q: 'How long do links last?', a: 'Forever by default. You can set an expiry from 1 day to 1 year.' },
  { q: 'Can I use a custom alias?', a: 'Yes, type it in the alias field. AI suggestions are available via the ✨ button.' },
  { q: 'Is there an API?', a: 'Yes, full REST API documented at /swagger-ui.html. Generate API keys in the app.' },
  {
    q: 'Is the source code available?',
    a: (
      <>
        Yes,{' '}
        <a
          href="https://github.com/royalgillz/url-shortener"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
        >
          view on GitHub
        </a>
        .
      </>
    ),
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border rounded-xl overflow-hidden transition-all"
      style={{ borderColor: 'var(--c-border)' }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{ background: open ? 'var(--c-surface-hover)' : 'var(--c-surface)' }}
      >
        <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{q}</span>
        <span
          className="text-lg transition-transform duration-200 shrink-0 ml-3"
          style={{
            color: 'var(--c-text-muted)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1" style={{ background: 'var(--c-surface)' }}>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function LandingContent({ isDark }) {
  const [globalStats, setGlobalStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setGlobalStats)
      .catch(() => setGlobalStats(null))
      .finally(() => setStatsLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--c-bg)' }}>

      {/* Section 1: How It Works */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--c-text)' }}>
          How it works
        </h2>
        <p className="text-center text-sm mb-12" style={{ color: 'var(--c-text-muted)' }}>
          Three simple steps to your perfect short link.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Step 1 */}
          <div className="flex-1 flex flex-col items-center text-center p-6 rounded-2xl border" style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600
                            flex items-center justify-center text-white font-bold text-lg mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Paste your URL</h3>
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
              Drop any long URL into the input field and hit Shorten.
            </p>
          </div>

          <div className="text-2xl font-light hidden sm:block" style={{ color: 'var(--c-text-subtle)' }}>→</div>
          <div className="text-2xl font-light sm:hidden" style={{ color: 'var(--c-text-subtle)' }}>↓</div>

          {/* Step 2 */}
          <div className="flex-1 flex flex-col items-center text-center p-6 rounded-2xl border" style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600
                            flex items-center justify-center text-white font-bold text-lg mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Customize</h3>
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
              Set a custom alias, expiry date, password, or use AI slug suggestions.
            </p>
          </div>

          <div className="text-2xl font-light hidden sm:block" style={{ color: 'var(--c-text-subtle)' }}>→</div>
          <div className="text-2xl font-light sm:hidden" style={{ color: 'var(--c-text-subtle)' }}>↓</div>

          {/* Step 3 */}
          <div className="flex-1 flex flex-col items-center text-center p-6 rounded-2xl border" style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600
                            flex items-center justify-center text-white font-bold text-lg mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Share & track</h3>
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
              Share your short link and watch clicks roll in with real-time analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="h-px" style={{ background: 'var(--c-border)' }} />
      </div>

      {/* Section 2: Features Grid */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--c-text)' }}>
          Everything you need
        </h2>
        <p className="text-center text-sm mb-12" style={{ color: 'var(--c-text-muted)' }}>
          A full-featured link management platform, completely free.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="flex flex-col gap-2 p-4 rounded-xl border transition-all hover:border-violet-500/30"
              style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{f.title}</span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="h-px" style={{ background: 'var(--c-border)' }} />
      </div>

      {/* Section 3: Live Stats */}
      {(statsLoading || globalStats) && (
        <>
          <section className="max-w-3xl mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--c-text)' }}>
              By the numbers
            </h2>
            <p className="text-center text-sm mb-12" style={{ color: 'var(--c-text-muted)' }}>
              Real-time stats from this instance.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {/* Total links */}
              <div
                className="flex flex-col items-center justify-center p-6 rounded-2xl border"
                style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
              >
                {statsLoading ? (
                  <div className="w-16 h-8 rounded animate-pulse mb-2" style={{ background: 'var(--c-surface-hover)' }} />
                ) : (
                  <span className="text-3xl font-bold font-mono text-violet-300 mb-1">
                    {globalStats.totalUrls.toLocaleString()}
                  </span>
                )}
                <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>links shortened</span>
              </div>

              {/* Total clicks */}
              <div
                className="flex flex-col items-center justify-center p-6 rounded-2xl border"
                style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
              >
                {statsLoading ? (
                  <div className="w-16 h-8 rounded animate-pulse mb-2" style={{ background: 'var(--c-surface-hover)' }} />
                ) : (
                  <span className="text-3xl font-bold font-mono text-fuchsia-300 mb-1">
                    {globalStats.totalClicks.toLocaleString()}
                  </span>
                )}
                <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>clicks tracked</span>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="max-w-3xl mx-auto px-4">
            <div className="h-px" style={{ background: 'var(--c-border)' }} />
          </div>
        </>
      )}

      {/* Section 4: FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--c-text)' }}>
          Frequently asked questions
        </h2>
        <p className="text-center text-sm mb-12" style={{ color: 'var(--c-text-muted)' }}>
          Quick answers to common questions.
        </p>

        <div className="space-y-2 max-w-2xl mx-auto">
          {FAQ_ITEMS.map(item => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* Section 5: Footer */}
      <footer
        className="border-t"
        style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>URL Shortener</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
              Open source · Built with Spring Boot &amp; React
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--c-text-muted)' }}>
            <a
              href="https://github.com/royalgillz/url-shortener"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-400 transition-colors"
            >
              GitHub
            </a>
            <span style={{ color: 'var(--c-border)' }}>·</span>
            <a
              href="/swagger-ui.html"
              className="hover:text-violet-400 transition-colors"
            >
              API Docs
            </a>
            <span style={{ color: 'var(--c-border)' }}>·</span>
            <a
              href="#"
              className="hover:text-violet-400 transition-colors"
            >
              Browser Extension
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
