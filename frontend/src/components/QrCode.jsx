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

  function handleDownload() {
    QRCode.toDataURL(url, { width: 512, margin: 1, color: { dark: '#ffffff', light: '#111111' } })
      .then(dataUrl => {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = 'qr.png'
        a.click()
      })
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4 border-t border-white/10">
      <p className="text-xs text-gray-500 uppercase tracking-widest self-start">QR Code</p>
      <canvas ref={canvasRef} className="rounded-lg" />
      <button
        onClick={handleDownload}
        className="text-xs bg-white/10 hover:bg-white/15 border border-white/10
                   text-gray-300 px-3 py-1.5 rounded-lg transition-all"
      >
        Download PNG
      </button>
    </div>
  )
}
