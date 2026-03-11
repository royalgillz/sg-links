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
        setError(data.error ?? data.message ?? 'Something went wrong.')
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex gap-4">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className={`text-sm font-medium transition-colors capitalize
                  ${mode === m ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 text-xl transition-colors">✕</button>
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
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500
                           rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500
                           rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all"
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
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500
                         rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all"
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
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500
                       rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all"
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500
                       disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl
                       text-sm transition-all"
          >
            {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
