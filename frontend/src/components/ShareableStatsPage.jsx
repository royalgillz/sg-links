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
      <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div className="bg-violet-500/70 h-full rounded-full" style={{ width: `${(count / total) * 100}%` }} />
      </div>
      <span className="text-gray-400 shrink-0 w-16 truncate">{label}</span>
      <span className="text-gray-600 shrink-0">{count}</span>
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
    <div className="relative min-h-screen bg-gray-950 flex items-start justify-center p-4 pt-12 overflow-hidden">
      <ThreeBackground />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent pointer-events-none" />

      <div className="relative z-20 w-full max-w-lg">
        {/* Back link */}
        <div className="mb-6">
          <a href="/" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            ← Create your own short link
          </a>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10">
            <h1 className="text-white font-semibold">Link Analytics</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{code}</p>
          </div>

          <div className="p-5 space-y-5">
            {loading && <p className="text-gray-500 text-sm">Loading…</p>}
            {error   && <p className="text-red-400 text-sm">{error}</p>}

            {stats && (<>
              {/* Destination */}
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Destination</p>
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
                <div className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold font-mono text-violet-300">{stats.totalClicks}</p>
                  <p className="text-xs text-gray-500 mt-0.5">total clicks</p>
                </div>
                {stats.expiresAt && (
                  <div className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-amber-400">
                      {new Date(stats.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">expires</p>
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
                        <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">{label}</p>
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
                  <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Countries</p>
                  <ul className="space-y-1.5">
                    {stats.countryBreakdown.map(e => (
                      <li key={e.label} className="flex items-center gap-2 text-xs">
                        <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-fuchsia-500/60 h-full rounded-full" style={{ width: `${(e.count / stats.totalClicks) * 100}%` }} />
                        </div>
                        <span className="text-gray-400 shrink-0 w-20 truncate">{countryFlag(e.label)} {e.label}</span>
                        <span className="text-gray-600 shrink-0">{e.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {stats.totalClicks === 0 && (
                <p className="text-xs text-gray-600 italic">No clicks yet.</p>
              )}

              {/* Copy shareable link */}
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300
                           font-medium py-2.5 rounded-xl text-sm transition-all"
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
