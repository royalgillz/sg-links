import { useState } from 'react'
import ThreeBackground from './ThreeBackground'
import History from './History'
import QrCode from './QrCode'
import ClickChart from './ClickChart'
import BulkShortener from './BulkShortener'
import ApiKeys from './ApiKeys'

export default function UrlShortener({
  url, setUrl, alias, setAlias, expiryDays, setExpiryDays, password, setPassword,
  ogTitle, setOgTitle, ogDescription, setOgDescription, ogImage, setOgImage,
  result, stats, error, loading, copied, handleSubmit, handleCopy, handleUrlPaste,
  history, onDelete, onEdit, onRefreshStats, onPreview,
  user, isLoggedIn, onShowAuth, onLogout,
  isDark, toggleTheme,
}) {
  const [mode, setMode] = useState('single')
  const [showOg, setShowOg] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [suggestError, setSuggestError] = useState(null)

  async function handleSuggestSlug() {
    if (!url.trim()) return
    setSuggestLoading(true)
    setSuggestions([])
    setSuggestError(null)
    try {
      const res = await fetch('/api/urls/suggest-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (res.ok) {
        const data = await res.json()
        const slugs = data.suggestions ?? []
        if (slugs.length === 0) {
          setSuggestError('No suggestions (API key not configured)')
        } else {
          setSuggestions(slugs)
        }
      } else {
        setSuggestError('Suggestion failed')
      }
    } catch {
      setSuggestError('Network error')
    } finally {
      setSuggestLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center p-4"
      style={{ background: 'var(--c-bg)' }}
    >

      {/* 3D background */}
      <ThreeBackground />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent pointer-events-none" />

      {/* Card */}
      <div className="relative z-20 w-full max-w-lg">

        {/* Top bar: theme toggle + auth */}
        <div className="flex justify-end items-center gap-2 mb-3">
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1.5"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: 'var(--c-text-subtle)' }}>
                <a href={`/u/${user.username}`} className="text-violet-400 hover:text-violet-300 transition-colors">
                  @{user.username}
                </a>
              </span>
              <button
                onClick={onLogout}
                className="text-xs transition-colors"
                style={{ color: 'var(--c-text-subtle)' }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onShowAuth}
              className="text-xs text-violet-400 hover:text-violet-300 border border-violet-800/50
                         bg-violet-950/30 px-3 py-1.5 rounded-lg transition-all"
            >
              Sign in / Register
            </button>
          )}
        </div>

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
          <h1 className="text-5xl font-bold tracking-tight mb-3 leading-tight" style={{ color: 'var(--c-text)' }}>
            Short links,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              big impact
            </span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Paste any URL below and get a clean, shareable short link in seconds.
          </p>
        </div>

        {/* Mode tabs */}
        <div
          className="flex gap-1 mb-4 border rounded-xl p-1"
          style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {['single', 'bulk'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
                ${mode === m
                  ? 'bg-violet-600 text-white shadow'
                  : 'transition-colors'}`}
              style={mode !== m ? { color: 'var(--c-text-muted)' } : {}}
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
              onPaste={handleUrlPaste}
              className="flex-1 border rounded-xl px-4 py-3.5 text-sm backdrop-blur focus:outline-none
                         focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all"
              style={{
                background: 'var(--c-input)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text)',
              }}
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
            <span className="text-xs shrink-0" style={{ color: 'var(--c-text-subtle)' }}>{window.location.host}/</span>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="custom-alias (optional)"
                value={alias}
                onChange={e => { setAlias(e.target.value); setSuggestions([]); setSuggestError(null) }}
                maxLength={20}
                className="w-full border rounded-lg px-3 py-2 text-xs backdrop-blur focus:outline-none
                           focus:border-violet-500/50 transition-all font-mono"
                style={{
                  background: 'var(--c-input)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
              {/* AI suggestions dropdown */}
              {suggestions.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 border rounded-lg overflow-hidden z-50 shadow-xl"
                  style={{ background: 'var(--c-card)', borderColor: 'var(--c-border)' }}
                >
                  {suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setAlias(s); setSuggestions([]) }}
                      className="w-full text-left px-3 py-2 text-xs font-mono text-violet-300
                                 hover:bg-white/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {suggestError && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50">
                  <p className="text-xs text-red-400/70 px-1 py-1">{suggestError}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSuggestSlug}
              disabled={suggestLoading || !url.trim()}
              title="Suggest AI slugs"
              className="shrink-0 text-xs bg-violet-900/40 hover:bg-violet-900/60 border border-violet-800/40
                         text-violet-400 px-2.5 py-2 rounded-lg transition-all disabled:opacity-40
                         disabled:cursor-not-allowed"
            >
              {suggestLoading ? (
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : '✨'}
            </button>
            <select
              value={expiryDays}
              onChange={e => setExpiryDays(e.target.value)}
              className="border rounded-lg px-2 py-2 text-xs backdrop-blur focus:outline-none
                         focus:border-violet-500/50 transition-all cursor-pointer"
              style={{
                background: 'var(--c-input)',
                borderColor: 'var(--c-border)',
                color: 'var(--c-text-muted)',
              }}
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
            maxLength={72}
            className="w-full border rounded-lg px-3 py-2 text-xs backdrop-blur focus:outline-none
                       focus:border-violet-500/50 transition-all"
            style={{
              background: 'var(--c-input)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text)',
            }}
          />

          {/* OG tag overrides (collapsible) */}
          <button
            type="button"
            onClick={() => setShowOg(v => !v)}
            className="text-xs transition-colors w-full text-left"
            style={{ color: 'var(--c-text-subtle)' }}
          >
            {showOg ? '▾' : '▸'} Social preview overrides (optional)
          </button>
          {showOg && (
            <div
              className="space-y-1.5 pl-2 border-l"
              style={{ borderColor: 'var(--c-border)' }}
            >
              <input
                type="text"
                placeholder="OG Title (e.g. Check out this article)"
                value={ogTitle}
                onChange={e => setOgTitle(e.target.value)}
                maxLength={200}
                className="w-full border rounded-lg px-3 py-2 text-xs backdrop-blur focus:outline-none
                           focus:border-violet-500/50 transition-all"
                style={{
                  background: 'var(--c-input)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
              <input
                type="text"
                placeholder="OG Description (shown in link previews)"
                value={ogDescription}
                onChange={e => setOgDescription(e.target.value)}
                maxLength={500}
                className="w-full border rounded-lg px-3 py-2 text-xs backdrop-blur focus:outline-none
                           focus:border-violet-500/50 transition-all"
                style={{
                  background: 'var(--c-input)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
              <input
                type="url"
                placeholder="OG Image URL (preview thumbnail)"
                value={ogImage}
                onChange={e => setOgImage(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs backdrop-blur focus:outline-none
                           focus:border-violet-500/50 transition-all"
                style={{
                  background: 'var(--c-input)',
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text)',
                }}
              />
            </div>
          )}
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
          <div
            className="mt-4 border backdrop-blur rounded-2xl overflow-hidden shadow-2xl shadow-black/40"
            style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
          >

            {/* Short link row */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--c-text-subtle)' }}>Your short link</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 font-mono text-violet-300 text-sm truncate">
                  {result.shortUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap border
                    ${copied
                      ? 'bg-green-900/60 text-green-300 border-green-700/50'
                      : 'hover:bg-white/15 text-gray-300'}`}
                  style={!copied ? { background: 'var(--c-surface-hover)', borderColor: 'var(--c-border)' } : {}}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
                <a
                  href={result.shortUrl + '+'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs border px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
                  title="Shareable analytics"
                >
                  Stats ↗
                </a>
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
              <p className="text-xs mt-2 truncate" style={{ color: 'var(--c-text-subtle)' }}>→ {result.originalUrl}</p>
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
                  <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--c-text-subtle)' }}>Analytics</span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs" style={{ color: 'var(--c-text-subtle)' }}>live</span>
                    <span className="text-xs font-mono font-semibold text-violet-300 bg-violet-900/40
                                     border border-violet-800/40 px-2.5 py-0.5 rounded-full">
                      {stats.totalClicks} {stats.totalClicks === 1 ? 'click' : 'clicks'}
                    </span>
                  </div>
                </div>

                <ClickChart clicksByDay={stats.clicksByDay} />

                {/* Browser / OS breakdown */}
                {(stats.browserBreakdown?.length > 0 || stats.osBreakdown?.length > 0) && (
                  <div className="flex gap-4 mt-4 border-t pt-4" style={{ borderColor: 'var(--c-border)' }}>
                    {[{ label: 'Browsers', data: stats.browserBreakdown }, { label: 'OS', data: stats.osBreakdown }].map(({ label, data }) => (
                      data?.length > 0 && (
                        <div key={label} className="flex-1 min-w-0">
                          <p className="text-xs mb-1.5" style={{ color: 'var(--c-text-subtle)' }}>{label}</p>
                          <ul className="space-y-1">
                            {data.map(entry => (
                              <li key={entry.label} className="flex items-center gap-2 text-xs">
                                <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--c-surface)' }}>
                                  <div
                                    className="bg-violet-500/70 h-full rounded-full"
                                    style={{ width: `${(entry.count / stats.totalClicks) * 100}%` }}
                                  />
                                </div>
                                <span className="shrink-0 w-16 truncate" style={{ color: 'var(--c-text-muted)' }}>{entry.label}</span>
                                <span className="shrink-0" style={{ color: 'var(--c-text-subtle)' }}>{entry.count}</span>
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
                        <span className="shrink-0" style={{ color: 'var(--c-text-subtle)' }}>
                          {new Date(c.clickedAt).toLocaleTimeString()}
                        </span>
                        <span className="truncate" style={{ color: 'var(--c-text-muted)' }}>
                          {c.referrer && c.referrer.trim()
                            ? (() => { try { return new URL(c.referrer).hostname } catch { return c.referrer } })()
                            : <span className="italic" style={{ color: 'var(--c-text-subtle)' }}>direct</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs italic" style={{ color: 'var(--c-text-subtle)' }}>
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
          onEdit={onEdit}
          onRefreshStats={onRefreshStats}
          onPreview={onPreview}
        />

        {/* API Keys */}
        <ApiKeys />

        {/* GSD Bookmarklet */}
        <div
          className="mt-6 border rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <span className="text-xs shrink-0" style={{ color: 'var(--c-text-subtle)' }}>⚡ GSD:</span>
          <a
            href={`javascript:(function(){window.open('${window.location.origin}/?url='+encodeURIComponent(location.href),'_blank','noopener')})()`}
            onClick={e => { e.preventDefault(); alert('Drag this link to your bookmarks bar — then click it on any page to instantly shorten the URL.') }}
            className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 cursor-grab transition-colors"
            title="Drag to bookmarks bar"
          >
            Shorten this page ↗
          </a>
          <span className="text-xs" style={{ color: 'var(--c-text-subtle)' }}>← drag to bookmarks bar</span>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-4" style={{ color: 'var(--c-text-subtle)' }}>
          Built with Spring Boot · Redis · PostgreSQL · React
        </p>

      </div>
    </div>
  )
}
