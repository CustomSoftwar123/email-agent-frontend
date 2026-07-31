import { useEffect, useRef } from 'react'

/**
 * The one dialog shape for anything the user must acknowledge or confirm:
 * a drawn glyph, a centred title, a sentence, and one or two buttons.
 *
 * Give it `onConfirm` and it becomes a confirmation (Cancel + action);
 * without one it is an acknowledgement (a single OK).
 *
 * Escape always cancels. Enter confirms, or dismisses an acknowledgement —
 * so the common case never needs the mouse.
 */
const VARIANTS = {
  success: { tone: 'var(--good)', glyph: 'tick' },
  warning: { tone: 'var(--warn)', glyph: 'bang' },
  danger: { tone: 'var(--danger)', glyph: 'bang' },
  info: { tone: 'var(--accent)', glyph: 'info' },
}

export default function AlertDialog({
  open,
  variant = 'success',
  title,
  message,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  okLabel = 'OK',
  confirmTone,
  onConfirm,
  onClose,
  busy = false,
}) {
  const primary = useRef(null)
  const isConfirm = typeof onConfirm === 'function'
  const { tone, glyph } = VARIANTS[variant] ?? VARIANTS.success
  // A destructive action wears the danger colour whatever the glyph says.
  const actionTone = confirmTone
    ?? (variant === 'danger' || variant === 'warning' ? 'var(--danger)' : 'var(--accent)')

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && !busy) (isConfirm ? onConfirm : onClose)()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    primary.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, busy, isConfirm, onConfirm, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md card shadow-pop animate-fade-up px-6 py-8 text-center"
      >
        <Glyph kind={glyph} tone={tone} />

        <h2 className="mt-5 text-2xl font-bold text-ink">{title}</h2>
        {message && <p className="mt-3 text-sm text-muted leading-relaxed">{message}</p>}

        <div className="mt-7 flex justify-center gap-3">
          {isConfirm && (
            <button className="btn-secondary min-w-[110px] justify-center" onClick={onClose}>
              {cancelLabel}
            </button>
          )}
          <button
            ref={primary}
            className="btn min-w-[110px] justify-center text-white"
            style={{ background: isConfirm ? actionTone : 'var(--action)',
                     color: isConfirm ? '#fff' : 'var(--action-ink)' }}
            disabled={busy}
            onClick={isConfirm ? onConfirm : onClose}
          >
            {busy ? 'Working…' : isConfirm ? confirmLabel : okLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Ring plus mark, each drawn on open rather than simply appearing. */
function Glyph({ kind, tone }) {
  return (
    <svg className="mx-auto block h-[88px] w-[88px]" viewBox="0 0 88 88"
         style={{ color: tone }} aria-hidden="true">
      <circle className="alert-ring" cx="44" cy="44" r="40" fill="none" strokeWidth="3" />

      {kind === 'tick' && (
        <path className="alert-mark" d="M26 45.5 L38.5 58 L62 32" fill="none"
              strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {kind === 'bang' && (
        <>
          <path className="alert-mark" d="M44 26 L44 48" fill="none"
                strokeWidth="5" strokeLinecap="round" />
          <circle className="alert-dot" cx="44" cy="60" r="3.2" />
        </>
      )}

      {kind === 'info' && (
        <>
          <path className="alert-mark" d="M44 40 L44 62" fill="none"
                strokeWidth="5" strokeLinecap="round" />
          <circle className="alert-dot" cx="44" cy="28" r="3.2" />
        </>
      )}
    </svg>
  )
}
