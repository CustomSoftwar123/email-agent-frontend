import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandLock } from '../components/brand.jsx'
import { Empty, Skeleton } from '../components/ui.jsx'
import { IconCheck, IconTable } from '../components/icons.jsx'
import { api } from '../api/client.js'
import { useAuth } from '../lib/auth.jsx'

const money = (value, currency) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2,
  }).format(value ?? 0)

/** Columns for however many plans exist — any count, no special cases beyond layout. */
function gridFor(count) {
  if (count === 1) return 'max-w-sm grid-cols-1'
  if (count === 2) return 'max-w-2xl grid-cols-1 sm:grid-cols-2'
  if (count === 3) return 'grid-cols-1 md:grid-cols-3'
  if (count === 4) return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}

/**
 * The gate a new account meets before the app itself. Picking is one click and
 * access is immediate — the plan sits as "pending" until the super admin
 * confirms payment, rather than stranding someone on a waiting screen.
 */
export default function ChoosePlan() {
  const { refresh, logout } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getAvailablePlans().then(setPlans).catch((e) => {
      setPlans([])
      setError(e.message)
    })

    // Someone who has just paid lands back on /billing, but the route guard
    // sends them here while their plan still reads as unchosen. Settle any open
    // checkout first — if it has been paid, refresh() lets the guard release
    // them. Costs nothing when there is no checkout outstanding.
    api.confirmPayment()
      .then((res) => { if (res.activated) return refresh() })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function choose(plan) {
    setError('')
    setBusyId(plan.id)
    try {
      const res = await api.choosePlan(plan.id)
      if (res.checkout_url) {
        // Hand off to Stripe. Nothing is granted until their webhook confirms
        // the payment, so there is no state to update before leaving.
        window.location.href = res.checkout_url
        return
      }
      await refresh()          // a free plan is active already
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message || 'Could not select that plan.')
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="flex items-center justify-between px-5 sm:px-8 h-16 border-b border-line bg-surface">
        <BrandLock />
        <button className="btn-ghost" onClick={() => logout().then(() => navigate('/login'))}>
          Sign out
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-ink mb-2">
            One last step
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-ink leading-tight">
            Choose your plan
          </h1>
          <p className="mt-3 text-sm text-faint">
            Pick the plan that fits how many mailboxes you want the agent watching.
            You can move up or down at any time — just ask.
          </p>
        </div>

        {error && (
          <p className="mt-8 mx-auto max-w-md rounded-xl bg-danger-soft px-3.5 py-3 text-[13px]
                        font-medium text-danger-ink text-center">
            {error}
          </p>
        )}

        {!plans ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="mt-10">
            <Empty
              icon={<IconTable size={19} />}
              title="No plans are on sale yet"
              hint="Your administrator has not published any plans. Contact them and they can assign one to your account directly."
            />
          </div>
        ) : (
          // The grid follows however many plans are published — one sits
          // centred, four wrap evenly — so there is no count that looks wrong.
          <div className={`mt-10 grid gap-5 items-start mx-auto ${gridFor(plans.length)}`}>
            {plans.map((plan) => (
              <PlanOption
                key={plan.id}
                plan={plan}
                busy={busyId === plan.id}
                disabled={busyId !== null}
                onChoose={() => choose(plan)}
              />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-faint">
          You will be taken to Stripe to pay for one {plans[0]?.interval_unit || 'month'}.
          Your account is activated as soon as the payment goes through.
        </p>
      </main>
    </div>
  )
}

function PlanOption({ plan, busy, disabled, onChoose }) {
  return (
    <div className="card relative overflow-hidden p-6 flex flex-col">
      <h2 className="text-[15px] font-semibold text-ink">{plan.name}</h2>
      {plan.description && <p className="mt-1.5 text-[13px] text-faint">{plan.description}</p>}

      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[32px] leading-none font-semibold tracking-tight text-ink">
          {money(plan.price, plan.currency)}
        </span>
        <span className="text-sm text-faint">/{plan.interval_unit}</span>
      </p>

      {/* Both metered limits are shown before choosing, not discovered later. */}
      <ul className="mt-3 text-[13px] text-muted space-y-0.5">
        <li>
          {plan.mailbox_limit == null
            ? 'Unlimited mailboxes'
            : `${plan.mailbox_limit} mailbox${plan.mailbox_limit === 1 ? '' : 'es'}`}
        </li>
        <li>
          {plan.reply_limit == null
            ? 'Unlimited AI replies'
            : `${plan.reply_limit.toLocaleString()} AI replies per ${plan.interval_unit}`}
        </li>
      </ul>

      {plan.features?.length > 0 && (
        <ul className="mt-5 space-y-2.5 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] text-muted">
              <IconCheck size={15} className="text-good shrink-0 mt-px" />
              {f}
            </li>
          ))}
        </ul>
      )}

      <button
        className="btn-primary w-full mt-6"
        onClick={onChoose}
        disabled={disabled}
      >
        {busy ? 'Selecting…' : `Choose ${plan.name}`}
      </button>
    </div>
  )
}
