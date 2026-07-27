import { useEffect, useRef } from 'react'
import { IconClose } from './icons.jsx'

/**
 * Centred dialog with a backdrop. Closes on Escape and on backdrop click,
 * and moves focus inside on open.
 */
export default function Modal({ open, onClose, title, subtitle, footer, children, width = 'max-w-lg' }) {
  const panel = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector('input, textarea, button')?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${width} my-8 card shadow-pop animate-fade-up`}
      >
        <header className="card-head">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-faint">{subtitle}</p>}
          </div>
          <button className="btn-icon -mr-2" onClick={onClose} aria-label="Close">
            <IconClose size={17} />
          </button>
        </header>

        <div className="p-5">{children}</div>

        {footer && <footer className="flex items-center justify-end gap-2 px-5 py-4 border-t border-line">{footer}</footer>}
      </div>
    </div>
  )
}
