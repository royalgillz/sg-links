export default function ErrorPage({ type, onClose }) {
  const config = type === 'expired'
    ? { emoji: '⏱', title: 'Link expired', body: 'This short link has passed its expiry date and is no longer active.' }
    : { emoji: '🔍', title: 'Link not found', body: 'This short link doesn\'t exist or may have been deleted.' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
        <div className="text-4xl mb-4">{config.emoji}</div>
        <h2 className="text-white font-semibold text-lg mb-2">{config.title}</h2>
        <p className="text-gray-500 text-sm mb-6">{config.body}</p>
        <button
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/15 border border-white/10
                     text-gray-300 font-medium py-2.5 rounded-xl text-sm transition-all"
        >
          Back to home
        </button>
      </div>
    </div>
  )
}
