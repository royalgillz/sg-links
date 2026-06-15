import { useEffect, useState } from 'react'
import Rough from './Rough'
import CountUp from './CountUp'

// compact live-stats card for the hero right column
export default function HeroStats() {
  const [s, setS] = useState(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setS)
      .catch(() => {})
  }, [])

  if (!s) return null

  return (
    <div className="relative rough-host w-full">
      <Rough stroke="var(--c-border)" strokeWidth={2.2} roughness={1.8} seed={9} />
      <div className="relative z-10 p-4 flex items-center gap-6">
        <span className="flex items-center gap-1.5 text-xs font-mono shrink-0" style={{ color: 'var(--c-text-subtle)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--c-accent)' }} />
          live
        </span>
        <div>
          <div className="font-display font-extrabold text-2xl leading-none" style={{ color: 'var(--c-accent-text)' }}>
            <CountUp value={s.totalUrls} />
          </div>
          <div className="text-[11px] font-mono mt-1" style={{ color: 'var(--c-text-muted)' }}>links shortened</div>
        </div>
        <div>
          <div className="font-display font-extrabold text-2xl leading-none" style={{ color: 'var(--c-accent-text)' }}>
            <CountUp value={s.totalClicks} />
          </div>
          <div className="text-[11px] font-mono mt-1" style={{ color: 'var(--c-text-muted)' }}>clicks tracked</div>
        </div>
      </div>
    </div>
  )
}
