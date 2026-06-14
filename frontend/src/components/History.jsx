import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

function inkColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--c-text').trim() || '#111111'
}

function HistoryQr({ shortUrl }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const draw = () => QRCode.toCanvas(canvasRef.current, shortUrl, {
      width: 120, margin: 1, color: { dark: inkColor(), light: '#00000000' },
    })
    draw()
    window.addEventListener('themechange', draw)
    return () => window.removeEventListener('themechange', draw)
  }, [shortUrl])

  function handleDownloadPng() {
    QRCode.toDataURL(shortUrl, { width: 512, margin: 1, color: { dark: '#111111', light: '#ffffff' } })
      .then(dataUrl => {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `qr-${shortUrl.split('/').pop()}.png`
        a.click()
      })
  }

  function handleDownloadSvg() {
    QRCode.toString(shortUrl, { type: 'svg', width: 512, margin: 1, color: { dark: '#111111', light: '#ffffff' } })
      .then(svgString => {
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `qr-${shortUrl.split('/').pop()}.svg`
        a.click()
        URL.revokeObjectURL(a.href)
      })
  }

  return (
    <div className="flex items-center gap-3 mt-2 pt-2 border-t-2" style={{ borderColor: 'var(--c-border)' }}>
      <canvas ref={canvasRef} />
      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleDownloadPng}
          className="press line-ink text-xs px-2.5 py-1.5 font-mono"
          style={{ color: 'var(--c-text-muted)' }}
        >
          download png
        </button>
        <button
          onClick={handleDownloadSvg}
          className="press line-ink text-xs px-2.5 py-1.5 font-mono"
          style={{ color: 'var(--c-text-muted)' }}
        >
          download svg
        </button>
      </div>
    </div>
  )
}

export default function History({ history, onDelete, onEdit, onRefreshStats, onPreview }) {
  const [copiedCode, setCopiedCode] = useState(null)
  const [expandedQr, setExpandedQr] = useState(null)
  const [editingCode, setEditingCode] = useState(null)
  const [editUrl, setEditUrl] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    history.forEach(h => onRefreshStats(h.shortCode))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCopy(shortUrl, shortCode) {
    await navigator.clipboard.writeText(shortUrl)
    setCopiedCode(shortCode)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  function toggleQr(shortCode) {
    setExpandedQr(prev => prev === shortCode ? null : shortCode)
  }

  function startEdit(entry) {
    setEditingCode(entry.shortCode)
    setEditUrl(entry.originalUrl)
    setExpandedQr(null)
  }

  async function saveEdit(shortCode) {
    if (!editUrl.trim()) return
    setEditSaving(true)
    await onEdit(shortCode, editUrl.trim())
    setEditSaving(false)
    setEditingCode(null)
  }

  if (history.length === 0) return null

  const sorted = [...history].sort((a, b) =>
    (b.stats?.totalClicks ?? 0) - (a.stats?.totalClicks ?? 0)
  )

  function handleExportCsv() {
    const rows = [
      ['Short URL', 'Original URL', 'Clicks', 'Expires At', 'Password Protected', 'Saved At'],
      ...sorted.map(e => [
        e.shortUrl,
        e.originalUrl,
        e.stats?.totalClicks ?? 0,
        e.expiresAt ?? '',
        e.passwordProtected ? 'Yes' : 'No',
        e.savedAt,
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'links.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>
          link history
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="press line-ink text-xs px-2.5 py-1 font-mono"
            style={{ color: 'var(--c-text-muted)' }}
          >
            export csv
          </button>
          <span className="text-xs font-mono" style={{ color: 'var(--c-text-subtle)' }}>{history.length} link{history.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map(entry => {
          const expired = entry.expiresAt && new Date(entry.expiresAt) < new Date()
          const clicks = entry.stats?.totalClicks ?? '-'
          const qrOpen = expandedQr === entry.shortCode
          const isEditing = editingCode === entry.shortCode

          return (
            <div
              key={entry.shortCode}
              className={`border-2 hard-sm px-4 py-3 ${expired ? 'opacity-60' : ''}`}
              style={{
                background: 'var(--c-surface)',
                borderColor: expired ? 'rgba(127,29,29,0.4)' : 'var(--c-border)',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Favicon + click badge */}
                <div className="flex items-center gap-3 shrink-0 pt-0.5">
                  {(() => {
                    try {
                      const domain = new URL(entry.originalUrl).hostname
                      return (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                          alt=""
                          className="w-5 h-5"
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      )
                    } catch { return null }
                  })()}
                  <div className="w-10 text-center">
                    <span className="text-lg font-bold text-[var(--c-accent-text)] font-mono leading-none">
                      {clicks}
                    </span>
                    <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--c-text-subtle)' }}>clicks</p>
                  </div>
                </div>

                {/* Right side: URL info + actions */}
                <div className="flex-1 min-w-0">
                  {/* URL row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-[var(--c-accent-text)] truncate max-w-full">
                      {entry.shortUrl}
                    </span>
                    {entry.passwordProtected && (
                      <span className="shrink-0 text-xs" style={{ color: 'var(--c-text-muted)' }} title="Password protected">🔒</span>
                    )}
                    {expired && (
                      <span className="shrink-0 text-xs text-red-500 bg-red-950/40 border border-red-900/40 px-1.5 py-0.5">
                        expired
                      </span>
                    )}
                    {entry.expiresAt && !expired && (
                      <span className="shrink-0 text-xs text-amber-600">
                        ⏱ {new Date(entry.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Destination URL or inline edit */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="url"
                        value={editUrl}
                        onChange={e => setEditUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(entry.shortCode); if (e.key === 'Escape') setEditingCode(null) }}
                        autoFocus
                        className="flex-1 min-w-0 border border-[var(--c-accent)] px-2.5 py-1.5 text-xs
                                   focus:outline-none focus:ring-1 focus:ring-[var(--c-accent)] font-mono"
                        style={{ background: 'var(--c-input)', color: 'var(--c-text)' }}
                      />
                      <button
                        onClick={() => saveEdit(entry.shortCode)}
                        disabled={editSaving}
                        className="text-xs px-2.5 py-1.5 bg-[var(--c-accent-soft)] hover:bg-[var(--c-accent-soft)]
                                   text-[var(--c-accent-text)] transition-colors shrink-0 disabled:opacity-50"
                      >
                        {editSaving ? '…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingCode(null)}
                        className="text-xs px-2 py-1.5 transition-colors shrink-0"
                        style={{ background: 'var(--c-surface-hover)', color: 'var(--c-text-muted)' }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--c-text-subtle)' }}>{entry.originalUrl}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <button
                      onClick={() => onPreview(entry.shortCode)}
                      className="text-xs px-2.5 py-1.5 transition-colors"
                      style={{ background: 'var(--c-surface-hover)', color: 'var(--c-text-muted)' }}
                    >
                      Stats
                    </button>
                    <button
                      onClick={() => startEdit(entry)}
                      className={`text-xs px-2.5 py-1.5 transition-colors
                        ${isEditing
                          ? 'bg-[var(--c-accent-soft)] text-[var(--c-accent-text)] border border-[var(--c-accent)]'
                          : ''}`}
                      style={!isEditing ? { background: 'var(--c-surface-hover)', color: 'var(--c-text-muted)' } : {}}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleQr(entry.shortCode)}
                      className={`text-xs px-2.5 py-1.5 transition-colors
                        ${qrOpen
                          ? 'bg-[var(--c-accent-soft)] text-[var(--c-accent-text)] border border-[var(--c-accent)]'
                          : ''}`}
                      style={!qrOpen ? { background: 'var(--c-surface-hover)', color: 'var(--c-text-muted)' } : {}}
                    >
                      QR
                    </button>
                    <button
                      onClick={() => handleCopy(entry.shortUrl, entry.shortCode)}
                      className="text-xs px-2.5 py-1.5 transition-colors"
                      style={{ background: 'var(--c-surface-hover)', color: 'var(--c-text-muted)' }}
                    >
                      {copiedCode === entry.shortCode ? '✓' : 'Copy'}
                    </button>
                    <a
                      href={entry.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1.5 bg-[var(--c-accent-soft)] hover:bg-[var(--c-accent-soft)]
                                 text-[var(--c-accent-text)] transition-colors"
                    >
                      Open
                    </a>
                    <button
                      onClick={() => onDelete(entry.shortCode)}
                      className="text-xs px-2.5 py-1.5 bg-red-950/30 hover:bg-red-950/60
                                 text-red-500 transition-colors"
                      title="Delete link"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              {/* QR code panel */}
              {qrOpen && <HistoryQr shortUrl={entry.shortUrl} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
