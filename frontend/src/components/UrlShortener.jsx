export default function UrlShortener({
  url, setUrl, result, stats, error, loading, copied, handleSubmit, handleCopy, onRefreshStats,
}) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            URL Shortener
          </h1>
          <p className="text-gray-400 text-base">
            Paste a long URL and get a short link instantly.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="url"
            required
            placeholder="https://example.com/very/long/url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 text-white placeholder-gray-500
                       rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500
                       transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed
                       text-white font-medium px-5 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {loading ? 'Shortening…' : 'Shorten'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-950 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Your short link</p>

            <div className="flex items-center gap-2">
              <span className="flex-1 font-mono text-violet-400 text-sm truncate">
                {result.shortUrl}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5
                           rounded-md transition-colors whitespace-nowrap"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-violet-900 hover:bg-violet-800 text-violet-200 px-3 py-1.5
                           rounded-md transition-colors"
              >
                Open
              </a>
            </div>

            <p className="text-xs text-gray-600 truncate">
              Original: {result.originalUrl}
            </p>

            {/* Stats */}
            {stats && (
              <div className="border-t border-gray-800 pt-3 mt-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Analytics</span>
                  <span className="text-xs bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                    {stats.totalClicks} {stats.totalClicks === 1 ? 'click' : 'clicks'}
                  </span>
                  <button
                    onClick={onRefreshStats}
                    className="ml-auto text-xs text-gray-600 hover:text-gray-400 transition-colors"
                    title="Refresh stats"
                  >
                    ↻ Refresh
                  </button>
                </div>
                {stats.recentClicks.length > 0 ? (
                  <ul className="space-y-1">
                    {stats.recentClicks.map((c, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-gray-600">
                          {new Date(c.clickedAt).toLocaleString()}
                        </span>
                        {c.referrer && (
                          <span className="truncate text-gray-600" title={c.referrer}>
                            ← {new URL(c.referrer).hostname}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-600">No clicks yet. Share your link!</p>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
