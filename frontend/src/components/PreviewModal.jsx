import { useEffect, useState } from 'react'
import ClickChart from './ClickChart'

function countryFlag(code) {
  if (!code || code.length !== 2) return '🌐'
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
}

function BreakdownBar({ label, count, total }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-violet-500/70 h-full rounded-full"
          style={{ width: `${(count / total) * 100}%` }}
        />
      </div>
      <span className="text-gray-400 shrink-0 w-16 truncate">{label}</span>
      <span className="text-gray-600 shrink-0">{count}</span>
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
      <div className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold">Link Analytics</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{code}</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 text-xl transition-colors">✕</button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-5
                        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded
                        [&::-webkit-scrollbar-thumb]:bg-white/10">
          {loading && <p className="text-gray-500 text-sm">Loading…</p>}
          {error   && <p className="text-red-400 text-sm">{error}</p>}

          {stats && (<>
            {/* Destination */}
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Destination</p>
              <p className="text-sm text-gray-300 break-all">{stats.originalUrl}</p>
            </div>

            {/* Summary row */}
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

            {/* Click-over-time chart */}
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
                        <div
                          className="bg-fuchsia-500/60 h-full rounded-full"
                          style={{ width: `${(e.count / stats.totalClicks) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-400 shrink-0 w-20 truncate">
                        {countryFlag(e.label)} {e.label}
                      </span>
                      <span className="text-gray-600 shrink-0">{e.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recent clicks */}
            {stats.recentClicks?.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Recent clicks</p>
                <ul className="space-y-1.5">
                  {stats.recentClicks.map((c, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 shrink-0" />
                      <span className="text-gray-500 shrink-0">
                        {new Date(c.clickedAt).toLocaleString()}
                      </span>
                      <span className="text-gray-400 truncate">
                        {c.referrer && c.referrer.trim()
                          ? (() => { try { return new URL(c.referrer).hostname } catch { return c.referrer } })()
                          : <span className="text-gray-600 italic">direct</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {stats.totalClicks === 0 && (
              <p className="text-xs text-gray-600 italic">No clicks yet — share your link to see activity here.</p>
            )}

            {/* Visit button */}
            <a
              href={stats.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r
                         from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500
                         text-white font-semibold py-3 rounded-xl text-sm transition-all"
            >
              Visit link ↗
            </a>
          </>)}
        </div>
      </div>
    </div>
  )
}
