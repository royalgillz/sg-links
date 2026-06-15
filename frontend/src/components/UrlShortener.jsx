import { useState } from 'react'
import Rough from './Rough'
import HeroDemo from './HeroDemo'
import HeroStats from './HeroStats'
import History from './History'
import QrCode from './QrCode'
import ClickChart from './ClickChart'
import BulkShortener from './BulkShortener'
import ApiKeys from './ApiKeys'
import { useTheme } from '../hooks/useTheme'

export default function UrlShortener({
  url, setUrl, alias, setAlias, expiryDays, setExpiryDays, password, setPassword,
  ogTitle, setOgTitle, ogDescription, setOgDescription, ogImage, setOgImage,
  result, stats, error, loading, copied, handleSubmit, handleCopy, handleUrlPaste,
  history, onDelete, onEdit, onRefreshStats, onPreview,
  user, isLoggedIn, onShowAuth, onLogout,
}) {
  const [mode, setMode] = useState('single')
  const [showOpts, setShowOpts] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [suggestError, setSuggestError] = useState(null)
  const { isDark, toggleTheme } = useTheme()

  async function handleSuggestSlug() {
    if (!url.trim()) { setSuggestError('paste a URL above first'); return }
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
        if (slugs.length === 0) setSuggestError('no suggestions (api key not set)')
        else setSuggestions(slugs)
      } else {
        setSuggestError('suggestion failed')
      }
    } catch {
      setSuggestError('network error')
    } finally {
      setSuggestLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--c-input)',
    color: 'var(--c-text)',
  }

  return (
    <div className="paper-grid">

      {/* nav */}
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-5 py-5">
        <span
          className="font-mono font-bold text-xl px-3 py-1 line-ink"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          sg<span style={{ color: 'var(--c-accent-text)' }}>/</span>links
        </span>
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={toggleTheme}
            title={isDark ? 'switch to notebook (light)' : 'switch to blueprint (dark)'}
            className="line-ink press w-9 h-9 flex items-center justify-center"
          >
            {isDark ? '☼' : '☾'}
          </button>
          {isLoggedIn ? (
            <>
              <a href={`/u/${user.username}`} className="font-mono hover:underline" style={{ color: 'var(--c-accent-text)' }}>
                @{user.username}
              </a>
              <button onClick={onLogout} style={{ color: 'var(--c-text-subtle)' }} className="hover:underline">
                sign out
              </button>
            </>
          ) : (
            <button
              onClick={onShowAuth}
              className="press line-ink px-4 py-1.5 font-display font-extrabold"
              style={{ background: 'var(--c-accent)', color: 'var(--c-accent-on)' }}
            >
              sign in
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5">

        {/* hero: two columns, form on the left, live demo on the right */}
        <section className="grid md:grid-cols-2 gap-10 items-start pt-8 pb-8">
          <div className="text-left">
          <span className="annot text-2xl inline-block mb-2" style={{ transform: 'rotate(-2deg)' }}>
            free, open source, no sign-up ✦
          </span>
          <h1 className="font-display font-extrabold leading-[0.98] mb-4"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', color: 'var(--c-text)' }}>
            Short <span className="highlight">links</span>,{' '}
            <span className="relative inline-block">
              drawn by hand
              <span className="draw-underline absolute left-0 right-0 block" style={{ bottom: '-0.55rem', height: '1.4rem' }}>
                <Rough shape="underline" stroke="var(--c-accent)" strokeWidth={5} roughness={1.4} bowing={2} />
              </span>
            </span>
            <span style={{ color: 'var(--c-accent-text)' }}>.</span>
          </h1>
          <p className="copy text-[15px] leading-relaxed mb-8 max-w-md" style={{ color: 'var(--c-text-muted)' }}>
            Paste a long URL, get a clean short one, with QR codes, password locks, expiry,
            AI slug ideas, and live click analytics.
          </p>

          {/* mode tabs */}
          <div className="flex justify-start gap-2 mb-4">
            {['single', 'bulk'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="press px-4 py-1.5 text-sm font-mono line-ink"
                style={mode === m
                  ? { background: 'var(--c-accent)', color: 'var(--c-accent-on)' }
                  : {}}
              >
                {m === 'single' ? 'single' : 'bulk'}
              </button>
            ))}
          </div>

          {mode === 'bulk' && <div className="text-left"><BulkShortener /></div>}

          {mode === 'single' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* url + shorten: the centerpiece */}
              <div className="relative">
                <span className="annot absolute text-xl z-20" style={{ top: '-1.5rem', right: '1.5rem', transform: 'rotate(4deg)' }}>
                  paste here ↓
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 rough-host">
                    <Rough stroke="var(--c-border)" strokeWidth={2.6} roughness={1.5} />
                    <input
                      type="url"
                      required
                      placeholder="https://your-long-url.com/goes/here"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      onPaste={handleUrlPaste}
                      className="relative z-10 w-full bg-transparent px-5 py-4 text-base font-mono focus:outline-none text-left"
                      style={{ color: 'var(--c-text)' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="press relative sm:w-auto w-full px-7 py-4 font-display font-extrabold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'var(--c-accent)', color: 'var(--c-accent-on)' }}
                  >
                    <Rough stroke="var(--c-border)" strokeWidth={2.6} roughness={1.5} seed={7} hover />
                    <span className="relative z-10">{loading ? 'shortening...' : 'shorten ↵'}</span>
                  </button>
                </div>
              </div>

              {/* options toggle: handwritten, with a clear "click" cue + arrow */}
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setShowOpts(v => !v)}
                  className="annot text-xl underline underline-offset-4 decoration-2 hover:opacity-75 transition-opacity"
                  style={{ transform: 'rotate(-1deg)' }}
                >
                  {showOpts
                    ? '✕ hide these options'
                    : '✎ click here for a custom alias, ✦ AI slug, expiry & password →'}
                </button>
              </div>

              {showOpts && (
                <div className="space-y-2.5 pl-3 border-l-2 text-left" style={{ borderColor: 'var(--c-border)' }}>
                    {/* alias + ai + expiry */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs shrink-0 font-mono" style={{ color: 'var(--c-text-subtle)' }}>
                        {window.location.host}/
                      </span>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="custom-alias"
                          value={alias}
                          onChange={e => { setAlias(e.target.value); setSuggestions([]); setSuggestError(null) }}
                          maxLength={20}
                          className="w-full card-ink px-3 py-2 text-xs font-mono focus:outline-none"
                          style={inputStyle}
                        />
                        {suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 card-ink z-50 overflow-hidden">
                            {suggestions.map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => { setAlias(s); setSuggestions([]) }}
                                className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-[var(--c-surface-hover)]"
                                style={{ color: 'var(--c-accent-text)' }}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleSuggestSlug}
                        disabled={suggestLoading}
                        title={url.trim() ? 'suggest AI slugs' : 'paste a URL first'}
                        className="press card-ink shrink-0 text-xs px-2.5 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: 'var(--c-accent-text)' }}
                      >
                        {suggestLoading ? '...' : '✦ ai'}
                      </button>
                      <select
                        value={expiryDays}
                        onChange={e => setExpiryDays(e.target.value)}
                        className="card-ink px-2 py-2 text-xs font-mono cursor-pointer focus:outline-none"
                        style={{ background: 'var(--c-input)', color: 'var(--c-text-muted)' }}
                      >
                        <option value="">no expiry</option>
                        <option value="1">1 day</option>
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="365">1 year</option>
                      </select>
                    </div>
                    {suggestError && (
                      <p className="text-xs" style={{ color: 'var(--c-accent-text)' }}>{suggestError}</p>
                    )}

                    <input
                      type="password"
                      placeholder="password protect (optional)"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      maxLength={72}
                      className="w-full card-ink px-3 py-2 text-xs font-mono focus:outline-none"
                      style={inputStyle}
                    />

                    <div className="space-y-2">
                      <input type="text" placeholder="OG title" value={ogTitle}
                        onChange={e => setOgTitle(e.target.value)} maxLength={200}
                        className="w-full card-ink px-3 py-2 text-xs font-mono focus:outline-none" style={inputStyle} />
                      <input type="text" placeholder="OG description" value={ogDescription}
                        onChange={e => setOgDescription(e.target.value)} maxLength={500}
                        className="w-full card-ink px-3 py-2 text-xs font-mono focus:outline-none" style={inputStyle} />
                      <input type="url" placeholder="OG image url" value={ogImage}
                        onChange={e => setOgImage(e.target.value)}
                        className="w-full card-ink px-3 py-2 text-xs font-mono focus:outline-none" style={inputStyle} />
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* right column: live preview - demo + stats */}
          <div className="space-y-5">
            <HeroDemo />
            <HeroStats />
            <p className="annot text-xl" style={{ transform: 'rotate(-1.5deg)' }}>
              ↑ a real, working short link
            </p>
          </div>
        </section>

        {/* error */}
        {error && (
          <div className="card-ink px-4 py-3 text-sm flex items-start gap-2 mb-6"
               style={{ color: 'var(--c-accent-text)' }}>
            <span>!</span><span>{error}</span>
          </div>
        )}

        {/* result */}
        {result && (
          <div className="relative rough-host mb-10">
            <Rough stroke="var(--c-border)" strokeWidth={2.6} roughness={1.5} seed={3} />
            <div className="relative z-10">
              <div className="p-4 border-b-2" style={{ borderColor: 'var(--c-border)' }}>
                <p className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--c-text-subtle)' }}>your short link</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex-1 min-w-0 font-mono text-sm truncate" style={{ color: 'var(--c-accent-text)' }}>
                    {result.shortUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="press card-ink text-xs px-3 py-1.5 font-mono whitespace-nowrap"
                    style={copied ? { background: 'var(--c-accent-2)', color: '#1a1a24' } : {}}
                  >
                    {copied ? '✓ copied' : 'copy'}
                  </button>
                  <a href={result.shortUrl + '+'} target="_blank" rel="noopener noreferrer"
                     className="press card-ink text-xs px-3 py-1.5 font-mono" style={{ color: 'var(--c-text-muted)' }} title="shareable analytics">
                    stats ↗
                  </a>
                  <a href={result.shortUrl} target="_blank" rel="noopener noreferrer"
                     className="press card-ink text-xs px-3 py-1.5 font-mono"
                     style={{ background: 'var(--c-accent)', color: 'var(--c-accent-on)' }}>
                    open ↗
                  </a>
                </div>
                <p className="text-xs mt-2 truncate font-mono" style={{ color: 'var(--c-text-subtle)' }}>→ {result.originalUrl}</p>
                {result.expiresAt && (
                  <p className="text-xs mt-1 font-mono" style={{ color: 'var(--c-accent-2-text)' }}>
                    expires {new Date(result.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                )}
              </div>

              <QrCode url={result.shortUrl} />

              {stats && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-widest font-mono" style={{ color: 'var(--c-text-subtle)' }}>analytics</span>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--c-accent)' }} />
                      <span className="text-xs font-mono" style={{ color: 'var(--c-text-subtle)' }}>live</span>
                      <span className="text-xs font-mono font-bold card-ink px-2.5 py-0.5" style={{ color: 'var(--c-accent-text)' }}>
                        {stats.totalClicks} {stats.totalClicks === 1 ? 'click' : 'clicks'}
                      </span>
                    </div>
                  </div>

                  <ClickChart clicksByDay={stats.clicksByDay} />

                  {(stats.browserBreakdown?.length > 0 || stats.osBreakdown?.length > 0) && (
                    <div className="flex gap-4 mt-4 border-t-2 pt-4" style={{ borderColor: 'var(--c-border)' }}>
                      {[{ label: 'browsers', data: stats.browserBreakdown }, { label: 'os', data: stats.osBreakdown }].map(({ label, data }) => (
                        data?.length > 0 && (
                          <div key={label} className="flex-1 min-w-0">
                            <p className="text-xs mb-1.5 font-mono" style={{ color: 'var(--c-text-subtle)' }}>{label}</p>
                            <ul className="space-y-1">
                              {data.map(entry => (
                                <li key={entry.label} className="flex items-center gap-2 text-xs">
                                  <div className="flex-1 h-1.5 overflow-hidden" style={{ background: 'var(--c-surface-hover)' }}>
                                    <div className="h-full" style={{ width: `${(entry.count / stats.totalClicks) * 100}%`, background: 'var(--c-accent)' }} />
                                  </div>
                                  <span className="shrink-0 w-16 truncate font-mono" style={{ color: 'var(--c-text-muted)' }}>{entry.label}</span>
                                  <span className="shrink-0 font-mono" style={{ color: 'var(--c-text-subtle)' }}>{entry.count}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {stats.recentClicks.length > 0 ? (
                    <ul className="space-y-1.5 max-h-36 overflow-y-auto scroll-thin mt-3">
                      {stats.recentClicks.map((c, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-mono">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--c-accent)' }} />
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
                    <p className="text-xs italic mt-3 font-mono" style={{ color: 'var(--c-text-subtle)' }}>
                      no clicks yet, share your link to see activity here.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* history */}
        <History history={history} onDelete={onDelete} onEdit={onEdit} onRefreshStats={onRefreshStats} onPreview={onPreview} />

        {/* api keys are an account feature, so only surface them when signed in */}
        {isLoggedIn && <ApiKeys />}
      </main>
    </div>
  )
}
