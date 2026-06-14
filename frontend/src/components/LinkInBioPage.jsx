import { useEffect, useState } from 'react'
import Rough from './Rough'

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
    <div className="paper-grid min-h-screen flex items-start justify-center p-4 pt-16">
      <div className="w-full max-w-sm">
        {loading && <p className="text-sm text-center font-mono" style={{ color: 'var(--c-text-muted)' }}>loading...</p>}
        {error && <p className="text-red-400 text-sm text-center font-mono">{error}</p>}

        {data && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-3 card-ink flex items-center justify-center text-2xl font-display font-extrabold"
                   style={{ background: 'var(--c-accent)', color: 'var(--c-accent-on)' }}>
                {data.username.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl font-display font-extrabold" style={{ color: 'var(--c-text)' }}>@{data.username}</h1>
            </div>

            <div className="space-y-4">
              {data.links.length === 0 && (
                <p className="text-sm text-center italic font-mono" style={{ color: 'var(--c-text-subtle)' }}>No public links yet.</p>
              )}
              {data.links.map((link, i) => (
                <a key={i} href={link.shortUrl} target="_blank" rel="noopener noreferrer"
                   className="press relative rough-host block px-5 py-4 group">
                  <Rough stroke="var(--c-border)" strokeWidth={2.2} roughness={1.8} seed={i + 3} />
                  <div className="relative z-10 flex items-center gap-3">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${link.domain}&sz=32`}
                      alt="" className="w-5 h-5 rounded shrink-0"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-bold truncate" style={{ color: 'var(--c-text)' }}>
                        {link.title || link.domain}
                      </p>
                      {link.description && (
                        <p className="text-xs truncate mt-0.5 font-mono" style={{ color: 'var(--c-text-muted)' }}>{link.description}</p>
                      )}
                    </div>
                    <span className="text-xs shrink-0 font-mono" style={{ color: 'var(--c-text-subtle)' }}>{link.clickCount} clicks</span>
                  </div>
                </a>
              ))}
            </div>

            <p className="text-center text-sm mt-8">
              <a href="/" className="annot text-lg">make your own link page →</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
