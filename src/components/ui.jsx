import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Sparkline } from './charts.jsx'
import {
  IconAlert,
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconClose,
  IconInfo,
  IconMail,
  IconSearch,
} from './icons.jsx'

/* -------------------------------------------------------------- stat tiles */

/**
 * KPI tile — a quiet surface panel. Saturated colour is spent on small marks
 * only: the icon chip on the one `primary` metric, the sparkline, and the delta
 * pill where the colour actually means something (up/down). Text always wears
 * text tokens, never a data colour, so every theme preset restyles it for free.
 *
 * `delta` is a percentage against the previous period, or null when there is no
 * earlier period to compare against — in which case nothing is claimed.
 */
// Tinted chips, not filled panels: the hue identifies the metric, the ink stays
// a text token, and every step comes from the theme so presets restyle it.
const CHIP_TONES = {
  accent: 'bg-accent-soft text-accent-ink',
  info: 'bg-info-soft text-info-ink',
  violet: 'bg-violet-soft text-violet-ink',
  good: 'bg-good-soft text-good-ink',
  warn: 'bg-warn-soft text-warn-ink',
  neutral: 'bg-subtle text-faint',
}

export function StatCard({
  label, value, period, hint, delta, deltaLabel = 'vs previous 7 days',
  trend, trendColor, icon, progress, tone = 'accent', primary = false,
}) {
  const hasDelta = delta != null
  const rising = hasDelta && delta > 0
  const falling = hasDelta && delta < 0
  const DeltaIcon = rising ? IconArrowUp : IconArrowDown
  // Every metric here is one where more is better, so direction maps to status.
  const deltaTone = rising ? 'bg-good-soft text-good-ink'
    : falling ? 'bg-danger-soft text-danger-ink'
    : 'bg-subtle text-faint'

  return (
    <div className="card relative overflow-hidden p-5 flex flex-col transition-all duration-200 hover:border-line-strong hover:-translate-y-0.5">
      {/* The lead metric carries a hairline of its own colour along the top. */}
      {primary && (
        <span
          className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
          style={{ background: 'var(--accent)' }}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          CHIP_TONES[tone] ?? CHIP_TONES.accent}`}>
          {icon}
        </span>
        {trend && <Sparkline data={trend} color={trendColor ?? 'var(--accent)'} />}
      </div>

      {/* Proportional figures — tabular-nums is for columns, not display numbers. */}
      <div className="mt-4 text-[30px] leading-none font-semibold tracking-tight text-ink">{value}</div>
      <p className="mt-2 text-[13px] font-medium text-muted">
        {label}
        {period && <span className="text-faint"> · {period}</span>}
      </p>

      {progress && progress.max > 0 && (
        // Track is a lighter step of the fill's own ramp, so the state reads
        // across the whole bar rather than only where it is filled.
        <div className="mt-4 h-1.5 rounded-full bg-accent-soft overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${Math.min(100, (progress.value / progress.max) * 100)}%` }}
          />
        </div>
      )}

      {(hasDelta || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-faint min-w-0">
          {hasDelta && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold rounded-full px-1.5 py-0.5 shrink-0 ${deltaTone}`}
              title={deltaLabel}
            >
              {delta !== 0 && <DeltaIcon size={11} />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="truncate">{hint}</span>}
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------- badges */

// Status colour never carries meaning alone — every badge ships a dot mark and
// a text label, which is also the relief for the sub-3:1 warning step on light.
const TONES = {
  connected: 'bg-good-soft text-good-ink',
  active: 'bg-good-soft text-good-ink',
  error: 'bg-danger-soft text-danger-ink',
  paused: 'bg-warn-soft text-warn-ink',
  queued: 'bg-subtle text-faint',
  sent: 'bg-info-soft text-info-ink',
  replied: 'bg-violet-soft text-violet-ink',
  bounced: 'bg-danger-soft text-danger-ink',
  cold: 'bg-subtle text-faint',
  warm: 'bg-warn-soft text-warn-ink',
  hot: 'bg-danger-soft text-danger-ink',
}

const DOTS = {
  connected: 'bg-good',
  active: 'bg-good',
  error: 'bg-danger',
  paused: 'bg-warn',
  queued: 'bg-faint',
  sent: 'bg-info',
  replied: 'bg-violet',
  bounced: 'bg-danger',
  cold: 'bg-dim',
  warm: 'bg-warn',
  hot: 'bg-danger',
}

export function StatusBadge({ value }) {
  return (
    <span className={`badge ${TONES[value] || 'bg-subtle text-faint'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOTS[value] || 'bg-dim'}`} />
      {value}
    </span>
  )
}

const PROVIDERS = {
  gmail: { label: 'Gmail', className: 'text-danger' },
  outlook: { label: 'Outlook', className: 'text-accent' },
  imap: { label: 'IMAP / SMTP', className: 'text-faint' },
}

export function ProviderTag({ provider }) {
  const p = PROVIDERS[provider] || { label: provider, className: 'text-faint' }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
      <IconMail size={15} className={p.className} />
      {p.label}
    </span>
  )
}

/* ---------------------------------------------------------------- avatars */

const AVATAR_TONES = [
  'bg-accent-soft text-accent-ink',
  'bg-violet-soft text-violet-ink',
  'bg-good-soft text-good-ink',
  'bg-warn-soft text-warn-ink',
  'bg-danger-soft text-danger-ink',
]

export function Avatar({ name = '', size = 36 }) {
  const initials = name
    .replace(/@.*/, '')
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 ${
        AVATAR_TONES[hash % AVATAR_TONES.length]
      }`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  )
}

/* --------------------------------------------------------- loading / empty */

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 4, cols = 4 }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-9 bg-subtle border-b border-line" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5 border-b border-line last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-3.5 ${c === 0 ? 'w-40' : 'w-24'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function Empty({ title, hint, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-line-strong py-14 px-6">
      <div className="w-11 h-11 rounded-full bg-page text-faint flex items-center justify-center mb-3">
        {icon || <IconSearch size={20} />}
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint && <p className="mt-1 text-xs text-faint max-w-xs">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------- primitives */

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
      <input
        className="input pl-9"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-faint hover:text-ink"
          aria-label="Clear search"
        >
          <IconClose size={14} />
        </button>
      )}
    </div>
  )
}

export function Card({ title, subtitle, actions, children, className = '', bodyClass = 'p-5' }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-head">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-faint">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  )
}

export function Switch({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
          checked ? 'bg-accent' : 'bg-line-strong'
        }`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white shadow-card transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
      <span className="min-w-0">
        <span className="block text-sm text-ink">{label}</span>
        {hint && <span className="block text-xs text-faint mt-0.5">{hint}</span>}
      </span>
    </label>
  )
}

/* ----------------------------------------------------------------- toasts */

// The panel stays a normal surface card and the colour goes into one small
// solid chip. A tinted panel washes out — especially in dark mode, where the
// soft steps are barely 16% opacity — while a saturated mark stays crisp and
// the message keeps full ink contrast.
const TOAST_TONES = {
  good: { colour: 'var(--good)', Icon: IconCheck },
  bad: { colour: 'var(--danger)', Icon: IconAlert },
  warn: { colour: 'var(--warn)', Icon: IconAlert },
  info: { colour: 'var(--accent)', Icon: IconInfo },
}

const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, tone = 'good') => {
    const id = ++toastId
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const value = useMemo(() => push, [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Top right: above the fold, where the eye already is after an action. */}
      <div className="fixed top-5 right-5 z-[70] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const { colour, Icon } = TOAST_TONES[t.tone] ?? TOAST_TONES.good
          return (
            <div
              key={t.id}
              role="status"
              className="animate-toast-in flex items-center gap-3 rounded-xl border border-line
                         bg-surface pl-2.5 pr-4 py-2.5 shadow-pop max-w-sm"
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
                style={{ background: colour }}
              >
                <Icon size={15} />
              </span>
              <span className="min-w-0 text-[13.5px] font-medium text-ink">{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
