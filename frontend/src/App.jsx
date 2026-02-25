import { useState } from 'react'
import UrlShortener from './components/UrlShortener'

function App() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setStats(null)
    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? 'Something went wrong.')
      } else {
        setResult(data)
        fetchStats(data.shortCode)
      }
    } catch {
      setError('Network error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats(code) {
    try {
      const res = await fetch(`/api/urls/${code}/stats`)
      if (res.ok) setStats(await res.json())
    } catch {
      // stats are non-critical, fail silently
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <UrlShortener
      url={url}
      setUrl={setUrl}
      result={result}
      stats={stats}
      error={error}
      loading={loading}
      copied={copied}
      handleSubmit={handleSubmit}
      handleCopy={handleCopy}
    />
  )
}

export default App
