import { useState } from 'react'

export default function PasswordModal({ code, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/urls/${code}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Incorrect password.')
      } else {
        window.location.href = data.originalUrl
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-sm border-2 hard-lg p-6"
        style={{ background: 'var(--c-modal)', borderColor: 'var(--c-border)' }}
      >

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-lg" style={{ color: 'var(--c-text)' }}>Password required</h2>
            <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--c-text-muted)' }}>{code}</p>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none transition-colors"
            style={{ color: 'var(--c-text-subtle)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full line-ink px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--c-accent)]
                       focus:ring-1 focus:ring-[var(--c-accent)] transition-all"
            style={{ background: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
          />

          {error && (
            <p className="text-red-400 text-xs flex items-center gap-1.5">
              <span>⚠</span>{error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="press w-full border-2 py-3 text-sm font-display font-extrabold hard disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--c-accent)', color: 'var(--c-accent-on)', borderColor: 'var(--c-border)' }}
          >
            {loading ? 'verifying...' : 'unlock →'}
          </button>
        </form>
      </div>
    </div>
  )
}
