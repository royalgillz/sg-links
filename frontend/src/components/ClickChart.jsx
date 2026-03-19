export default function ClickChart({ clicksByDay }) {
  if (!clicksByDay || clicksByDay.length === 0) return null

  // Fill in all days in the range so gaps show as zero bars
  const first = new Date(clicksByDay[0].date)
  const last = new Date(clicksByDay[clicksByDay.length - 1].date)
  const countMap = Object.fromEntries(clicksByDay.map(d => [d.date, d.count]))

  const days = []
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, count: countMap[key] ?? 0 })
  }

  const maxCount = Math.max(...days.map(d => d.count), 1)
  const BAR_W = 10
  const GAP = 3
  const H = 60
  const width = days.length * (BAR_W + GAP)

  return (
    <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--c-border)' }}>
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--c-text-muted)' }}>Clicks over time</p>
      <div className="overflow-x-auto">
        <svg
          width={Math.max(width, 200)}
          height={H + 20}
          className="block"
        >
          {days.map((d, i) => {
            const barH = Math.max((d.count / maxCount) * H, d.count > 0 ? 3 : 0)
            const x = i * (BAR_W + GAP)
            const y = H - barH
            const isLast = i === days.length - 1
            const showLabel = i === 0 || isLast || days.length <= 14

            return (
              <g key={d.date}>
                <title>{d.date}: {d.count} click{d.count !== 1 ? 's' : ''}</title>
                <rect
                  x={x}
                  y={y}
                  width={BAR_W}
                  height={barH}
                  rx={2}
                  className="fill-violet-500/70 hover:fill-violet-400 transition-colors"
                />
                {showLabel && (
                  <text
                    x={x + BAR_W / 2}
                    y={H + 14}
                    textAnchor="middle"
                    fontSize={8}
                    fill="var(--c-text-subtle)"
                  >
                    {d.date.slice(5)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
