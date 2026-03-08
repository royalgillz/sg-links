import { useState, useEffect } from 'react'

const STORAGE_KEY = 'api_keys'

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
    <div className="mt-8 border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">API Keys</h2>
        <span className="text-xs text-gray-600">bypass rate limiting</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Generate form */}
        <form onSubmit={handleGenerate} className="flex gap-2">
          <input
            type="text"
            placeholder="Key name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-600
                       rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600/30 hover:bg-violet-600/50 border border-violet-600/40
                       text-violet-300 px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-50"
          >
            {loading ? '…' : 'Generate'}
          </button>
        </form>

        {/* New key banner — shown once */}
        {newKey && (
          <div className="bg-green-950/40 border border-green-800/40 rounded-lg px-3 py-2">
            <p className="text-xs text-green-400 mb-1">Save this key — it won't be shown again</p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-green-300 font-mono flex-1 truncate">{newKey}</code>
              <button onClick={() => handleCopy(newKey, 'new')} className="text-xs text-gray-400 hover:text-white shrink-0">
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
                <span className="flex-1 text-gray-500 font-mono truncate">{k.keyPrefix}</span>
                <span className="text-gray-600 shrink-0">{k.name}</span>
                <button onClick={() => handleCopy(k.key, k.id)} className="text-gray-500 hover:text-gray-300 shrink-0">
                  {copiedId === k.id ? '✓' : 'Copy'}
                </button>
                <button onClick={() => handleRevoke(k)} className="text-red-700 hover:text-red-500 shrink-0">✕</button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-gray-700">
          Include your key as <code className="text-gray-500">X-API-Key: sk_...</code> to bypass rate limiting.
        </p>
      </div>
    </div>
  )
}
