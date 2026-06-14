import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

function inkColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--c-text').trim() || '#111111'
}

export default function QrCode({ url }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    // draw with the theme's ink color so it shows on paper (light) and navy (dark)
    const draw = () => QRCode.toCanvas(canvasRef.current, url, {
      width: 160, margin: 1, color: { dark: inkColor(), light: '#00000000' },
    })
    draw()
    window.addEventListener('themechange', draw)
    return () => window.removeEventListener('themechange', draw)
  }, [url])

  function handleDownloadPng() {
    QRCode.toDataURL(url, { width: 512, margin: 1, color: { dark: '#111111', light: '#ffffff' } })
      .then(dataUrl => {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = 'qr.png'
        a.click()
      })
  }

  function handleDownloadSvg() {
    QRCode.toString(url, { type: 'svg', width: 512, margin: 1, color: { dark: '#111111', light: '#ffffff' } })
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
    <div className="flex flex-col items-center gap-2 p-4 border-t-2" style={{ borderColor: 'var(--c-border)' }}>
      <p className="text-xs uppercase tracking-widest self-start font-mono" style={{ color: 'var(--c-text-muted)' }}>QR code</p>
      <canvas ref={canvasRef} />
      <div className="flex gap-2">
        <button onClick={handleDownloadPng} className="press line-ink text-xs px-3 py-1.5 font-mono" style={{ color: 'var(--c-text-muted)' }}>
          download png
        </button>
        <button onClick={handleDownloadSvg} className="press line-ink text-xs px-3 py-1.5 font-mono" style={{ color: 'var(--c-text-muted)' }}>
          download svg
        </button>
      </div>
    </div>
  )
}
