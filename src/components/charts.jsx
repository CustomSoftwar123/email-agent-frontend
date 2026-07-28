import { useEffect, useRef, useState } from 'react'
import { IconChart, IconTable } from './icons.jsx'

// Charts follow the house mark specs: single series (so no legend — the title
// names it), columns capped at 24px with a 4px rounded cap and a square
// baseline, a 2px surface gap between neighbours, hairline solid gridlines,
// and axis text in the muted ink token rather than the series colour.

const GAP = 2
const MAX_COL = 24

function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

/** Round a max up to a clean axis number (10 / 25 / 50 / 100 …). */
function niceMax(value) {
  if (value <= 0) return 1
  const mag = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / (mag / 2)) * (mag / 2)
}

function columnPath(x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h))
  return `M${x},${y + h}L${x},${y + rr}Q${x},${y} ${x + rr},${y}L${x + w - rr},${y}Q${x + w},${y} ${x + w},${y + rr}L${x + w},${y + h}Z`
}

/**
 * 12-point trend line for a stat tile. No axes, no labels — the tile's value
 * carries the number; this only carries the shape.
 */
export function Sparkline({ data, width = 104, height = 30, color = 'var(--accent)', ring = 'var(--surface)' }) {
  const values = data ?? []
  if (values.length < 2) return <div style={{ width, height }} />

  const pad = 4
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const x = (i) => pad + (i * (width - pad * 2)) / (values.length - 1)
  const y = (v) => height - pad - ((v - min) / span) * (height - pad * 2)

  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const area = `${line}L${x(values.length - 1).toFixed(1)},${height}L${x(0).toFixed(1)},${height}Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={area} fill={color} opacity="0.18" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* End marker carries a 2px surface ring so it stays legible over the line. */}
      <circle
        cx={x(values.length - 1)}
        cy={y(values[values.length - 1])}
        r="4"
        fill={color}
        stroke={ring}
        strokeWidth="2"
      />
    </svg>
  )
}

/**
 * Single-series column chart with a hover tooltip and a table view — the table
 * is the non-visual fallback, so nothing is gated behind reading the plot.
 */
export function ColumnChart({ data, valueLabel = 'Value', height = 200 }) {
  const [wrapRef, width] = useWidth()
  const [hover, setHover] = useState(null)
  const [asTable, setAsTable] = useState(false)

  const padL = 34
  const padR = 6
  const padT = 14
  const padB = 24
  const innerW = Math.max(0, width - padL - padR)
  const innerH = height - padT - padB

  const max = niceMax(Math.max(...data.map((d) => d.value), 1))
  const ticks = [0, max / 2, max]
  const band = data.length ? innerW / data.length : 0
  const colW = Math.max(2, Math.min(MAX_COL, band - GAP))
  const peakIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0)

  const xOf = (i) => padL + i * band + (band - colW) / 2
  const yOf = (v) => padT + innerH - (v / max) * innerH

  return (
    <div>
      <div className="flex items-center justify-end mb-1">
        <div className="inline-flex rounded-xl border border-line p-1 bg-subtle" role="group" aria-label="Chart display">
          {[
            { key: false, label: 'Chart', Icon: IconChart },
            { key: true, label: 'Table', Icon: IconTable },
          ].map(({ key, label, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => setAsTable(key)}
              aria-pressed={asTable === key}
              className={`inline-flex items-center gap-1.5 px-2 h-7 rounded-md text-xs font-medium transition-colors ${
                asTable === key ? 'bg-surface text-ink shadow-card' : 'text-faint hover:text-ink'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {asTable ? (
        <div className="max-h-[200px] overflow-auto rounded-lg border border-line">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th py-2">Day</th>
                <th className="th py-2 text-right">{valueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.label}>
                  <td className="td py-1.5">{d.label}</td>
                  <td className="td py-1.5 text-right tabular-nums text-ink">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={wrapRef} className="relative" style={{ height }}>
          {width > 0 && (
            <svg width={width} height={height} role="img" aria-label={`${valueLabel} per day`}>
              {/* Columns wear the shell gradient so the chart matches the sidebar. */}
              <defs>
                <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-from)" />
                  <stop offset="100%" stopColor="var(--chart-to)" />
                </linearGradient>
              </defs>
              {ticks.map((t) => (
                <g key={t}>
                  <line
                    x1={padL}
                    x2={width - padR}
                    y1={yOf(t)}
                    y2={yOf(t)}
                    stroke={t === 0 ? 'var(--line-strong)' : 'var(--grid)'}
                    strokeWidth="1"
                    shapeRendering="crispEdges"
                  />
                  <text
                    x={padL - 8}
                    y={yOf(t) + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--faint)"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {t}
                  </text>
                </g>
              ))}

              {data.map((d, i) => {
                const h = Math.max(1, (d.value / max) * innerH)
                const active = hover === i
                return (
                  <g key={d.label}>
                    <path
                      d={columnPath(xOf(i), yOf(d.value), colW, h, 6)}
                      fill="url(#colGrad)"
                      opacity={hover === null || active ? 1 : 0.4}
                      style={{ transition: 'opacity .12s' }}
                    />
                    {i === peakIndex && (
                      <text
                        x={xOf(i) + colW / 2}
                        y={yOf(d.value) - 5}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill="var(--ink)"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {d.value}
                      </text>
                    )}
                    {/* Hit target spans the whole band, not just the column. */}
                    <rect
                      x={padL + i * band}
                      y={padT}
                      width={band}
                      height={innerH}
                      fill="transparent"
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    />
                    {i % 2 === 0 && (
                      <text x={xOf(i) + colW / 2} y={height - 7} textAnchor="middle" fontSize="10" fill="var(--faint)">
                        {d.label}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
          )}

          {hover !== null && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line
                         bg-raised px-2.5 py-1.5 shadow-pop"
              style={{ left: xOf(hover) + colW / 2, top: yOf(data[hover].value) - 8 }}
            >
              <div className="text-[11px] text-faint whitespace-nowrap">{data[hover].label}</div>
              <div className="text-sm font-semibold text-ink tabular-nums">
                {data[hover].value} <span className="font-normal text-muted">{valueLabel.toLowerCase()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
