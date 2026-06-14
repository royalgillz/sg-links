import { useEffect, useRef, useState } from 'react'

// counts from 0 up to `value` the first time it scrolls into view
export default function CountUp({ value, duration = 1100 }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setN(value); return }

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1)
        // ease-out so it decelerates into the final number
        const eased = 1 - Math.pow(1 - t, 3)
        setN(Math.round(value * eased))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])

  return <span ref={ref}>{n.toLocaleString()}</span>
}
