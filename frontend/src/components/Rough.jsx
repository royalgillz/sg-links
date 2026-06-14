import { useEffect, useRef } from 'react'
import rough from 'roughjs'

// read a resolved css custom property off :root
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function resolve(v) {
  return v && v.startsWith('var(') ? cssVar(v.slice(4, -1)) : v
}

function roundedRectPath(x, y, w, h, r) {
  return `M${x + r},${y} h${w - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - 2 * r} a${r},${r} 0 0 1 ${-r},${r} h${-(w - 2 * r)} a${r},${r} 0 0 1 ${-r},${-r} v${-(h - 2 * r)} a${r},${r} 0 0 1 ${r},${-r} z`
}

// hand-drawn border drawn with rough.js as an svg sized to its parent.
// the parent must be position:relative; put real content above it with z-10.
export default function Rough({
  shape = 'rect',
  stroke = 'var(--c-border)',
  fill = null,
  fillStyle = 'hachure',
  strokeWidth = 2.2,
  roughness = 1.8,
  bowing = 1.2,
  radius = 0,
  pad = 3,
  seed = 1,
  hover = false,
}) {
  const ref = useRef(null)
  const seedOffset = useRef(0)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const parent = svg.parentElement
    let raf = 0

    const draw = () => {
      const w = parent.clientWidth
      const h = parent.clientHeight
      if (!w || !h) return
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      const rc = rough.svg(svg)
      const opts = {
        stroke: resolve(stroke),
        strokeWidth,
        roughness,
        bowing,
        seed: seed + seedOffset.current,
        fill: fill ? resolve(fill) : undefined,
        fillStyle,
        fillWeight: 1.5,
        hachureGap: 6,
      }

      const x = pad, y = pad, ww = w - pad * 2, hh = h - pad * 2
      let node
      if (shape === 'underline') {
        node = rc.path(`M${x},${h * 0.62} C${w * 0.3},${h * 0.15} ${w * 0.62},${h * 0.95} ${w - x},${h * 0.38}`, opts)
      } else if (radius > 0) {
        node = rc.path(roundedRectPath(x, y, ww, hh, radius), opts)
      } else {
        node = rc.rectangle(x, y, ww, hh, opts)
      }
      if (node) svg.appendChild(node)
    }

    // batch redraws on the next frame
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw) }

    const ro = new ResizeObserver(schedule)
    ro.observe(parent)
    // theme toggle dispatches this so we can re-pull the new colors
    window.addEventListener('themechange', schedule)
    if (document.fonts?.ready) document.fonts.ready.then(schedule)
    schedule()

    // re-sketch the border with a fresh seed each time the parent is hovered
    const onEnter = () => { seedOffset.current = (seedOffset.current + 1) % 89; schedule() }
    if (hover) parent.addEventListener('mouseenter', onEnter)

    return () => {
      ro.disconnect()
      window.removeEventListener('themechange', schedule)
      if (hover) parent.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(raf)
    }
  }, [shape, stroke, fill, fillStyle, strokeWidth, roughness, bowing, radius, pad, seed, hover])

  return <svg ref={ref} className="rough-svg" preserveAspectRatio="none" aria-hidden="true" />
}
