import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import Modal from '../components/Modal.jsx'
import { Card, Skeleton, useToast } from '../components/ui.jsx'
import { IconCheck, IconClock, IconInbox, IconSend } from '../components/icons.jsx'
import { api } from '../api/client.js'
import { useAuth } from '../lib/auth.jsx'

const money = (value, currency) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2,
  }).format(value ?? 0)

const day = (value) =>
  value ? new Date(value.replace(' ', 'T')).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '—'

const STATUS_COPY = {
  pending: ['Payment not completed', 'bg-warn-soft text-warn-ink'],
  active: ['Active', 'bg-good-soft text-good-ink'],
  expired: ['Expired', 'bg-danger-soft text-danger-ink'],
  suspended: ['Suspended', 'bg-danger-soft text-danger-ink'],
  none: ['No plan', 'bg-subtle text-faint'],
}

/** What the client sees about their own subscription. */
export default function Billing() {
  const { refresh } = useAuth()
  const [data, setData] = useState(null)
  const [changing, setChanging] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const load = () => api.getBilling().then(setData)

  useEffect(() => {
    load().catch((e) => toast(e.message, 'bad'))

    // Stripe sends the browser back here. The result shown is whatever the
    // reloaded /api/billing says — coming back from Stripe is not itself proof
    // of payment, only their webhook is, and it may land a moment later.
    const params = new URLSearchParams(window.location.search)
    if (params.has('paid')) {
      api.confirmPayment()
        .then((res) => toast(res.activated
          ? 'Payment received — your plan is active.'
          : 'Payment is still being confirmed. This page will catch up shortly.'))
        .catch(() => toast('Could not confirm the payment yet.', 'bad'))
        .then(() => Promise.all([load().catch(() => {}), refresh()]))
    } else if (params.has('cancelled')) {
      toast('Payment cancelled — nothing was charged.', 'bad')
    }
    if (params.has('paid') || params.has('cancelled')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function switchTo(plan) {
    setBusy(true)
    try {
      const res = await api.choosePlan(plan.id)
      if (res.checkout_url) {
        window.location.href = res.checkout_url   // Stripe takes it from here
        return
      }
      await Promise.all([load(), refresh()])
      setChanging(null)
      toast(`Moved to ${plan.name}`)
    } catch (e) {
      toast(e.message || 'Could not change plan', 'bad')
    }
    setBusy(false)
  }

  const usage = data?.usage
  const [statusLabel, statusTone] = STATUS_COPY[usage?.plan_status] ?? STATUS_COPY.none

  return (
    <>
      <PageHeader
        eyebrow="Account"
        icon={<IconClock size={12} />}
        title="Billing & usage"
        subtitle="Your plan, what you have used this period, and when it renews."
        actions={
          data?.available_plans?.length > 0 && (
            <button className="btn-secondary" onClick={() => setChanging(data.available_plans)}>
              Change plan
            </button>
          )
        }
      />

      <div className="page-body space-y-6">
        {!data ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1" title="Your plan" bodyClass="p-5">
                {!data.plan ? (
                  <p className="text-sm text-faint">No plan assigned yet.</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[17px] font-semibold text-ink">{data.plan.name}</h3>
                      <span className={`badge ${statusTone}`}>{statusLabel}</span>
                    </div>
                    {data.plan.description && (
                      <p className="mt-1 text-[13px] text-faint">{data.plan.description}</p>
                    )}
                    <p className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-[28px] leading-none font-semibold tracking-tight text-ink">
                        {money(data.price, data.currency)}
                      </span>
                      <span className="text-sm text-faint">/{data.plan.interval_unit}</span>
                    </p>
                    {data.plan.features?.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {data.plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-[13px] text-muted">
                            <IconCheck size={15} className="text-good shrink-0 mt-px" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </Card>

              <Card className="lg:col-span-2" title="This period" bodyClass="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Meter
                    icon={<IconSend size={15} />}
                    label="AI replies"
                    used={usage.replies_used}
                    cap={usage.reply_cap}
                    hint="Every auto-reply the agent sends counts once."
                  />
                  <Meter
                    icon={<IconInbox size={15} />}
                    label="Mailboxes"
                    used={usage.mailboxes_used}
                    cap={usage.mailbox_cap}
                    hint="Connected accounts the agent is watching."
                  />
                </div>

                <dl className="mt-6 pt-5 border-t border-line grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Fact label="Period started" value={day(usage.period_started_at)} />
                  <Fact
                    label="Paid until"
                    value={day(usage.period_ends_at)}
                  />
                  <Fact
                    label="Days remaining"
                    value={usage.days_left == null ? '—' : String(usage.days_left)}
                  />
                </dl>
              </Card>
            </div>

            {usage.plan_status === 'pending' && (
              <p className="text-[13px] text-faint">
                Your plan is awaiting confirmation from your administrator. Everything keeps
                working in the meantime.
              </p>
            )}
            {usage.plan_status === 'expired' && (
              <p className="text-[13px] text-danger-ink">
                This period has ended and the agent has stopped replying. Contact your
                administrator to renew, or choose a plan again.
              </p>
            )}
          </>
        )}
      </div>

      <Modal
        open={!!changing}
        onClose={() => setChanging(null)}
        title="Change plan"
        subtitle="Your usage counter resets when the new period starts."
        width="max-w-3xl"
        footer={<button className="btn-secondary" onClick={() => setChanging(null)}>Cancel</button>}
      >
        {/* Wraps at two per row past three plans rather than squeezing them. */}
        <div className={`grid gap-4 ${
          (changing?.length ?? 0) > 3 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
        }`}>
          {(changing ?? []).map((plan) => {
            const current = plan.id === data?.plan?.id
            return (
              <div key={plan.id} className={`card p-4 flex flex-col ${current ? 'border-accent' : ''}`}>
                <h4 className="text-[14px] font-semibold text-ink">{plan.name}</h4>
                <p className="mt-2 text-[22px] leading-none font-semibold text-ink">
                  {money(plan.price, plan.currency)}
                  <span className="text-xs font-normal text-faint">/{plan.interval_unit}</span>
                </p>
                <p className="mt-2 text-xs text-faint">
                  {plan.reply_limit == null ? 'Unlimited replies' : `${plan.reply_limit} replies`}
                  {' · '}
                  {plan.mailbox_limit == null ? 'unlimited mailboxes' : `${plan.mailbox_limit} mailboxes`}
                </p>
                <button
                  className={`${current ? 'btn-secondary' : 'btn-primary'} w-full mt-4`}
                  disabled={current || busy}
                  onClick={() => switchTo(plan)}
                >
                  {current ? 'Current plan' : 'Switch'}
                </button>
              </div>
            )
          })}
        </div>
      </Modal>
    </>
  )
}

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium text-ink">{value}</dd>
    </div>
  )
}

/**
 * Usage against a cap. An uncapped meter shows the count alone rather than a
 * bar that could never fill — a full-looking bar would misread as "at limit".
 */
function Meter({ icon, label, used, cap, hint }) {
  const uncapped = cap == null
  const pct = uncapped ? 0 : Math.min(100, Math.round((used / Math.max(cap, 1)) * 100))
  const tone = pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warn)' : 'var(--accent)'

  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
        <span className="text-faint">{icon}</span>
        {label}
      </div>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[24px] leading-none font-semibold tracking-tight text-ink">{used}</span>
        <span className="text-[13px] text-faint">{uncapped ? 'used' : `of ${cap}`}</span>
      </p>
      {!uncapped && (
        <div className="mt-3 h-2 rounded-full bg-subtle overflow-hidden">
          <div className="h-full rounded-r-full transition-[width] duration-500"
               style={{ width: `${Math.max(2, pct)}%`, background: tone }} />
        </div>
      )}
      <p className="hint mt-2">{uncapped ? 'No limit on your plan.' : hint}</p>
    </div>
  )
}
