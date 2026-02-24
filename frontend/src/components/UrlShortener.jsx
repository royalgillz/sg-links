export default function UrlShortener({
  url, setUrl, result, error, loading, copied, handleSubmit, handleCopy,
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
          <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your short link</p>
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
            <p className="text-xs text-gray-600 mt-2 truncate">
              Original: {result.originalUrl}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
