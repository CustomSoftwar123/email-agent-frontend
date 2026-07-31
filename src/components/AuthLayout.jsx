import { useState } from 'react'
import { BRAND, BrandLock } from './brand.jsx'
import { useTheme } from '../lib/theme.jsx'
import {
  IconAlert,
  IconBolt,
  IconChat,
  IconCheck,
  IconMail,
  IconMoon,
  IconShield,
  IconStar,
  IconSun,
} from './icons.jsx'

// What the agent actually does — no invented customer counts or star ratings.
const FEATURES = [
  { Icon: IconChat, label: 'Replies in your company’s voice' },
  { Icon: IconStar, label: 'Captures warm and hot leads' },
  { Icon: IconMail, label: 'Gmail, Outlook and IMAP' },
  { Icon: IconBolt, label: 'Every mailbox in one workspace' },
]

const FACTS = [
  { value: '24/7', label: 'Inbox watch' },
  { value: '30s', label: 'Check interval' },
  { value: '3', label: 'Mail providers' },
]

/**
 * The shell Login and Signup share: brand story on the left, form on the right.
 * The left panel is hidden below lg — on a phone the form is the whole point,
 * and a compact brand lock sits above it instead.
 */
export default function AuthLayout({ eyebrow, title, subtitle, notice, error, children, footer }) {
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-page lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* ── brand panel ─────────────────────────────────────────────────── */}
      <aside
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-12 text-white"
        style={{ backgroundColor: 'var(--accent)', backgroundImage: 'var(--accent-gradient)' }}
      >
        {/* Two soft lights so the fill doesn't read flat. */}
        <span className="pointer-events-none absolute -left-24 -top-24 w-80 h-80 rounded-full"
              style={{ background: 'rgba(255,255,255,0.10)' }} />
        <span className="pointer-events-none absolute -right-28 bottom-0 w-96 h-96 rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)' }} />

        <div className="relative">
          <BrandLock tone="light" size="lg" />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[34px] xl:text-[38px] font-bold leading-[1.12] tracking-tight">
            The inbox that
            <br />
            answers itself.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/75">
            Corvo watches every mailbox you connect, replies to each new lead in your
            company’s voice, and files the warm ones — without anyone opening a tab.
          </p>

          <ul className="mt-8 space-y-3.5">
            {FEATURES.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/12 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={15} />
                </span>
                <span className="text-[15px] font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <dl className="flex gap-10 pt-7 border-t border-white/15">
            {FACTS.map((f) => (
              <div key={f.label}>
                <dt className="text-[26px] font-bold leading-none">{f.value}</dt>
                <dd className="mt-1.5 text-xs text-white/60">{f.label}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-7 inline-flex items-center gap-2 text-xs text-white/65">
            <IconShield size={14} />
            Mailbox credentials stay on your own server.
          </p>
        </div>
      </aside>

      {/* ── form panel ──────────────────────────────────────────────────── */}
      <main className="relative flex items-center justify-center px-5 py-12 sm:px-10">
        <button
          className="btn-icon absolute top-5 right-5"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>

        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="lg:hidden mb-8">
            <BrandLock />
          </div>

          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-ink mb-2">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-ink leading-tight">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-faint">{subtitle}</p>}

          {notice && !error && (
            <p
              className="mt-6 flex items-start gap-2 rounded-xl bg-good-soft px-3.5 py-3 text-[13px]
                         font-medium text-good-ink"
              role="status"
            >
              <IconCheck size={16} className="shrink-0 mt-px" />
              {notice}
            </p>
          )}

          {error && (
            <p
              className="mt-6 flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-3 text-[13px]
                         font-medium text-danger-ink"
              role="alert"
            >
              <IconAlert size={16} className="shrink-0 mt-px" />
              {error}
            </p>
          )}

          <div className="mt-7">{children}</div>

          {footer && <p className="mt-7 text-center text-sm text-faint">{footer}</p>}

          <p className="mt-10 text-center text-[11px] text-dim lg:hidden">
            {BRAND.name} — {BRAND.tagline}
          </p>
        </div>
      </main>
    </div>
  )
}

/* ----------------------------------------------------------------- fields */

/** Labelled input with a leading icon, matching the house .input styling. */
export function Field({ id, label, icon, hint, className = '', ...props }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim pointer-events-none">
            {icon}
          </span>
        )}
        <input id={id} className={`input ${icon ? 'pl-11' : ''}`} {...props} />
      </div>
      {hint && <p className="hint mt-1.5">{hint}</p>}
    </div>
  )
}

/** Password input with a reveal toggle. */
export function PasswordField({ id, label, hint, className = '', ...props }) {
  const [shown, setShown] = useState(false)
  return (
    <div className={className}>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim pointer-events-none">
          <IconLock />
        </span>
        <input id={id} type={shown ? 'text' : 'password'} className="input pl-11 pr-11" {...props} />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center
                     justify-center text-dim hover:text-ink hover:bg-subtle transition-colors"
          aria-label={shown ? 'Hide password' : 'Show password'}
          title={shown ? 'Hide password' : 'Show password'}
        >
          <IconEye open={shown} />
        </button>
      </div>
      {hint && <p className="hint mt-1.5">{hint}</p>}
    </div>
  )
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function IconEye({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
      {!open && <path d="M4 20 20 4" />}
    </svg>
  )
}
