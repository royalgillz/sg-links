import { useState, useEffect } from 'react'
import Rough from './Rough'
import Reveal from './Reveal'
import CountUp from './CountUp'

const FEATURES = [
  { title: 'base62 + bloom filter', desc: 'Short codes generated fast, with an in-memory negative check before the DB.' },
  { title: 'live analytics', desc: 'Per-click referrer, browser, OS and country, with a time-series chart.' },
  { title: 'ai slug ideas', desc: 'Three memorable slug suggestions, one click away.' },
  { title: 'password + expiry', desc: 'BCrypt-gated links and TTLs from a day to a year.' },
  { title: 'qr codes', desc: 'Download as PNG or SVG, generated in the browser.' },
  { title: 'link-in-bio', desc: 'A public page at /u/you listing all your links.' },
  { title: 'browser extension', desc: 'Chrome extension to shorten the current tab in one click.' },
  { title: 'bulk shorten', desc: 'Up to 20 URLs in a single paste.' },
  { title: 'rest api + keys', desc: 'Full API with hashed keys that skip the rate limiter.' },
]

const FAQ_ITEMS = [
  { q: 'Is it free?', a: 'Yes, completely free and open source.' },
  { q: 'Do I need an account?', a: 'No. Anonymous shortening works. Create an account to manage your links.' },
  { q: 'How long do links last?', a: 'Forever by default. You can set an expiry from 1 day to 1 year.' },
  { q: 'Can I use a custom alias?', a: 'Yes, type it in the alias field. AI suggestions are behind the ✦ button.' },
  { q: 'Is there an API?', a: 'Yes, a full REST API documented at /swagger-ui.html. Generate API keys in the app.' },
  {
    q: 'Is the source code available?',
    a: (
      <>
        Yes,{' '}
        <a href="https://github.com/royalgillz/sg-links" target="_blank" rel="noopener noreferrer"
           className="underline underline-offset-2" style={{ color: 'var(--c-accent-text)' }}>
          view on GitHub
        </a>.
      </>
    ),
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card-ink overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-5 py-4 text-left"
              style={{ background: open ? 'var(--c-surface-hover)' : 'transparent' }}>
        <span className="text-sm font-mono font-bold" style={{ color: 'var(--c-text)' }}>{q}</span>
        <span className="annot text-2xl shrink-0 ml-3" style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 border-t-2" style={{ borderColor: 'var(--c-border)' }}>
          <p className="copy text-sm" style={{ color: 'var(--c-text-muted)' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

function Step({ n, title, children, note }) {
  return (
    <div className="lift relative rough-host flex-1 p-6 text-center">
      <Rough stroke="var(--c-border)" strokeWidth={2.4} roughness={1.7} seed={n * 5} hover />
      <div className="relative z-10">
        <div className="annot absolute -top-3 -left-1 text-3xl">{note}</div>
        <div className="w-11 h-11 mx-auto mb-3 card-ink flex items-center justify-center font-display font-extrabold text-lg"
             style={{ background: 'var(--c-accent)', color: 'var(--c-accent-on)' }}>{n}</div>
        <h3 className="font-mono font-bold mb-1.5" style={{ color: 'var(--c-text)' }}>{title}</h3>
        <p className="copy text-sm" style={{ color: 'var(--c-text-muted)' }}>{children}</p>
      </div>
    </div>
  )
}

function SectionHead({ title, note }) {
  return (
    <div className="flex items-baseline justify-center gap-3 flex-wrap mb-10">
      <h2 className="font-display font-extrabold text-center" style={{ fontSize: 'clamp(1.7rem,4vw,2.2rem)', color: 'var(--c-text)' }}>{title}</h2>
      {note && <span className="annot text-2xl" style={{ transform: 'rotate(-2deg)' }}>{note}</span>}
    </div>
  )
}

export default function LandingContent() {
  const [globalStats, setGlobalStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setGlobalStats)
      .catch(() => setGlobalStats(null))
      .finally(() => setStatsLoading(false))
  }, [])

  return (
    <div className="paper-grid border-t-2" style={{ borderColor: 'var(--c-border)' }}>

      {/* how it works */}
      <section className="max-w-4xl mx-auto px-5 py-16">
        <SectionHead title="How it works" note="" />
        <Reveal>
          <div className="flex flex-col sm:flex-row items-stretch gap-5">
            <Step n={1} title="Paste your URL" note="">Drop any long URL into the field and hit shorten.</Step>
            <div className="self-center text-2xl font-mono" style={{ color: 'var(--c-text-subtle)' }}>→</div>
            <Step n={2} title="Customize" note="optional!">Set an alias, expiry, password, or grab an AI slug.</Step>
            <div className="self-center text-2xl font-mono" style={{ color: 'var(--c-text-subtle)' }}>→</div>
            <Step n={3} title="Share & track" note="">Share the link and watch clicks roll in live.</Step>
          </div>
        </Reveal>
      </section>

      {/* features */}
      <section className="max-w-4xl mx-auto px-5 py-16">
        <SectionHead title="Everything, sketched in" note="" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 70}>
              <div className="lift relative rough-host p-5 h-full">
                <Rough stroke="var(--c-border)" strokeWidth={2.2} roughness={1.8} seed={i + 11} hover />
                <div className="relative z-10">
                  <span className="annot text-3xl">✓</span>
                  <h3 className="font-mono font-bold text-sm mt-1 mb-1.5" style={{ color: 'var(--c-text)' }}>{f.title}</h3>
                  <p className="copy text-[13px] leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{f.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* by the numbers */}
      {(statsLoading || globalStats) && (
        <section className="max-w-4xl mx-auto px-5 py-16">
          <SectionHead title="By the numbers" note="" />
          <div className="grid grid-cols-2 gap-5 max-w-md mx-auto">
            {[
              { val: globalStats?.totalUrls, label: 'links shortened' },
              { val: globalStats?.totalClicks, label: 'clicks tracked' },
            ].map(({ val, label }) => (
              <div key={label} className="lift relative rough-host p-6 text-center">
                <Rough stroke="var(--c-border)" strokeWidth={2.4} roughness={1.7} seed={label.length} hover />
                <div className="relative z-10">
                  {statsLoading
                    ? <div className="h-9 w-20 mx-auto animate-pulse" style={{ background: 'var(--c-surface-hover)' }} />
                    : <span className="font-display font-extrabold text-3xl" style={{ color: 'var(--c-accent-text)' }}><CountUp value={val} /></span>}
                  <p className="text-xs font-mono mt-1" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* faq */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <SectionHead title="Questions" note="" />
        <Reveal>
          <div className="space-y-2.5">
            {FAQ_ITEMS.map(item => <FaqItem key={item.q} q={item.q} a={item.a} />)}
          </div>
        </Reveal>
      </section>

      {/* footer */}
      <footer className="border-t-2" style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}>
        <div className="max-w-4xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-mono font-bold text-sm" style={{ color: 'var(--c-text)' }}>sg/links</p>
            <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--c-text-muted)' }}>open source, built with Spring Boot and React</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--c-text-muted)' }}>
            <a href="https://github.com/royalgillz/sg-links" target="_blank" rel="noopener noreferrer" className="hover:underline">github ↗</a>
            <span>·</span>
            <a href="/swagger-ui.html" className="hover:underline">api docs ↗</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
