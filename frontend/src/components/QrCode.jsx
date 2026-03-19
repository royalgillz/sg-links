import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QrCode({ url }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: 160,
      margin: 1,
      color: { dark: '#ffffff', light: '#00000000' },
    })
  }, [url])

  function handleDownloadPng() {
    QRCode.toDataURL(url, { width: 512, margin: 1, color: { dark: '#ffffff', light: '#111111' } })
      .then(dataUrl => {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = 'qr.png'
        a.click()
      })
  }

  function handleDownloadSvg() {
    QRCode.toString(url, { type: 'svg', width: 512, margin: 1, color: { dark: '#ffffff', light: '#111111' } })
      .then(svgString => {
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'qr.svg'
        a.click()
        URL.revokeObjectURL(a.href)
      })
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4 border-t" style={{ borderColor: 'var(--c-border)' }}>
      <p className="text-xs uppercase tracking-widest self-start" style={{ color: 'var(--c-text-muted)' }}>QR Code</p>
      <canvas ref={canvasRef} className="rounded-lg" />
      <div className="flex gap-2">
        <button
          onClick={handleDownloadPng}
          className="text-xs border px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'var(--c-surface-hover)', borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
        >
          Download PNG
        </button>
        <button
          onClick={handleDownloadSvg}
          className="text-xs border px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'var(--c-surface-hover)', borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
        >
          Download SVG
        </button>
      </div>
    </div>
  )
}
