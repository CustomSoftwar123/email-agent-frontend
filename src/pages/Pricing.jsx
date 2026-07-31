import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import Modal from '../components/Modal.jsx'
import AlertDialog from '../components/AlertDialog.jsx'
import { Card, Empty, Skeleton, StatusBadge, useToast } from '../components/ui.jsx'
import {
  IconCheck,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconStar,
  IconTable,
  IconTrash,
} from '../components/icons.jsx'
import { api } from '../api/client.js'

// Every plan is on sale as soon as it exists — there is no hidden or
// highlighted state to set, so the editor does not ask about either.
const BLANK = {
  name: '', description: '', price: '', currency: 'USD', interval_unit: 'month',
  mailbox_limit: '', reply_limit: '', trial_days: 0, features: '',
  is_active: true, sort_order: 0,
}

const money = (value, currency) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2,
  }).format(value ?? 0)

export default function Pricing() {
  const [plans, setPlans] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [editing, setEditing] = useState(null)   // plan being edited, or BLANK for new
  const [confirming, setConfirming] = useState(null)
  const [detailId, setDetailId] = useState(null)
  const toast = useToast()

  const load = () =>
    Promise.all([api.getPlans(), api.getAccounts()]).then(([p, a]) => {
      setPlans(p)
      setAccounts(a)
    })

  useEffect(() => {
    load().catch((e) => toast(e.message, 'bad'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function save(draft) {
    const payload = {
      ...draft,
      price: Number(draft.price) || 0,
      sort_order: Number(draft.sort_order) || 0,
      trial_days: Number(draft.trial_days) || 0,
      // Blank means "no cap" — the API stores NULL rather than zero.
      mailbox_limit: draft.mailbox_limit === '' ? null : Number(draft.mailbox_limit),
      reply_limit: draft.reply_limit === '' ? null : Number(draft.reply_limit),
      features: String(draft.features)
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    }
    const saved = draft.id ? await api.updatePlan(payload) : await api.createPlan(payload)
    setEditing(null)
    await load()
    toast(`${saved.name} saved`)
  }

  async function remove(plan) {
    await api.deletePlan(plan.id)
    setConfirming(null)
    await load()
    toast(`${plan.name} deleted — accounts on it now have no plan`)
  }

  async function setPlanFor(accountId, planId) {
    await api.assignPlan(accountId, planId === '' ? null : Number(planId))
    await load()
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        icon={<IconStar size={12} />}
        title="Plans & pricing"
        subtitle="What you charge, and which plan each account is on. Only super admins can see this page."
        actions={
          <button className="btn-primary" onClick={() => setEditing({ ...BLANK })}>
            <IconPlus size={16} />
            New plan
          </button>
        }
      />

      <div className="page-body space-y-6">
        {/* ── plans ─────────────────────────────────────────────────────── */}
        {!plans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        ) : plans.length === 0 ? (
          <Empty
            icon={<IconTable size={19} />}
            title="No plans yet"
            hint="Create the tiers you sell. Each plan's mailbox limit is enforced when an account connects a mailbox."
            action={
              <button className="btn-primary" onClick={() => setEditing({ ...BLANK })}>
                <IconPlus size={16} />
                New plan
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                subscribers={(accounts ?? []).filter((a) => a.plan_id === plan.id).length}
                onEdit={() =>
                  setEditing({
                    ...plan,
                    mailbox_limit: plan.mailbox_limit ?? '',
                    reply_limit: plan.reply_limit ?? '',
                    features: (plan.features ?? []).join('\n'),
                  })
                }
                onDelete={() => setConfirming(plan)}
              />
            ))}
          </div>
        )}

        {/* ── accounts ──────────────────────────────────────────────────── */}
        <Card
          className="overflow-hidden"
          title="Accounts"
          subtitle="Every account, what it is using, and the plan it sits on"
          bodyClass="p-0"
        >
          {!accounts ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="th">Account</th>
                    <th className="th">Status</th>
                    <th className="th text-right">Mailboxes</th>
                    <th className="th text-right">Replies</th>
                    <th className="th text-right">Renews</th>
                    <th className="th">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => {
                    const over = a.mailbox_limit != null && a.mailboxes > a.mailbox_limit
                    return (
                      <tr key={a.id}>
                        <td className="td">
                          <button className="text-left hover:underline" onClick={() => setDetailId(a.id)}>
                            <span className="block text-ink font-medium truncate">{a.name || a.email}</span>
                            <span className="block text-xs text-faint truncate">{a.email}</span>
                          </button>
                        </td>
                        <td className="td">
                          {a.role === 'superadmin'
                            ? <span className="badge bg-accent-soft text-accent-ink">Super admin</span>
                            : <PlanStatusBadge status={a.plan_status} />}
                        </td>
                        <td className={`td text-right tabular-nums ${over ? 'text-danger-ink font-semibold' : ''}`}>
                          {a.mailboxes}
                          <span className="text-faint">/{a.mailbox_limit ?? '∞'}</span>
                        </td>
                        <td className={`td text-right tabular-nums ${
                          a.reply_limit != null && a.replies_used >= a.reply_limit
                            ? 'text-danger-ink font-semibold' : ''}`}>
                          {a.replies_used}
                          <span className="text-faint">/{a.reply_limit ?? '∞'}</span>
                        </td>
                        <td className="td text-right whitespace-nowrap">
                          {a.days_left == null ? (
                            <span className="text-faint">—</span>
                          ) : (
                            <span className={a.days_left <= 3 ? 'text-warn-ink font-semibold' : 'text-muted'}>
                              {a.days_left === 0 ? 'today' : `${a.days_left}d`}
                            </span>
                          )}
                        </td>
                        <td className="td">
                          <select
                            className="input py-1.5 text-[13px] max-w-[190px]"
                            value={a.plan_id ?? ''}
                            onChange={(e) => setPlanFor(a.id, e.target.value)}
                          >
                            <option value="">No plan</option>
                            {(plans ?? []).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} — {money(p.price, p.currency)}/{p.interval_unit}
                              </option>
                            ))}
                          </select>
                          {a.price_override != null && (
                            <p className="mt-1 text-[11px] text-warn-ink">
                              Custom price {money(a.price_override, a.currency)}
                            </p>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <PlanEditor draft={editing} onCancel={() => setEditing(null)} onSave={save} />

      <AccountDetail
        accountId={detailId}
        onClose={() => setDetailId(null)}
        onSaved={async (message) => {
          await load()
          toast(message)
        }}
      />

      <AlertDialog
        open={!!confirming}
        variant="danger"
        title={`Delete ${confirming?.name ?? ''}?`}
        message="Accounts on this plan keep working — they simply end up with no plan and no limits. This cannot be undone."
        confirmLabel="Delete plan"
        onConfirm={() => remove(confirming)}
        onClose={() => setConfirming(null)}
      />
    </>
  )
}

const STATUS_TONES = {
  active: 'bg-good-soft text-good-ink',
  pending: 'bg-warn-soft text-warn-ink',
  suspended: 'bg-danger-soft text-danger-ink',
  none: 'bg-subtle text-faint',
}

const STATUS_LABELS = {
  active: 'Active', pending: 'Pending', suspended: 'Suspended', none: 'No plan',
}

function PlanStatusBadge({ status }) {
  const key = status || 'none'
  return <span className={`badge ${STATUS_TONES[key]}`}>{STATUS_LABELS[key]}</span>
}

/**
 * Everything about one account, and the two levers that only apply to them:
 * their status, and per-account exceptions to their plan's terms.
 */
function AccountDetail({ accountId, onClose, onSaved }) {
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState({
    mailbox_limit_override: '', reply_limit_override: '', price_override: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (accountId == null) return
    setDetail(null)
    setError('')
    api.getAccount(accountId)
      .then((d) => {
        setDetail(d)
        setForm({
          mailbox_limit_override: d.mailbox_limit_override ?? '',
          reply_limit_override: d.reply_limit_override ?? '',
          price_override: d.price_override ?? '',
        })
      })
      .catch((e) => setError(e.message))
  }, [accountId])

  if (accountId == null) return null

  async function patch(body, message) {
    setBusy(true)
    setError('')
    try {
      const updated = await api.updateAccount(accountId, body)
      setDetail(updated)
      await onSaved(message)
    } catch (e) {
      setError(e.message || 'Could not save.')
    }
    setBusy(false)
  }

  /** Start the next period and clear usage — pressed once a client has paid. */
  async function renew() {
    setBusy(true)
    setError('')
    try {
      setDetail(await api.renewAccount(accountId))
      await onSaved('Renewed — usage reset and the next period started')
    } catch (e) {
      setError(e.message || 'Could not renew.')
    }
    setBusy(false)
  }

  const stat = (label, value) => (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 text-[17px] font-semibold text-ink tabular-nums">{value}</dd>
    </div>
  )

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-2xl"
      title={detail ? (detail.name || detail.email) : 'Account'}
      subtitle={detail?.email}
      footer={<button className="btn-secondary" onClick={onClose}>Close</button>}
    >
      {error && (
        <p className="mb-4 rounded-xl bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger-ink">
          {error}
        </p>
      )}

      {!detail ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stat('Mailboxes', `${detail.mailboxes_used}/${detail.mailbox_cap ?? '∞'}`)}
            {stat('Threads', detail.threads)}
            {stat('Leads', detail.leads)}
            {stat('Sent', detail.sent_total)}
          </dl>

          <div>
            <p className="label">Plan</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] text-muted">
                {detail.plan
                  ? `${detail.plan.name} — ${money(detail.effective_price, detail.plan.currency)}/${detail.plan.interval_unit}`
                  : 'No plan assigned'}
              </span>
              <PlanStatusBadge status={detail.plan_status} />
            </div>

            <p className="mt-1 text-xs text-faint">
              {detail.period_ends_at
                ? `${detail.plan_status === 'trialing' ? 'Trial ends' : 'Period ends'} ` +
                  `${String(detail.period_ends_at).slice(0, 10)}` +
                  (detail.days_left != null ? ` · ${detail.days_left} days left` : '')
                : 'No billing period open'}
            </p>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {detail.plan_status !== 'active' && (
                <button className="btn-secondary" disabled={busy}
                        onClick={() => patch({ plan_status: 'active' }, 'Account activated')}>
                  <IconCheck size={15} />
                  Mark active
                </button>
              )}
              {detail.plan_id && (
                <button className="btn-secondary" disabled={busy} onClick={renew}>
                  <IconRefresh size={15} />
                  Renew period
                </button>
              )}
              {detail.plan_status !== 'suspended' ? (
                <button className="btn-danger" disabled={busy}
                        onClick={() => patch({ plan_status: 'suspended' }, 'Account suspended')}>
                  Suspend
                </button>
              ) : (
                <span className="text-xs text-faint">
                  Suspended — the agent has stopped answering this account’s mail.
                </span>
              )}
            </div>
          </div>

          <div className="pt-5 border-t border-line">
            <p className="label">Custom terms for this account</p>
            <p className="hint mb-3">
              Leave blank to use the plan’s own terms. Set these when you have agreed
              something different with this client.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="ov-mailboxes">Mailboxes</label>
                <input id="ov-mailboxes" className="input" type="number" min="0"
                       placeholder={detail.plan?.mailbox_limit ?? 'Unlimited'}
                       value={form.mailbox_limit_override}
                       onChange={(e) => setForm((f) => ({ ...f, mailbox_limit_override: e.target.value }))} />
              </div>
              <div>
                <label className="label" htmlFor="ov-replies">AI replies</label>
                <input id="ov-replies" className="input" type="number" min="0"
                       placeholder={detail.plan?.reply_limit ?? 'Unlimited'}
                       value={form.reply_limit_override}
                       onChange={(e) => setForm((f) => ({ ...f, reply_limit_override: e.target.value }))} />
              </div>
              <div>
                <label className="label" htmlFor="ov-price">Price</label>
                <input id="ov-price" className="input" type="number" min="0" step="0.01"
                       placeholder={detail.plan?.price ?? '—'}
                       value={form.price_override}
                       onChange={(e) => setForm((f) => ({ ...f, price_override: e.target.value }))} />
              </div>
            </div>
            <button
              className="btn-primary mt-4"
              disabled={busy}
              onClick={() => patch({
                mailbox_limit_override: form.mailbox_limit_override,
                reply_limit_override: form.reply_limit_override,
                price_override: form.price_override,
              }, 'Custom terms saved')}
            >
              {busy ? 'Saving…' : 'Save custom terms'}
            </button>
          </div>

          {detail.agents?.length > 0 && (
            <div className="pt-5 border-t border-line">
              <p className="label">Agents</p>
              <ul className="space-y-2">
                {detail.agents.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 text-[13px]">
                    <span className="text-ink font-medium">{a.name}</span>
                    <span className="text-faint">{a.conn_email || 'not connected'}</span>
                    <span className="ml-auto"><StatusBadge value={
                      a.conn_status === 'connected' ? 'connected' : 'queued'} /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function PlanCard({ plan, subscribers, onEdit, onDelete }) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink truncate">{plan.name}</h3>
          <p className="mt-0.5 text-xs text-faint">
            {subscribers} account{subscribers === 1 ? '' : 's'}
          </p>
        </div>
      </div>
      {plan.description && <p className="mt-2 text-[13px] text-faint">{plan.description}</p>}

      <p className="mt-4 flex items-baseline gap-1.5">
        <span className="text-[30px] leading-none font-semibold tracking-tight text-ink">
          {money(plan.price, plan.currency)}
        </span>
        <span className="text-sm text-faint">/{plan.interval_unit}</span>
      </p>

      <ul className="mt-3 text-[13px] text-muted space-y-0.5">
        <li>
          {plan.mailbox_limit == null
            ? 'Unlimited mailboxes'
            : `${plan.mailbox_limit} mailbox${plan.mailbox_limit === 1 ? '' : 'es'}`}
        </li>
        <li>
          {plan.reply_limit == null
            ? 'Unlimited AI replies'
            : `${plan.reply_limit} AI replies per ${plan.interval_unit}`}
        </li>
        {plan.trial_days > 0 && <li className="text-info-ink">{plan.trial_days}-day free trial</li>}
      </ul>

      {plan.features?.length > 0 && (
        <ul className="mt-4 space-y-2 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] text-muted">
              <IconCheck size={15} className="text-good shrink-0 mt-px" />
              {f}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 pt-4 border-t border-line flex items-center gap-1">
        <button className="btn-ghost" onClick={onEdit}>
          <IconEdit size={15} />
          Edit
        </button>
        <button className="btn-danger ml-auto" onClick={onDelete}>
          <IconTrash size={15} />
          Delete
        </button>
      </div>
    </div>
  )
}

function PlanEditor({ draft, onCancel, onSave }) {
  const [form, setForm] = useState(draft)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Re-seed whenever a different plan is opened.
  useEffect(() => {
    setForm(draft)
    setError('')
  }, [draft])

  if (!draft || !form) return null
  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  async function submit() {
    if (!form.name.trim()) {
      setError('Give the plan a name.')
      return
    }
    setBusy(true)
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message || 'Could not save the plan.')
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onCancel}
      title={form.id ? `Edit ${draft.name}` : 'New plan'}
      subtitle="The mailbox limit is enforced when an account connects a mailbox."
      footer={
        <>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : 'Save plan'}
          </button>
        </>
      }
    >
      {error && (
        <p className="mb-4 rounded-xl bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger-ink">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="plan-name">Plan name</label>
          <input id="plan-name" className="input" value={form.name} onChange={set('name')}
                 placeholder="Growth" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="plan-price">Price</label>
            <input id="plan-price" className="input" type="number" min="0" step="0.01"
                   value={form.price} onChange={set('price')} placeholder="79" />
          </div>
          <div>
            <label className="label" htmlFor="plan-interval">Billed</label>
            <select id="plan-interval" className="input" value={form.interval_unit}
                    onChange={set('interval_unit')}>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="plan-desc">Short description</label>
          <input id="plan-desc" className="input" maxLength={255} value={form.description}
                 onChange={set('description')} placeholder="For teams running a few mailboxes" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="plan-currency">Currency</label>
            <input id="plan-currency" className="input" maxLength={3} value={form.currency}
                   onChange={set('currency')} placeholder="USD" />
          </div>
          <div>
            <label className="label" htmlFor="plan-trial">Free trial (days)</label>
            <input id="plan-trial" className="input" type="number" min="0"
                   value={form.trial_days} onChange={set('trial_days')} placeholder="0" />
            <p className="hint mt-1.5">0 for no trial.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="plan-limit">Mailbox limit</label>
            <input id="plan-limit" className="input" type="number" min="0"
                   value={form.mailbox_limit} onChange={set('mailbox_limit')} placeholder="Unlimited" />
          </div>
          <div>
            <label className="label" htmlFor="plan-replies">AI replies per period</label>
            <input id="plan-replies" className="input" type="number" min="0"
                   value={form.reply_limit} onChange={set('reply_limit')} placeholder="Unlimited" />
            <p className="hint mt-1.5">This is what actually costs you money.</p>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="plan-features">Features</label>
          {/* The placeholder already shows one feature per line. */}
          <textarea id="plan-features" className="input min-h-[110px]" value={form.features}
                    onChange={set('features')} placeholder={'5 mailboxes\nAI auto-replies\nPriority support'} />
        </div>

      </div>
    </Modal>
  )
}
