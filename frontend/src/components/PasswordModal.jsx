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
        className="w-full max-w-sm border rounded-2xl shadow-2xl p-6"
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
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500
                       focus:ring-1 focus:ring-violet-500/50 transition-all"
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
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600
                       hover:from-violet-500 hover:to-fuchsia-500
                       disabled:from-violet-800 disabled:to-fuchsia-800 disabled:cursor-not-allowed
                       text-white font-semibold py-3 rounded-xl text-sm transition-all"
          >
            {loading ? 'Verifying…' : 'Unlock →'}
          </button>
        </form>
      </div>
    </div>
  )
}
