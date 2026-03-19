import { useEffect, useState } from 'react'
import ThreeBackground from './ThreeBackground'

export default function LinkInBioPage() {
  const username = window.location.pathname.replace('/u/', '').split('/')[0]
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${username}/bio`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setData)
      .catch(() => setError('User not found.'))
      .finally(() => setLoading(false))
  }, [username])

  return (
    <div
      className="relative min-h-screen flex items-start justify-center p-4 pt-16 overflow-hidden"
      style={{ background: 'var(--c-bg)' }}
    >
      <ThreeBackground />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent pointer-events-none" />

      <div className="relative z-20 w-full max-w-sm">
        {loading && <p className="text-sm text-center" style={{ color: 'var(--c-text-muted)' }}>Loading…</p>}
        {error   && <p className="text-red-400 text-sm text-center">{error}</p>}

        {data && (
          <>
            {/* Profile header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600
                              flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                {data.username.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>@{data.username}</h1>
            </div>

            {/* Links */}
            <div className="space-y-3">
              {data.links.length === 0 && (
                <p className="text-sm text-center italic" style={{ color: 'var(--c-text-subtle)' }}>No public links yet.</p>
              )}
              {data.links.map((link, i) => (
                <a
                  key={i}
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border hover:border-violet-500/30 rounded-2xl px-5 py-4 transition-all group"
                  style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${link.domain}&sz=32`}
                      alt=""
                      className="w-5 h-5 rounded shrink-0"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-violet-300 transition-colors" style={{ color: 'var(--c-text)' }}>
                        {link.title || link.domain}
                      </p>
                      {link.description && (
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{link.description}</p>
                      )}
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--c-text-subtle)' }}>{link.clickCount} clicks</span>
                  </div>
                </a>
              ))}
            </div>

            {/* Footer */}
            <p className="text-center text-xs mt-8" style={{ color: 'var(--c-text-subtle)' }}>
              <a href="/" className="hover:text-violet-400 transition-colors">Create your own link page →</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
