import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

function HistoryQr({ shortUrl }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, shortUrl, {
      width: 120,
      margin: 1,
      color: { dark: '#ffffff', light: '#00000000' },
    })
  }, [shortUrl])

  function handleDownloadPng() {
    QRCode.toDataURL(shortUrl, { width: 512, margin: 1, color: { dark: '#ffffff', light: '#111111' } })
      .then(dataUrl => {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `qr-${shortUrl.split('/').pop()}.png`
        a.click()
      })
  }

  function handleDownloadSvg() {
    QRCode.toString(shortUrl, { type: 'svg', width: 512, margin: 1, color: { dark: '#ffffff', light: '#111111' } })
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
    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
      <canvas ref={canvasRef} className="rounded" />
      <div className="flex flex-col gap-1.5">
        <button
          onClick={handleDownloadPng}
          className="text-xs bg-white/10 hover:bg-white/15 border border-white/10
                     text-gray-300 px-2.5 py-1.5 rounded-lg transition-all"
        >
          Download PNG
        </button>
        <button
          onClick={handleDownloadSvg}
          className="text-xs bg-white/10 hover:bg-white/15 border border-white/10
                     text-gray-300 px-2.5 py-1.5 rounded-lg transition-all"
        >
          Download SVG
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
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Link History
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="text-xs bg-white/5 hover:bg-white/10 border border-white/10
                       text-gray-500 hover:text-gray-300 px-2.5 py-1 rounded-lg transition-all"
          >
            Export CSV
          </button>
          <span className="text-xs text-gray-600">{history.length} link{history.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map(entry => {
          const expired = entry.expiresAt && new Date(entry.expiresAt) < new Date()
          const clicks = entry.stats?.totalClicks ?? '—'
          const qrOpen = expandedQr === entry.shortCode
          const isEditing = editingCode === entry.shortCode

          return (
            <div
              key={entry.shortCode}
              className={`bg-white/5 border rounded-xl px-4 py-3
                ${expired ? 'border-red-900/40 opacity-60' : 'border-white/10'}`}
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
                          className="w-5 h-5 rounded"
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      )
                    } catch { return null }
                  })()}
                  <div className="w-10 text-center">
                    <span className="text-lg font-bold text-violet-300 font-mono leading-none">
                      {clicks}
                    </span>
                    <p className="text-xs text-gray-600 leading-none mt-0.5">clicks</p>
                  </div>
                </div>

                {/* Right side: URL info + actions */}
                <div className="flex-1 min-w-0">
                  {/* URL row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-violet-400 truncate max-w-full">
                      {entry.shortUrl}
                    </span>
                    {entry.passwordProtected && (
                      <span className="shrink-0 text-xs text-gray-500" title="Password protected">🔒</span>
                    )}
                    {expired && (
                      <span className="shrink-0 text-xs text-red-500 bg-red-950/40 border border-red-900/40 px-1.5 py-0.5 rounded">
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
                        className="flex-1 min-w-0 bg-white/5 border border-violet-500/50 text-white
                                   rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1
                                   focus:ring-violet-500/50 font-mono"
                      />
                      <button
                        onClick={() => saveEdit(entry.shortCode)}
                        disabled={editSaving}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-violet-600/50 hover:bg-violet-600/70
                                   text-violet-200 transition-colors shrink-0 disabled:opacity-50"
                      >
                        {editSaving ? '…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingCode(null)}
                        className="text-xs px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                                   text-gray-500 transition-colors shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 truncate mt-0.5">{entry.originalUrl}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <button
                      onClick={() => onPreview(entry.shortCode)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                                 text-gray-400 transition-colors"
                    >
                      Stats
                    </button>
                    <button
                      onClick={() => startEdit(entry)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors
                        ${isEditing
                          ? 'bg-violet-700/40 text-violet-300 border border-violet-600/40'
                          : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleQr(entry.shortCode)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors
                        ${qrOpen
                          ? 'bg-violet-700/40 text-violet-300 border border-violet-600/40'
                          : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                    >
                      QR
                    </button>
                    <button
                      onClick={() => handleCopy(entry.shortUrl, entry.shortCode)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                                 text-gray-400 transition-colors"
                    >
                      {copiedCode === entry.shortCode ? '✓' : 'Copy'}
                    </button>
                    <a
                      href={entry.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-violet-900/30 hover:bg-violet-900/50
                                 text-violet-400 transition-colors"
                    >
                      Open
                    </a>
                    <button
                      onClick={() => onDelete(entry.shortCode)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/60
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
