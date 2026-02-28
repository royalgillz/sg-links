import { useState, useEffect, useRef } from 'react'
import UrlShortener from './components/UrlShortener'
import { useHistory } from './hooks/useHistory'

export default function App() {
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [expiryDays, setExpiryDays] = useState('')
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const intervalRef = useRef(null)

  const { history, addEntry, removeEntry, updateStats } = useHistory()

  async function fetchStats(code) {
    try {
      const res = await fetch(`/api/urls/${code}/stats`)
      if (res.ok) {
        const data = await res.json()
        updateStats(code, data)
        if (result?.shortCode === code) setStats(data)
      }
    } catch {
      // non-critical
    }
  }

  // Auto-refresh current result stats every 5s
  useEffect(() => {
    if (!result) return
    intervalRef.current = setInterval(() => fetchStats(result.shortCode), 5000)
    return () => clearInterval(intervalRef.current)
  }, [result])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setStats(null)
    clearInterval(intervalRef.current)
    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, alias: alias.trim() || null, expiryDays: expiryDays ? Number(expiryDays) : null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
      } else {
        setResult(data)
        addEntry(data)
        fetchStats(data.shortCode)
      }
    } catch {
      setError('Network error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(shortCode) {
    try {
      await fetch(`/api/urls/${shortCode}`, { method: 'DELETE' })
    } catch {
      // best-effort
    }
    removeEntry(shortCode)
    if (result?.shortCode === shortCode) {
      setResult(null)
      setStats(null)
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
      alias={alias}
      setAlias={setAlias}
      expiryDays={expiryDays}
      setExpiryDays={setExpiryDays}
      result={result}
      stats={stats}
      error={error}
      loading={loading}
      copied={copied}
      handleSubmit={handleSubmit}
      handleCopy={handleCopy}
      history={history}
      onDelete={handleDelete}
      onRefreshStats={fetchStats}
    />
  )
}
