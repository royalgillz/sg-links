import { useState } from 'react'

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ usernameOrEmail: '', username: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { usernameOrEmail: form.usernameOrEmail, password: form.password }
        : { username: form.username, email: form.email, password: form.password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Something went wrong.')
      } else {
        onAuth(data)
        onClose()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full line-ink px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--c-accent)] transition-all"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-sm border-2 hard-lg overflow-hidden"
        style={{ background: 'var(--c-modal)', borderColor: 'var(--c-border)' }}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <div className="flex gap-4">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className="text-sm font-mono font-bold transition-colors"
                style={{ color: mode === m ? 'var(--c-accent-text)' : 'var(--c-text-subtle)' }}
              >
                {m === 'login' ? 'sign in' : 'create account'}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-xl transition-colors"
            style={{ color: 'var(--c-text-subtle)' }}
          >✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {mode === 'register' && (
            <>
              <input
                name="username"
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={50}
                className={inputClass}
                style={{ background: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className={inputClass}
                style={{ background: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
              />
            </>
          )}

          {mode === 'login' && (
            <input
              name="usernameOrEmail"
              type="text"
              placeholder="Username or email"
              value={form.usernameOrEmail}
              onChange={handleChange}
              required
              className={inputClass}
              style={{ background: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
            />
          )}

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={mode === 'register' ? 8 : 1}
            maxLength={72}
            className={inputClass}
            style={{ background: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="press w-full border-2 py-3 text-sm font-display font-extrabold hard disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--c-accent)', color: 'var(--c-accent-on)', borderColor: 'var(--c-border)' }}
          >
            {loading ? '...' : mode === 'login' ? 'sign in' : 'create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
