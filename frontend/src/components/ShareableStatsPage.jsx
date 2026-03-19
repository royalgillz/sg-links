import { useEffect, useState } from 'react'
import ClickChart from './ClickChart'
import ThreeBackground from './ThreeBackground'

function countryFlag(code) {
  if (!code || code.length !== 2) return '🌐'
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
}

function BreakdownBar({ label, count, total }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--c-surface)' }}>
        <div className="bg-violet-500/70 h-full rounded-full" style={{ width: `${(count / total) * 100}%` }} />
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
    <div
      className="relative min-h-screen flex items-start justify-center p-4 pt-12 overflow-hidden"
      style={{ background: 'var(--c-bg)' }}
    >
      <ThreeBackground />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent pointer-events-none" />

      <div className="relative z-20 w-full max-w-lg">
        {/* Back link */}
        <div className="mb-6">
          <a href="/" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            ← Create your own short link
          </a>
        </div>

        <div
          className="border backdrop-blur rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h1 className="font-semibold" style={{ color: 'var(--c-text)' }}>Link Analytics</h1>
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
                  className="text-sm text-violet-400 hover:text-violet-300 break-all transition-colors"
                >
                  {stats.originalUrl}
                </a>
              </div>

              {/* Summary */}
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl px-4 py-3 text-center" style={{ background: 'var(--c-surface)' }}>
                  <p className="text-2xl font-bold font-mono text-violet-300">{stats.totalClicks}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>total clicks</p>
                </div>
                {stats.expiresAt && (
                  <div className="flex-1 rounded-xl px-4 py-3 text-center" style={{ background: 'var(--c-surface)' }}>
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
                        <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--c-surface)' }}>
                          <div className="bg-fuchsia-500/60 h-full rounded-full" style={{ width: `${(e.count / stats.totalClicks) * 100}%` }} />
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
                className="w-full border font-medium py-2.5 rounded-xl text-sm transition-all hover:opacity-80"
                style={{ background: 'var(--c-surface-hover)', borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
              >
                Copy shareable link
              </button>
            </>)}
          </div>
        </div>
      </div>
    </div>
  )
}
