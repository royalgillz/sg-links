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
        <div
          className="bg-[var(--c-accent)] h-full"
          style={{ width: `${(count / total) * 100}%` }}
        />
      </div>
      <span className="shrink-0 w-16 truncate" style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span className="shrink-0" style={{ color: 'var(--c-text-subtle)' }}>{count}</span>
    </li>
  )
}

export default function PreviewModal({ code, onClose }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/urls/${code}/stats`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setStats)
      .catch(() => setError('Could not load link info.'))
      .finally(() => setLoading(false))
  }, [code])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-lg border-2 hard-lg overflow-hidden"
        style={{ background: 'var(--c-modal)', borderColor: 'var(--c-border)' }}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <div>
            <h2 className="font-display font-extrabold text-lg" style={{ color: 'var(--c-text)' }}>link analytics</h2>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{code}</p>
          </div>
          <button
            onClick={onClose}
            className="text-xl transition-colors"
            style={{ color: 'var(--c-text-subtle)' }}
          >✕</button>
        </div>

        <div
          className="p-5 max-h-[80vh] overflow-y-auto space-y-5
                      [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded
                      [&::-webkit-scrollbar-thumb]:bg-white/10"
        >
          {loading && <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>loading...</p>}
          {error   && <p className="text-red-400 text-sm">{error}</p>}

          {stats && (<>
            {/* Destination */}
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--c-text-subtle)' }}>Destination</p>
              <p className="text-sm break-all" style={{ color: 'var(--c-text-muted)' }}>{stats.originalUrl}</p>
            </div>

            {/* Summary row */}
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

            {/* Click-over-time chart */}
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
                        <div
                          className="bg-[var(--c-accent)] h-full"
                          style={{ width: `${(e.count / stats.totalClicks) * 100}%` }}
                        />
                      </div>
                      <span className="shrink-0 w-20 truncate" style={{ color: 'var(--c-text-muted)' }}>
                        {countryFlag(e.label)} {e.label}
                      </span>
                      <span className="shrink-0" style={{ color: 'var(--c-text-subtle)' }}>{e.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recent clicks */}
            {stats.recentClicks?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--c-text-subtle)' }}>Recent clicks</p>
                <ul className="space-y-1.5">
                  {stats.recentClicks.map((c, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs">
                      <span className="w-1.5 h-1.5 bg-[var(--c-accent)] shrink-0" />
                      <span className="shrink-0" style={{ color: 'var(--c-text-muted)' }}>
                        {new Date(c.clickedAt).toLocaleString()}
                      </span>
                      <span className="truncate" style={{ color: 'var(--c-text-muted)' }}>
                        {c.referrer && c.referrer.trim()
                          ? (() => { try { return new URL(c.referrer).hostname } catch { return c.referrer } })()
                          : <span className="italic" style={{ color: 'var(--c-text-subtle)' }}>direct</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {stats.totalClicks === 0 && (
              <p className="text-xs italic" style={{ color: 'var(--c-text-subtle)' }}>No clicks yet, share your link to see activity here.</p>
            )}

            {/* Visit button */}
            <a
              href={stats.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="press flex items-center justify-center gap-2 w-full border-2 py-3 text-sm font-display font-extrabold hard"
              style={{ background: 'var(--c-accent)', color: 'var(--c-accent-on)', borderColor: 'var(--c-border)' }}
            >
              visit link ↗
            </a>
          </>)}
        </div>
      </div>
    </div>
  )
}
