/**
 * Corvo — the raven, the original carrier of messages.
 *
 * The mark is an envelope whose flap sweeps off its top-right corner as a wing:
 * a message in flight. Drawn inline as SVG rather than shipped as an image, so
 * it stays sharp at any size, inherits the surrounding text colour, and costs
 * no extra request.
 */
export const BRAND = {
  name: 'Corvo',
  kicker: 'AI email agent',
  tagline: 'Your smartest messenger.',
}

export function CorvoMark({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3" y="10" width="19" height="14" rx="3.5"
        stroke="currentColor" strokeWidth="2.2"
      />
      <path
        d="M4.6 12.4 12.5 18.3 20.4 12.4"
        stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* The wing: the flap carrying on past the corner. */}
      <path
        d="M24.5 9.5H30M26.5 14.5H30M24.5 19.5H28.5"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  )
}

/**
 * Mark + wordmark + status kicker. `tone="light"` is for dark backgrounds (the
 * sidebar and the auth brand panel); `tone="ink"` for ordinary surfaces.
 */
export function BrandLock({ tone = 'ink', size = 'md' }) {
  const light = tone === 'light'
  const lg = size === 'lg'

  return (
    <div className="flex items-center gap-3 min-w-0">
      <span
        className={`flex items-center justify-center shrink-0 rounded-xl border ${
          lg ? 'w-12 h-12' : 'w-9 h-9'
        } ${light ? 'bg-white/10 border-white/15 text-white' : 'bg-accent-soft border-transparent text-accent-ink'}`}
      >
        <CorvoMark size={lg ? 26 : 19} />
      </span>
      <span className="min-w-0">
        <span
          className={`block font-semibold leading-tight tracking-tight ${
            lg ? 'text-[22px]' : 'text-[15px]'
          } ${light ? 'text-white' : 'text-ink'}`}
        >
          {BRAND.name}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 leading-tight ${
            lg ? 'text-[11px]' : 'text-[10px]'
          } font-semibold uppercase tracking-[0.12em] ${light ? 'text-white/60' : 'text-faint'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${light ? 'bg-white/70' : 'bg-good'}`} />
          {BRAND.kicker}
        </span>
      </span>
    </div>
  )
}
