import { useEffect, useState } from 'react'

// little sketch button that appears once you've scrolled down a bit
export default function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="back to top"
      className="press fixed bottom-6 right-6 z-40 w-12 h-12 flex items-center justify-center font-display font-extrabold text-xl border-2 hard"
      style={{
        background: 'var(--c-accent)',
        color: 'var(--c-accent-on)',
        borderColor: 'var(--c-border)',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: show ? 'auto' : 'none',
        transition: 'opacity .2s ease, transform .2s ease',
      }}
    >
      ↑
    </button>
  )
}
