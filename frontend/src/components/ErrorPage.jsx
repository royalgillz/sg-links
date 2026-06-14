export default function ErrorPage({ type, onClose }) {
  const config = type === 'expired'
    ? { emoji: '⏱', title: 'Link expired', body: 'This short link has passed its expiry date and is no longer active.' }
    : { emoji: '🔍', title: 'Link not found', body: "This short link doesn't exist or may have been deleted." }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-sm border-2 hard-lg p-6 text-center"
        style={{ background: 'var(--c-modal)', borderColor: 'var(--c-border)' }}
      >
        <div className="text-4xl mb-4">{config.emoji}</div>
        <h2 className="font-display font-extrabold text-xl mb-2" style={{ color: 'var(--c-text)' }}>{config.title}</h2>
        <p className="copy text-sm mb-6" style={{ color: 'var(--c-text-muted)' }}>{config.body}</p>
        <button
          onClick={onClose}
          className="press w-full line-ink font-display font-bold py-2.5 text-sm"
          style={{ color: 'var(--c-text)' }}
        >
          back to home
        </button>
      </div>
    </div>
  )
}
