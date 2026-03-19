import { useState, useEffect, useRef } from 'react'
import UrlShortener from './components/UrlShortener'
import PasswordModal from './components/PasswordModal'
import PreviewModal from './components/PreviewModal'
import ErrorPage from './components/ErrorPage'
import ShareableStatsPage from './components/ShareableStatsPage'
import LinkInBioPage from './components/LinkInBioPage'
import AuthModal from './components/AuthModal'
import LandingContent from './components/LandingContent'
import { useHistory } from './hooks/useHistory'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'

// Pathname-based routing for shareable pages
const path = window.location.pathname
if (path.startsWith('/s/')) {
  document.body.innerHTML = ''
}
if (path.startsWith('/u/')) {
  document.body.innerHTML = ''
}

export default function App() {
  // Route to standalone pages based on pathname
  if (path.startsWith('/s/')) return <ShareableStatsPage />
  if (path.startsWith('/u/')) return <LinkInBioPage />

  const { isDark, toggleTheme } = useTheme()

  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [expiryDays, setExpiryDays] = useState('')
  const [password, setPassword] = useState('')
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [ogImage, setOgImage] = useState('')

  // Read query params set by backend redirects or bookmarklet
  const params = new URLSearchParams(window.location.search)
  const [unlockCode, setUnlockCode] = useState(params.get('unlock') ?? null)
  const [previewCode, setPreviewCode] = useState(params.get('preview') ?? null)
  const [errorType, setErrorType] = useState(params.get('error') ?? null)
  const bookmarkletUrl = params.get('url') ?? null
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const intervalRef = useRef(null)

  const { history, addEntry, removeEntry, updateStats, updateEntryUrl } = useHistory()
  const { token, user, login, logout, isLoggedIn } = useAuth()

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
  }, [result?.shortCode])

  async function shortenUrl(targetUrl) {
    setLoading(true)
    setError(null)
    setResult(null)
    setStats(null)
    clearInterval(intervalRef.current)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/urls', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: targetUrl,
          alias: alias.trim() || null,
          expiryDays: expiryDays ? Number(expiryDays) : null,
          password: password || null,
          ogTitle: ogTitle.trim() || null,
          ogDescription: ogDescription.trim() || null,
          ogImage: ogImage.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
      } else {
        setResult(data)
        addEntry(data)
        fetchStats(data.shortCode)
        setPassword('')
      }
    } catch {
      setError('Network error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // GSD: auto-shorten when arriving via bookmarklet (?url=...)
  useEffect(() => {
    if (bookmarkletUrl) {
      setUrl(bookmarkletUrl)
      window.history.replaceState({}, '', '/')
      shortenUrl(bookmarkletUrl)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    await shortenUrl(url)
  }

  // GSD: auto-shorten on paste into the URL field
  function handleUrlPaste(e) {
    const pasted = e.clipboardData.getData('text').trim()
    if (/^https?:\/\/.+/.test(pasted)) {
      e.preventDefault()
      setUrl(pasted)
      setTimeout(() => shortenUrl(pasted), 0)
    }
  }

  async function handleEdit(shortCode, newUrl) {
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      await fetch(`/api/urls/${shortCode}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ url: newUrl }),
      })
      updateEntryUrl(shortCode, newUrl)
    } catch {
      // best-effort
    }
  }

  async function handleDelete(shortCode) {
    try {
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      await fetch(`/api/urls/${shortCode}`, { method: 'DELETE', headers })
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

  function clearParam() {
    window.history.replaceState({}, '', '/')
  }

  return (
    <>
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuth={login}
        />
      )}
      {unlockCode && (
        <PasswordModal
          code={unlockCode}
          onClose={() => { setUnlockCode(null); clearParam() }}
        />
      )}
      {previewCode && (
        <PreviewModal
          code={previewCode}
          onClose={() => { setPreviewCode(null); clearParam() }}
        />
      )}
      {errorType && (
        <ErrorPage
          type={errorType}
          onClose={() => { setErrorType(null); clearParam() }}
        />
      )}
      <UrlShortener
        url={url}
        setUrl={setUrl}
        alias={alias}
        setAlias={setAlias}
        expiryDays={expiryDays}
        setExpiryDays={setExpiryDays}
        password={password}
        setPassword={setPassword}
        ogTitle={ogTitle}
        setOgTitle={setOgTitle}
        ogDescription={ogDescription}
        setOgDescription={setOgDescription}
        ogImage={ogImage}
        setOgImage={setOgImage}
        result={result}
        stats={stats}
        error={error}
        loading={loading}
        copied={copied}
        handleSubmit={handleSubmit}
        handleCopy={handleCopy}
        handleUrlPaste={handleUrlPaste}
        history={history}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onRefreshStats={fetchStats}
        onPreview={code => setPreviewCode(code)}
        user={user}
        isLoggedIn={isLoggedIn}
        onShowAuth={() => setShowAuthModal(true)}
        onLogout={logout}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
      <LandingContent isDark={isDark} />
    </>
  )
}
