import { useState, useEffect } from 'react'

const STORAGE_KEY = 'sglinks_api_keys'

function loadKeys() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export default function ApiKeys() {
  const [keys, setKeys] = useState(loadKeys)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [newKey, setNewKey] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  }, [keys])

  async function handleGenerate(e) {
    e.preventDefault()
    setLoading(true)
    setNewKey(null)
    try {
      const res = await fetch(`/api/keys?name=${encodeURIComponent(name.trim() || 'My key')}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setNewKey(data.key)
        setKeys(prev => [{ id: data.id, name: data.name, keyPrefix: data.keyPrefix, key: data.key, createdAt: data.createdAt }, ...prev])
        setName('')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke(entry) {
    await fetch(`/api/keys/${entry.id}`, { method: 'DELETE', headers: { 'X-API-Key': entry.key } })
    setKeys(prev => prev.filter(k => k.id !== entry.id))
  }

  function handleCopy(key, id) {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="mt-8 border rounded-2xl overflow-hidden" style={{ borderColor: 'var(--c-border)' }}>
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--c-border)' }}>
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>API Keys</h2>
        <span className="text-xs" style={{ color: 'var(--c-text-subtle)' }}>bypass rate limiting</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Generate form */}
        <form onSubmit={handleGenerate} className="flex gap-2">
          <input
            type="text"
            placeholder="Key name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500/50 transition-all"
            style={{ background: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-50 hover:opacity-80"
            style={{ background: 'var(--c-ghost-bg)', border: '1px solid var(--c-ghost-border)', color: 'var(--c-ghost-text)' }}
          >
            {loading ? '…' : 'Generate'}
          </button>
        </form>

        {/* New key banner — shown once */}
        {newKey && (
          <div className="rounded-lg px-3 py-2" style={{ background: 'var(--c-success-bg)', border: '1px solid var(--c-success-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--c-success-text)' }}>Save this key — it won't be shown again</p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono flex-1 truncate" style={{ color: 'var(--c-success-code)' }}>{newKey}</code>
              <button
                onClick={() => handleCopy(newKey, 'new')}
                className="text-xs shrink-0 transition-colors hover:opacity-70"
                style={{ color: 'var(--c-success-text)' }}
              >
                {copiedId === 'new' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Key list */}
        {keys.length > 0 && (
          <ul className="space-y-1.5">
            {keys.map(k => (
              <li key={k.id} className="flex items-center gap-2 text-xs">
                <span className="flex-1 font-mono truncate" style={{ color: 'var(--c-text-muted)' }}>{k.keyPrefix}</span>
                <span className="shrink-0" style={{ color: 'var(--c-text-subtle)' }}>{k.name}</span>
                <button
                  onClick={() => handleCopy(k.key, k.id)}
                  className="shrink-0 transition-colors hover:text-white"
                  style={{ color: 'var(--c-text-muted)' }}
                >
                  {copiedId === k.id ? '✓' : 'Copy'}
                </button>
                <button onClick={() => handleRevoke(k)} className="text-red-700 hover:text-red-500 shrink-0">✕</button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs" style={{ color: 'var(--c-text-subtle)' }}>
          Include your key as <code style={{ color: 'var(--c-text-muted)' }}>X-API-Key: sk_...</code> to bypass rate limiting.
        </p>
      </div>
    </div>
  )
}
