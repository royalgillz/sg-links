import { useState } from 'react'

export default function BulkShortener() {
  const [text, setText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedUrl, setCopiedUrl] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const urls = text.split('\n').map(u => u.trim()).filter(Boolean)
    if (urls.length === 0) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const res = await fetch('/api/urls/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
      } else {
        setResults(data)
      }
    } catch {
      setError('Network error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(shortUrl) {
    await navigator.clipboard.writeText(shortUrl)
    setCopiedUrl(shortUrl)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  function handleCopyAll() {
    const all = results.filter(r => r.shortUrl).map(r => r.shortUrl).join('\n')
    navigator.clipboard.writeText(all)
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          rows={5}
          placeholder={"Paste one URL per line:\nhttps://example.com/long-url-one\nhttps://example.com/long-url-two"}
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full line-ink px-4 py-3 text-sm font-mono focus:outline-none resize-none
                     focus:border-[var(--c-accent)] focus:ring-1 focus:ring-[var(--c-accent)] transition-all"
          style={{ background: 'var(--c-input)', color: 'var(--c-text)' }}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="press w-full border-2 px-6 py-3 text-sm font-display font-extrabold hard disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--c-accent)', color: 'var(--c-accent-on)', borderColor: 'var(--c-border)' }}
        >
          {loading ? 'shortening...' : `shorten ${text.split('\n').filter(l => l.trim()).length || ''} URLs →`}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-2 bg-red-950/60 border border-red-800/60
                         text-red-300 px-4 py-3 text-sm">
          <span className="mt-0.5">⚠</span><span>{error}</span>
        </div>
      )}

      {results && (
        <div className="card-ink overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b-2" style={{ borderColor: 'var(--c-border)' }}>
            <span className="text-xs uppercase tracking-widest font-mono" style={{ color: 'var(--c-text-muted)' }}>
              {results.filter(r => r.shortUrl).length} / {results.length} shortened
            </span>
            <button
              onClick={handleCopyAll}
              className="press line-ink text-xs px-2.5 py-1 font-mono"
              style={{ color: 'var(--c-text-muted)' }}
            >
              copy all
            </button>
          </div>
          <ul className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: 'var(--c-border)' }}>
            {results.map((item, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-2.5" style={{ borderColor: 'var(--c-border)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: 'var(--c-text-subtle)' }}>{item.originalUrl}</p>
                  {item.shortUrl
                    ? <p className="text-sm font-mono text-[var(--c-accent-text)] truncate">{item.shortUrl}</p>
                    : <p className="text-xs text-red-400">{item.error}</p>
                  }
                </div>
                {item.shortUrl && (
                  <button
                    onClick={() => handleCopy(item.shortUrl)}
                    className="shrink-0 text-xs px-2.5 py-1.5 transition-colors"
                    style={{ background: 'var(--c-surface-hover)', color: 'var(--c-text-muted)' }}
                  >
                    {copiedUrl === item.shortUrl ? '✓' : 'Copy'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
