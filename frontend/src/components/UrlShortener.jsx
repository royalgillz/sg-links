import { useState } from 'react'
import ThreeBackground from './ThreeBackground'
import History from './History'
import QrCode from './QrCode'
import ClickChart from './ClickChart'
import BulkShortener from './BulkShortener'

export default function UrlShortener({
  url, setUrl, alias, setAlias, expiryDays, setExpiryDays, password, setPassword,
  result, stats, error, loading, copied, handleSubmit, handleCopy,
  history, onDelete, onRefreshStats, onPreview,
}) {
  const [mode, setMode] = useState('single')

  return (
    <div className="relative min-h-screen bg-gray-950 overflow-hidden flex items-center justify-center p-4">

      {/* 3D background */}
      <ThreeBackground />

      {/* Gradient overlay to blend scene into card area */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent pointer-events-none" />

      {/* Card */}
      <div className="relative z-20 w-full max-w-lg">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300
                           bg-violet-950/60 border border-violet-800/50 rounded-full px-3 py-1 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Instant link shortening
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white tracking-tight mb-3 leading-tight">
            Short links,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              big impact
            </span>
          </h1>
          <p className="text-gray-400 text-sm">
            Paste any URL below and get a clean, shareable short link in seconds.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-4 bg-white/5 border border-white/10 rounded-xl p-1">
          {['single', 'bulk'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
                ${mode === m
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-gray-500 hover:text-gray-300'}`}
            >
              {m === 'single' ? 'Single URL' : 'Bulk'}
            </button>
          ))}
        </div>

        {mode === 'bulk' && <BulkShortener />}

        {/* Single URL form + results */}
        {mode === 'single' && <>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              required
              placeholder="https://your-long-url.com/goes/here"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-500
                         rounded-xl px-4 py-3.5 text-sm backdrop-blur focus:outline-none
                         focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="sm:w-auto w-full bg-gradient-to-r from-violet-600 to-fuchsia-600
                         hover:from-violet-500 hover:to-fuchsia-500
                         disabled:from-violet-800 disabled:to-fuchsia-800 disabled:cursor-not-allowed
                         text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all
                         shadow-lg shadow-violet-900/40"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Shortening…
                </span>
              ) : 'Shorten →'}
            </button>
          </div>

          {/* Custom alias + Expiry */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 shrink-0">{window.location.host}/</span>
            <input
              type="text"
              placeholder="custom-alias  (optional)"
              value={alias}
              onChange={e => setAlias(e.target.value)}
              maxLength={20}
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-600
                         rounded-lg px-3 py-2 text-xs backdrop-blur focus:outline-none
                         focus:border-violet-500/50 transition-all font-mono"
            />
            <select
              value={expiryDays}
              onChange={e => setExpiryDays(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-400 rounded-lg px-2 py-2
                         text-xs backdrop-blur focus:outline-none focus:border-violet-500/50
                         transition-all cursor-pointer"
            >
              <option value="">No expiry</option>
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>

          {/* Optional password */}
          <input
            type="password"
            placeholder="🔒 Password protect  (optional)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                       rounded-lg px-3 py-2 text-xs backdrop-blur focus:outline-none
                       focus:border-violet-500/50 transition-all"
          />
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2 bg-red-950/60 border border-red-800/60
                          backdrop-blur text-red-300 rounded-xl px-4 py-3 text-sm">
            <span className="mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Result card */}
        {result && (
          <div className="mt-4 bg-white/5 border border-white/10 backdrop-blur rounded-2xl
                          overflow-hidden shadow-2xl shadow-black/40">

            {/* Short link row */}
            <div className="p-4 border-b border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your short link</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 font-mono text-violet-300 text-sm truncate">
                  {result.shortUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap
                    ${copied
                      ? 'bg-green-900/60 text-green-300 border border-green-700/50'
                      : 'bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10'}`}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-violet-600/30 hover:bg-violet-600/50 border border-violet-600/40
                             text-violet-300 px-3 py-1.5 rounded-lg transition-all"
                >
                  Open ↗
                </a>
              </div>
              <p className="text-xs text-gray-600 mt-2 truncate">→ {result.originalUrl}</p>
            {result.expiresAt && (
              <p className="text-xs text-amber-600 mt-1">
                ⏱ Expires {new Date(result.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </p>
            )}
            </div>

            {/* QR Code */}
            <QrCode url={result.shortUrl} />

            {/* Analytics panel */}
            {stats && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-widest">Analytics</span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-gray-500">live</span>
                    <span className="text-xs font-mono font-semibold text-violet-300 bg-violet-900/40
                                     border border-violet-800/40 px-2.5 py-0.5 rounded-full">
                      {stats.totalClicks} {stats.totalClicks === 1 ? 'click' : 'clicks'}
                    </span>
                  </div>
                </div>

                <ClickChart clicksByDay={stats.clicksByDay} />

                {/* Browser / OS breakdown */}
                {(stats.browserBreakdown?.length > 0 || stats.osBreakdown?.length > 0) && (
                  <div className="flex gap-4 mt-4 border-t border-white/10 pt-4">
                    {[{ label: 'Browsers', data: stats.browserBreakdown }, { label: 'OS', data: stats.osBreakdown }].map(({ label, data }) => (
                      data?.length > 0 && (
                        <div key={label} className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-1.5">{label}</p>
                          <ul className="space-y-1">
                            {data.map(entry => (
                              <li key={entry.label} className="flex items-center gap-2 text-xs">
                                <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-violet-500/70 h-full rounded-full"
                                    style={{ width: `${(entry.count / stats.totalClicks) * 100}%` }}
                                  />
                                </div>
                                <span className="text-gray-400 shrink-0 w-16 truncate">{entry.label}</span>
                                <span className="text-gray-600 shrink-0">{entry.count}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {stats.recentClicks.length > 0 ? (
                  <ul className="space-y-1.5 max-h-36 overflow-y-auto
                                 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded
                                 [&::-webkit-scrollbar-thumb]:bg-white/10">
                    {stats.recentClicks.map((c, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 shrink-0" />
                        <span className="text-gray-500 shrink-0">
                          {new Date(c.clickedAt).toLocaleTimeString()}
                        </span>
                        <span className="text-gray-400 truncate">
                          {c.referrer && c.referrer.trim()
                            ? (() => { try { return new URL(c.referrer).hostname } catch { return c.referrer } })()
                            : <span className="text-gray-600 italic">direct</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-600 italic">
                    No clicks yet — share your link to see activity here.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        </>}

        {/* History */}
        <History
          history={history}
          onDelete={onDelete}
          onRefreshStats={onRefreshStats}
          onPreview={onPreview}
        />

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 mt-6">
          Built with Spring Boot · Redis · PostgreSQL · React
        </p>

      </div>
    </div>
  )
}
