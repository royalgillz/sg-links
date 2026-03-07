import { useEffect, useState } from 'react'
import ClickChart from './ClickChart'

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
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold">Link Preview</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{code}</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 text-xl transition-colors">✕</button>
        </div>

        <div className="p-5">
          {loading && <p className="text-gray-500 text-sm">Loading…</p>}
          {error  && <p className="text-red-400 text-sm">{error}</p>}

          {stats && (
            <div className="space-y-4">
              {/* Destination */}
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Destination</p>
                <p className="text-sm text-gray-300 break-all">{stats.originalUrl}</p>
              </div>

              {/* Stats row */}
              <div className="flex gap-4">
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

              {/* Chart */}
              <ClickChart clicksByDay={stats.clicksByDay} />

              {/* Go button */}
              <a
                href={stats.shortUrl}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r
                           from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500
                           text-white font-semibold py-3 rounded-xl text-sm transition-all"
              >
                Visit link ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
