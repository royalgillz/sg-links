import { useEffect, useRef, useState } from 'react'

// fades + slides its children in once they scroll into view
export default function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
