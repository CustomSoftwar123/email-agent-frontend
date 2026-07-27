import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Sparkline } from './charts.jsx'
import {
  IconAlert,
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconClose,
  IconMail,
  IconSearch,
} from './icons.jsx'

/* -------------------------------------------------------------- stat tiles */

// KPI tile: a 4px accent bar across the top, a tinted icon chip, then the
// value and its label.
const KPI_TONES = {
  indigo: '#6366f1',
  sky: '#0ea5e9',
  emerald: '#16a34a',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#ef4444',
}

export function StatCard({ label, value, period, hint, delta, trend, tone = 'indigo', icon, progress }) {
  const kpi = KPI_TONES[tone] ?? KPI_TONES.indigo
  const up = delta != null && delta >= 0
  const DeltaIcon = up ? IconArrowUp : IconArrowDown

  return (
    <div className="card relative overflow-hidden p-5 transition-shadow hover:shadow-pop">
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: kpi }} />

      <div className="flex items-start justify-between gap-3">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${kpi} 14%, transparent)`, color: kpi }}
        >
          {icon}
        </span>
        {trend && <Sparkline data={trend} />}
      </div>

      {/* Proportional figures — tabular-nums is for columns, not display numbers. */}
      <div className="mt-3 text-[28px] leading-none font-extrabold tracking-tight text-ink">{value}</div>
      <div className="mt-1.5 text-[13px] font-semibold text-muted">
        {label}
        {period && <span className="ml-1 font-normal text-dim">· {period}</span>}
      </div>

      {progress && progress.max > 0 && (
        // Meter: fill carries severity, track is a lighter step of the same ramp.
        <div className="mt-3 h-1.5 rounded-full bg-accent-soft overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${
              progress.value / progress.max >= 0.85 ? 'bg-warn' : 'bg-accent'
            }`}
            style={{ width: `${Math.min(100, (progress.value / progress.max) * 100)}%` }}
          />
        </div>
      )}

      {(delta != null || hint) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {delta != null && (
            <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? 'text-good-ink' : 'text-danger-ink'}`}>
              <DeltaIcon size={12} />
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-faint truncate">{hint}</span>}
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
      <div className="h-10 bg-page border-b border-line" />
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
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="animate-fade-up flex items-center gap-2.5 rounded-xl border border-line bg-raised
                       pl-3 pr-4 py-2.5 shadow-pop text-sm text-ink"
          >
            <span className={t.tone === 'bad' ? 'text-danger' : 'text-good'}>
              {t.tone === 'bad' ? <IconAlert size={16} /> : <IconCheck size={16} />}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
