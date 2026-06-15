import { useEffect, useState } from 'react'
import Rough from './Rough'

// cycles through a few "long url shortens to short url" examples,
// so the hero shows what the product does instead of sitting empty.
const EXAMPLES = [
  { long: 'github.com/royalgillz/sg-links/blob/main/README.md', short: 'readme' },
  { long: 'youtube.com/watch?v=dQw4w9WgXcQ&list=PL&index=4', short: 'song' },
  { long: 'docs.google.com/spreadsheets/d/1AbC…/edit#gid=0', short: 'budget' },
  { long: 'amazon.com/dp/B0XYZ12345?ref=ppx&pf_rd=abc', short: 'gift' },
]

export default function HeroDemo() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const t = setInterval(() => setI(v => (v + 1) % EXAMPLES.length), 2800)
    return () => clearInterval(t)
  }, [])

  const ex = EXAMPLES[i]
  const host = typeof window !== 'undefined' ? window.location.host : 'sg.li'

  return (
    <div className="relative rough-host w-full text-left">
      <Rough stroke="var(--c-border)" strokeWidth={2.2} roughness={1.8} seed={5} />
      <div className="relative z-10 p-4">
        <div key={`l${i}`} className="demo-long flex items-center gap-2 text-xs font-mono mb-2" style={{ color: 'var(--c-text-subtle)' }}>
          <span className="shrink-0 uppercase tracking-widest" style={{ fontSize: '10px' }}>long</span>
          <span className="truncate">{ex.long}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="annot text-lg shrink-0">shortens to</span>
          <span className="flex-1 border-t-2 border-dashed" style={{ borderColor: 'var(--c-border)' }} />
        </div>
        <div key={`s${i}`} className="demo-short flex items-center gap-2 font-mono font-bold mt-2" style={{ color: 'var(--c-accent-text)' }}>
          <span className="shrink-0 uppercase tracking-widest" style={{ fontSize: '10px', color: 'var(--c-text-subtle)' }}>short</span>
          <span className="truncate">{host}/{ex.short}</span>
          <span className="annot ml-auto shrink-0">✓</span>
        </div>
      </div>
    </div>
  )
}
