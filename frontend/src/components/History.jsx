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

  function handleDownload() {
    QRCode.toDataURL(shortUrl, { width: 512, margin: 1, color: { dark: '#ffffff', light: '#111111' } })
      .then(dataUrl => {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `qr-${shortUrl.split('/').pop()}.png`
        a.click()
      })
  }

  return (
    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
      <canvas ref={canvasRef} className="rounded" />
      <button
        onClick={handleDownload}
        className="text-xs bg-white/10 hover:bg-white/15 border border-white/10
                   text-gray-300 px-2.5 py-1.5 rounded-lg transition-all"
      >
        Download PNG
      </button>
    </div>
  )
}

export default function History({ history, onDelete, onRefreshStats }) {
  const [copiedCode, setCopiedCode] = useState(null)
  const [expandedQr, setExpandedQr] = useState(null)

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

  if (history.length === 0) return null

  const sorted = [...history].sort((a, b) =>
    (b.stats?.totalClicks ?? 0) - (a.stats?.totalClicks ?? 0)
  )

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Link History
        </h2>
        <span className="text-xs text-gray-600">{history.length} link{history.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-2">
        {sorted.map(entry => {
          const expired = entry.expiresAt && new Date(entry.expiresAt) < new Date()
          const clicks = entry.stats?.totalClicks ?? '—'
          const qrOpen = expandedQr === entry.shortCode

          return (
            <div
              key={entry.shortCode}
              className={`bg-white/5 border rounded-xl px-4 py-3
                ${expired ? 'border-red-900/40 opacity-60' : 'border-white/10'}`}
            >
              <div className="flex items-center gap-3">
                {/* Click badge */}
                <div className="shrink-0 w-12 text-center">
                  <span className="text-lg font-bold text-violet-300 font-mono leading-none">
                    {clicks}
                  </span>
                  <p className="text-xs text-gray-600 leading-none mt-0.5">clicks</p>
                </div>

                {/* URLs */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-violet-400 truncate">
                      {entry.shortUrl}
                    </span>
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
                  <p className="text-xs text-gray-600 truncate mt-0.5">{entry.originalUrl}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleQr(entry.shortCode)}
                    title="Show QR code"
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

              {/* QR code panel */}
              {qrOpen && <HistoryQr shortUrl={entry.shortUrl} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
