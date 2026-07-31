import { useEffect, useRef, useState } from 'react'
import { IconChart, IconTable } from './icons.jsx'

// Charts follow the house mark specs: columns capped at 24px with a 4px rounded
// cap and a square baseline, a 2px surface gap between neighbours, hairline
// solid gridlines, and axis text in the muted ink token rather than the series
// colour. Series colours come from --series-N, assigned in fixed order so a
// series keeps its hue whatever else is on the plot.

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

/** Identity you can read without matching colours by eye. */
function Legend({ series }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {series.map((s) => (
        <li key={s.key} className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: s.color }} />
          {s.label}
        </li>
      ))}
    </ul>
  )
}

function ViewToggle({ asTable, setAsTable }) {
  return (
    <div className="inline-flex rounded-xl border border-line p-1 bg-subtle shrink-0" role="group" aria-label="Chart display">
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
  )
}

/**
 * Grouped column chart over a shared baseline — one group per period, one
 * column per series. A single series draws no legend (the card title names it);
 * two or more always do, so identity never rests on colour alone. The table
 * view is the non-visual twin, so no value is gated behind reading the plot.
 *
 *   data   [{ label: 'Jul 29', values: { sent: 4, replies: 2 } }, …]
 *   series [{ key: 'sent', label: 'Sent', color: 'var(--series-1)' }, …]
 */
export function ColumnChart({ data, series, height = 240, labelEvery = 2 }) {
  const [wrapRef, width] = useWidth()
  const [hover, setHover] = useState(null)
  const [asTable, setAsTable] = useState(false)

  const padL = 34
  const padR = 6
  const padT = 18
  const padB = 24
  const innerW = Math.max(0, width - padL - padR)
  const innerH = height - padT - padB

  const peak = Math.max(...data.flatMap((d) => series.map((s) => d.values[s.key] ?? 0)), 1)
  const max = niceMax(peak)
  const ticks = [0, max / 2, max]
  const band = data.length ? innerW / data.length : 0
  // Each group keeps a gap on both sides, so neighbouring days stay separate
  // without a stroke drawn round anything.
  const colW = Math.max(2, Math.min(MAX_COL, (band - GAP * (series.length + 1)) / series.length))
  const groupW = colW * series.length + GAP * (series.length - 1)

  const xOf = (i, si) => padL + i * band + (band - groupW) / 2 + si * (colW + GAP)
  const yOf = (v) => padT + innerH - (v / max) * innerH

  // Label the tallest column of the lead series only — a number on every point
  // is chaos and goes unread.
  const lead = series[0].key
  const peakIndex = data.reduce(
    (best, d, i) => ((d.values[lead] ?? 0) > (data[best].values[lead] ?? 0) ? i : best), 0)
  const peakValue = data[peakIndex]?.values[lead] ?? 0

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
        {series.length > 1 ? <Legend series={series} /> : <span />}
        <ViewToggle asTable={asTable} setAsTable={setAsTable} />
      </div>

      {asTable ? (
        <div className="overflow-auto rounded-lg border border-line" style={{ maxHeight: height }}>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th py-2">Day</th>
                {series.map((s) => (
                  <th key={s.key} className="th py-2 text-right">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.label}>
                  <td className="td py-1.5">{d.label}</td>
                  {series.map((s) => (
                    <td key={s.key} className="td py-1.5 text-right tabular-nums text-ink">
                      {d.values[s.key] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={wrapRef} className="relative" style={{ height }}>
          {width > 0 && (
            <svg width={width} height={height} role="img"
                 aria-label={`${series.map((s) => s.label).join(' and ')} per day`}>
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
                const active = hover === i
                return (
                  <g key={d.label}>
                    {series.map((s, si) => {
                      const v = d.values[s.key] ?? 0
                      if (v <= 0) return null
                      return (
                        <path
                          key={s.key}
                          d={columnPath(xOf(i, si), yOf(v), colW, Math.max(1, (v / max) * innerH), 4)}
                          fill={s.color}
                          opacity={hover === null || active ? 1 : 0.35}
                          style={{ transition: 'opacity .12s' }}
                        />
                      )
                    })}

                    {i === peakIndex && peakValue > 0 && (
                      <text
                        x={xOf(i, 0) + colW / 2}
                        y={yOf(peakValue) - 6}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill="var(--ink)"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {peakValue}
                      </text>
                    )}

                    {/* Hit target spans the whole band, not just the columns. */}
                    <rect
                      x={padL + i * band}
                      y={padT}
                      width={band}
                      height={innerH}
                      fill="transparent"
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    />

                    {i % labelEvery === 0 && (
                      <text x={padL + i * band + band / 2} y={height - 7} textAnchor="middle"
                            fontSize="10" fill="var(--faint)">
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
                         bg-raised px-3 py-2 shadow-pop min-w-[132px]"
              style={{
                left: Math.min(Math.max(padL + hover * band + band / 2, 70), width - 70),
                top: padT - 6,
              }}
            >
              <div className="text-[11px] text-faint whitespace-nowrap mb-1">{data[hover].label}</div>
              {series.map((s) => (
                <div key={s.key} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-[2px] shrink-0" style={{ background: s.color }} />
                  <span className="text-[11px] text-muted flex-1">{s.label}</span>
                  <span className="text-[13px] font-semibold text-ink tabular-nums">
                    {data[hover].values[s.key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Horizontal bars for a handful of named categories — the right form when the
 * labels matter more than the shape and there are too few points for a plot.
 * Every value is direct-labelled at the bar end, so there is nothing to hover
 * for and no table twin needed.
 */
export function BarList({ items, emptyLabel = 'Nothing yet.' }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  const total = items.reduce((sum, i) => sum + i.value, 0)

  if (!total) {
    return <p className="py-8 text-center text-sm text-faint">{emptyLabel}</p>
  }

  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-[13px] font-medium text-muted capitalize">{item.label}</span>
            <span className="text-[13px] font-semibold text-ink tabular-nums">
              {item.value}
              <span className="ml-1.5 text-[11px] font-normal text-faint">
                {Math.round((item.value / total) * 100)}%
              </span>
            </span>
          </div>
          {/* Track is the surface doing the work; the fill is rounded at the
              data end and square at the baseline, like every other mark. */}
          <div className="h-2 rounded-full bg-subtle overflow-hidden"
               role="img" aria-label={`${item.label}: ${item.value}`}>
            {item.value > 0 && (
              <div
                className="h-full rounded-r-full transition-[width] duration-500"
                style={{ width: `${Math.max(3, (item.value / max) * 100)}%`, background: item.color }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
