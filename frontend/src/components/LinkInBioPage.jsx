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
    <div className="relative min-h-screen bg-gray-950 flex items-start justify-center p-4 pt-16 overflow-hidden">
      <ThreeBackground />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent pointer-events-none" />

      <div className="relative z-20 w-full max-w-sm">
        {loading && <p className="text-gray-500 text-sm text-center">Loading…</p>}
        {error   && <p className="text-red-400 text-sm text-center">{error}</p>}

        {data && (
          <>
            {/* Profile header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600
                              flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                {data.username.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-white">@{data.username}</h1>
            </div>

            {/* Links */}
            <div className="space-y-3">
              {data.links.length === 0 && (
                <p className="text-gray-600 text-sm text-center italic">No public links yet.</p>
              )}
              {data.links.map((link, i) => (
                <a
                  key={i}
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30
                             rounded-2xl px-5 py-4 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${link.domain}&sz=32`}
                      alt=""
                      className="w-5 h-5 rounded shrink-0"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
                        {link.title || link.domain}
                      </p>
                      {link.description && (
                        <p className="text-gray-500 text-xs truncate mt-0.5">{link.description}</p>
                      )}
                    </div>
                    <span className="text-gray-600 text-xs shrink-0">{link.clickCount} clicks</span>
                  </div>
                </a>
              ))}
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-700 mt-8">
              <a href="/" className="hover:text-gray-500 transition-colors">Create your own link page →</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
