import { useEffect, useState } from 'react'
import ClickChart from './ClickChart'

function countryFlag(code) {
  if (!code || code.length !== 2) return '🌐'
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
}

function BreakdownBar({ label, count, total }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <div className="flex-1 h-1.5 overflow-hidden" style={{ background: 'var(--c-surface)' }}>
        <div className="bg-[var(--c-accent)] h-full" style={{ width: `${(count / total) * 100}%` }} />
      </div>
      <span className="shrink-0 w-16 truncate" style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span className="shrink-0" style={{ color: 'var(--c-text-subtle)' }}>{count}</span>
    </li>
  )
}

export default function ShareableStatsPage() {
  const code = window.location.pathname.replace('/s/', '').split('/')[0]
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/urls/${code}/stats`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setStats)
      .catch(() => setError('Link not found or has been removed.'))
      .finally(() => setLoading(false))
  }, [code])

  return (
    <div className="paper-grid relative min-h-screen flex items-start justify-center p-4 pt-12">
      <div className="w-full max-w-lg">
        {/* back link */}
        <div className="mb-6">
          <a href="/" className="annot text-lg">← make your own short link</a>
        </div>

        <div className="card-ink overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h1 className="font-display font-extrabold text-lg" style={{ color: 'var(--c-text)' }}>link analytics</h1>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{code}</p>
          </div>

          <div className="p-5 space-y-5">
            {loading && <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Loading…</p>}
            {error   && <p className="text-red-400 text-sm">{error}</p>}

            {stats && (<>
              {/* Destination */}
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--c-text-subtle)' }}>Destination</p>
                <a
                  href={stats.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--c-accent-text)] hover:text-[var(--c-accent-text)] break-all transition-colors"
                >
                  {stats.originalUrl}
                </a>
              </div>

              {/* Summary */}
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 text-center border-2" style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
                  <p className="text-2xl font-bold font-mono text-[var(--c-accent-text)]">{stats.totalClicks}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>total clicks</p>
                </div>
                {stats.expiresAt && (
                  <div className="flex-1 px-4 py-3 text-center border-2" style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
                    <p className="text-sm font-semibold text-amber-400">
                      {new Date(stats.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>expires</p>
                  </div>
                )}
              </div>

              <ClickChart clicksByDay={stats.clicksByDay} />

              {/* Browser / OS breakdown */}
              {(stats.browserBreakdown?.length > 0 || stats.osBreakdown?.length > 0) && (
                <div className="flex gap-6">
                  {[{ label: 'Browsers', data: stats.browserBreakdown }, { label: 'OS', data: stats.osBreakdown }].map(({ label, data }) =>
                    data?.length > 0 && (
                      <div key={label} className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--c-text-subtle)' }}>{label}</p>
                        <ul className="space-y-1.5">
                          {data.map(e => (
                            <BreakdownBar key={e.label} label={e.label} count={e.count} total={stats.totalClicks} />
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Country breakdown */}
              {stats.countryBreakdown?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--c-text-subtle)' }}>Countries</p>
                  <ul className="space-y-1.5">
                    {stats.countryBreakdown.map(e => (
                      <li key={e.label} className="flex items-center gap-2 text-xs">
                        <div className="flex-1 h-1.5 overflow-hidden" style={{ background: 'var(--c-surface)' }}>
                          <div className="bg-[var(--c-accent)] h-full" style={{ width: `${(e.count / stats.totalClicks) * 100}%` }} />
                        </div>
                        <span className="shrink-0 w-20 truncate" style={{ color: 'var(--c-text-muted)' }}>{countryFlag(e.label)} {e.label}</span>
                        <span className="shrink-0" style={{ color: 'var(--c-text-subtle)' }}>{e.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {stats.totalClicks === 0 && (
                <p className="text-xs italic" style={{ color: 'var(--c-text-subtle)' }}>No clicks yet.</p>
              )}

              {/* Copy shareable link */}
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="press w-full line-ink font-display font-bold py-2.5 text-sm"
                style={{ color: 'var(--c-text)' }}
              >
                copy shareable link
              </button>
            </>)}
          </div>
        </div>
      </div>
    </div>
  )
}
