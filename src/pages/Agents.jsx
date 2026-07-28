import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/Layout.jsx'
import Modal from '../components/Modal.jsx'
import { Card, Empty, Skeleton, StatusBadge, useToast } from '../components/ui.jsx'
import {
  IconAlert,
  IconArrowLeftCircle,
  IconCheck,
  IconChevronDown,
  IconClose,
  IconEdit,
  IconKey,
  IconRobot,
  IconTrash,
} from '../components/icons.jsx'
import { api } from '../api/client.js'

// Field vocabulary for the Edit Agent form.
const PERSONALITIES = ['Friendly', 'Professional', 'Confident', 'Helpful', 'Calm', 'Energetic']
const GENDERS = ['Male', 'Female']
// This deployment is the email agent only — calling and marketing roles belong
// to the wider suite, not here.
const ROLES = ['Email Agent']
const PROVIDERS = [
  // `connect` is the brand colour of that provider's Connect button.
  { value: 'Gmail', label: 'Google (Gmail)', connect: 'var(--danger)' },
  { value: 'Outlook', label: 'Outlook', connect: '#0078d4' },
  { value: 'IMAP', label: 'IMAP', connect: '#334155' },
]
const VARIABLES = ['{{company_name}}', '{{company_address}}', '{{company_description}}', '{{service_knowledge}}']

const COUNTRIES = [
  'Ireland', 'United Kingdom', 'United States', 'Canada', 'Pakistan', 'India',
  'Poland', 'Germany', 'France', 'Spain', 'Netherlands', 'Australia', 'United Arab Emirates',
]
// Company Region is stored as an IANA timezone.
const REGIONS = [
  'Europe/Dublin', 'Europe/London', 'Europe/Vienna', 'Europe/Berlin', 'Europe/Warsaw',
  'Europe/Madrid', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dubai',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Australia/Sydney',
]

const BLANK_COMPANY = {
  name: '', email: '', address: '', country: '', region: '',
  description: '', pricing: '', business_type: 'Service',
  service_knowledge: '', product_knowledge: '', global_prompt: '',
}

const BLANK = {
  name: '',
  dob: '',
  gender: '',
  personality: 'Friendly',
  roles: ['Email Agent'],
  leads_action: true,
  description: '',
  company: { ...BLANK_COMPANY },
  provider: 'Gmail',
  connection: { status: 'disconnected', email: '', detail: 'Not connected yet' },
}

export default function Agents() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [draft, setDraft] = useState(null)
  // The provider the agent is actually connected with, as last saved. Switching
  // the radio away from it is a pending change, not a live one.
  const [savedProvider, setSavedProvider] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmSwitch, setConfirmSwitch] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [savingCompany, setSavingCompany] = useState(false)
  const toast = useToast()

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    if (isNew) {
      setDraft({ ...BLANK })
      setSavedProvider('')
      setLoading(false)
      return
    }

    const fetch = id
      ? api.getAgent(id)
      : api.getAgents().then((list) => list[0] ?? null)

    fetch.then((agent) => {
      if (cancelled) return
      // Landing on /agents with no id: settle on the first agent.
      if (!id && agent) {
        navigate(`/agents/${agent.id}`, { replace: true })
        return
      }
      setDraft(agent ? { ...agent } : null)
      // A stored connection counts as the active provider even when it is
      // failing — only a genuinely absent one leaves the slot empty.
      setSavedProvider(agent && agent.connection?.status !== 'disconnected' ? agent.provider : '')
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [id, isNew, navigate])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  // Company info lives on the agent, so two agents can represent two companies.
  const setCompany = (k, v) => setDraft((d) => ({ ...d, company: { ...d.company, [k]: v } }))

  const toggleRole = (role) =>
    setDraft((d) => ({
      ...d,
      roles: d.roles.includes(role) ? d.roles.filter((r) => r !== role) : [...d.roles, role],
    }))

  // Email settings only apply to an agent that actually has an email role.
  const hasEmailRole = !!draft?.roles?.some((r) => String(r).toLowerCase().includes('email'))

  useEffect(() => {
    if (!draft || hasEmailRole || !draft.provider) return
    setDraft((d) => ({ ...d, provider: '' }))
  }, [hasEmailRole, draft])

  const selectedProvider = (draft?.provider || '').toLowerCase()
  const activeProvider = (savedProvider || '').toLowerCase()
  const providerChanged = !!selectedProvider && selectedProvider !== activeProvider
  // Show the card for whichever provider the form is pointing at.
  const displayProvider = providerChanged ? selectedProvider : activeProvider
  const label = (p) => PROVIDERS.find((x) => x.value.toLowerCase() === p)?.label ?? p
  // "Google (Gmail)" for the heading, plain "Gmail" inside sentences and buttons.
  const shortName = (p) => PROVIDERS.find((x) => x.value.toLowerCase() === p)?.value ?? p
  const connectColour = (p) => PROVIDERS.find((x) => x.value.toLowerCase() === p)?.connect ?? 'var(--accent)'

  function onUpdateClick(e) {
    // Switching provider tears down the existing connection — confirm first.
    if (!isNew && activeProvider && providerChanged) {
      e.preventDefault()
      setConfirmSwitch(true)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    if (isNew) {
      const created = await api.addAgent(draft)
      setSaving(false)
      toast('Agent created')
      navigate(`/agents/${created.id}`)
      return
    }
    // A provider switch drops the old connection; the new one must be re-linked.
    const payload = providerChanged
      ? { ...draft, connection: { status: 'disconnected', email: '', detail: 'Not connected yet' }, watcher: 'stopped' }
      : draft
    const saved = await api.saveAgent(payload)
    setDraft({ ...saved })
    setSavedProvider(saved.connection?.status !== 'disconnected' ? saved.provider : '')
    setSaving(false)
    toast(providerChanged ? `Switched to ${label(selectedProvider)} — connect the mailbox to start it` : 'Agent updated')
  }

  /** Save just the company profile, without touching the rest of the agent. */
  async function updateCompany() {
    if (isNew) return
    setSavingCompany(true)
    const updated = await api.saveAgentCompany(draft.id, draft.company)
    setDraft((d) => ({ ...d, company: updated.company }))
    setSavingCompany(false)
    toast('Company info updated')
  }

  async function remove() {
    setConfirmDelete(false)
    await api.deleteAgent(draft.id)
    toast('Agent deleted')
    navigate('/agents', { replace: true })
  }

  async function connect() {
    if (draft.provider === 'IMAP') {
      // IMAP has no OAuth handshake — clearing the connection brings the
      // inline credentials form back so they can be re-entered.
      await disconnect()
      return
    }
    setConnecting(true)
    const updated = await api.connectProvider(draft.id, draft.provider)
    setDraft({ ...updated })
    setSavedProvider(updated.provider)
    setConnecting(false)
    toast(`${draft.provider} connected`)
  }

  async function disconnect() {
    const updated = await api.disconnect(draft.id)
    setDraft({ ...updated })
    setSavedProvider('')
    toast('Mailbox disconnected')
  }

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="AI" icon={<IconRobot size={13} />} title="Edit Agent" />
        <div className="page-body">
          <div className="card p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-11 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!draft) {
    return (
      <>
        <PageHeader eyebrow="AI" icon={<IconRobot size={13} />} title="Manage Agents" />
        <div className="page-body">
          <Empty
            icon={<IconRobot size={20} />}
            title="No agents yet"
            hint="Create your first agent from the sidebar."
            action={
              <button className="btn-primary" onClick={() => navigate('/agents/new')}>
                Add Agent
              </button>
            }
          />
        </div>
      </>
    )
  }

  const connected = draft.connection?.status === 'connected'
  const failed = draft.connection?.status === 'error'
  const company = { ...BLANK_COMPANY, ...(draft.company ?? {}) }
  const isProduct = company.business_type === 'Product'

  return (
    <>
      <PageHeader
        eyebrow="AI"
        icon={<IconRobot size={13} />}
        title={isNew ? 'Add Agent' : 'Edit Agent'}
        subtitle="Update this AI agent's profile, roles, prompt, and email connection."
      />

      <div className="page-body max-w-6xl">
        <form onSubmit={submit} className="space-y-5">
          {/* ---------------------------------------------- agent profile --- */}
          <Card title="Agent profile" subtitle="Who this agent is and how it writes" bodyClass="p-6">
          {/* Row 1 — identity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
            <Field label="Agent Name" id="ag-name">
              <input
                id="ag-name"
                className="input h-[46px]"
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Agent name"
              />
            </Field>

            <Field label="Date of Birth" id="ag-dob">
              <input
                id="ag-dob"
                type="date"
                className="input h-[46px]"
                value={draft.dob ?? ''}
                onChange={(e) => set('dob', e.target.value)}
              />
            </Field>

            <Field label="Gender" id="ag-gender">
              <div className="relative">
                <select
                  id="ag-gender"
                  className="input h-[46px] pr-16 appearance-none"
                  style={{ backgroundImage: 'none' }}
                  value={draft.gender ?? ''}
                  onChange={(e) => set('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                  {draft.gender && (
                    <button
                      type="button"
                      onClick={() => set('gender', '')}
                      className="pointer-events-auto p-1 text-faint hover:text-ink"
                      aria-label="Clear gender"
                    >
                      <IconClose size={13} />
                    </button>
                  )}
                  <span className="w-px h-4 bg-line" />
                  <IconChevronDown size={14} className="text-faint" />
                </div>
              </div>
            </Field>
          </div>

          {/* Row 2 — behaviour */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mt-5">
            <Field label="Agent Personality" id="ag-personality">
              <select
                id="ag-personality"
                className="input h-[46px]"
                value={draft.personality ?? ''}
                onChange={(e) => set('personality', e.target.value)}
              >
                {PERSONALITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            <Field label="Agent Role" id="ag-role">
              <div className="min-h-[46px] rounded-lg border border-line-strong bg-surface px-2 py-[7px] flex flex-wrap items-center gap-1.5">
                {draft.roles.map((r) => (
                  <span key={r} className="inline-flex items-center rounded border border-line-strong bg-surface text-sm text-ink">
                    <button
                      type="button"
                      onClick={() => toggleRole(r)}
                      className="px-1.5 py-0.5 text-faint hover:text-danger border-r border-line-strong"
                      aria-label={`Remove ${r}`}
                    >
                      <IconClose size={11} />
                    </button>
                    <span className="px-2 py-0.5">{r}</span>
                  </span>
                ))}
                <select
                  className="flex-1 min-w-[80px] bg-transparent text-sm text-faint outline-none cursor-pointer"
                  value=""
                  onChange={(e) => e.target.value && toggleRole(e.target.value)}
                  aria-label="Add role"
                >
                  <option value="">{draft.roles.length ? '' : 'Select roles…'}</option>
                  {ROLES.filter((r) => !draft.roles.includes(r)).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </Field>

            <Field label="Description (Prompt)" id="ag-prompt">
              <button
                type="button"
                onClick={() => setPromptOpen(true)}
                className="w-full h-[46px] rounded-lg border border-line-strong bg-surface flex items-center justify-center gap-2
                           text-sm font-semibold text-accent hover:bg-subtle transition-colors"
              >
                <IconEdit size={16} />
                Edit Prompt
              </button>
            </Field>
          </div>

          </Card>

          {/* ------------------------------------------------ company info --- */}
          <Card
            title="Company Info"
            subtitle="What this agent tells prospects — each agent has its own profile"
            bodyClass="p-6"
            actions={
              !isNew && (
                <button type="button" className="btn-secondary" onClick={updateCompany} disabled={savingCompany}>
                  {savingCompany ? 'Saving…' : 'Update Info'}
                </button>
              )
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-4">
                <Field label="Company Name" id="co-name">
                  <input id="co-name" className="input" value={company.name} onChange={(e) => setCompany('name', e.target.value)} />
                </Field>
                <Field label="Company Address" id="co-address">
                  <input id="co-address" className="input" value={company.address} onChange={(e) => setCompany('address', e.target.value)} />
                </Field>
                <Field label="Company Description" id="co-desc">
                  <textarea id="co-desc" className="input leading-relaxed" rows={2} value={company.description} onChange={(e) => setCompany('description', e.target.value)} />
                </Field>
                <Field label="Price Guidelines" id="co-price">
                  <textarea id="co-price" className="input leading-relaxed" rows={2} value={company.pricing} onChange={(e) => setCompany('pricing', e.target.value)} />
                </Field>
                <div>
                  <p className="label">Select Business Type</p>
                  <div className="flex items-center gap-10">
                    {['Service', 'Product'].map((t) => (
                      <label key={t} className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-muted">
                        <input
                          type="radio"
                          name="business_type"
                          className="w-4 h-4 accent-[var(--accent)]"
                          checked={company.business_type === t}
                          onChange={() => setCompany('business_type', t)}
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Field label="Company Email" id="co-email">
                  <input id="co-email" type="email" className="input" value={company.email} onChange={(e) => setCompany('email', e.target.value)} />
                </Field>
                <Field label="Country" id="co-country">
                  <select id="co-country" className="input" value={company.country} onChange={(e) => setCompany('country', e.target.value)}>
                    <option value="">Select Country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Company Region" id="co-region">
                  <select id="co-region" className="input" value={company.region} onChange={(e) => setCompany('region', e.target.value)}>
                    <option value="">Select Region</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Set a Prompt" id="co-prompt">
                  <textarea id="co-prompt" className="input leading-relaxed" rows={2} value={company.global_prompt} onChange={(e) => setCompany('global_prompt', e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="mt-5">
              <p className="label">{isProduct ? 'Product Knowledge' : 'Service Knowledge'}</p>
              <textarea
                className="input leading-relaxed font-mono text-xs"
                rows={4}
                value={isProduct ? company.product_knowledge : company.service_knowledge}
                onChange={(e) => setCompany(isProduct ? 'product_knowledge' : 'service_knowledge', e.target.value)}
                placeholder={'1. Custom Software Development\n2. Web Application Development'}
              />
            </div>

          </Card>

          {/* -------------------------------------------- email connection --- */}
          {hasEmailRole && (
            <Card title="Email connection" subtitle="The mailbox this agent polls and sends from" bodyClass="p-6">
            <div>
              <p className="label">Email Provider</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {PROVIDERS.map((p) => (
                  <label key={p.value} className="inline-flex items-center gap-2 cursor-pointer text-sm text-muted">
                    <input
                      type="radio"
                      name="provider"
                      className="w-4 h-4 accent-[var(--accent)]"
                      checked={draft.provider === p.value}
                      onChange={() => set('provider', p.value)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>

              {providerChanged && activeProvider && (
                <p className="mt-2.5 inline-flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2 text-xs text-warn-ink">
                  <IconAlert size={14} className="mt-px shrink-0" />
                  Switching to {label(selectedProvider)} will disconnect the existing{' '}
                  {label(activeProvider)} connection. Press Update Agent to apply it.
                </p>
              )}
            </div>

          {/* the card for whichever provider is currently selected */}
          {displayProvider && (
            <div className="mt-6">
              <div className="rounded-[8px] border border-line bg-subtle p-6">
                <p className="text-[17px] text-ink">
                  {displayProvider === 'imap' ? 'Custom IMAP/SMTP' : label(displayProvider)}
                </p>

                {connected && !providerChanged ? (
                  <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[15px] text-good-ink">
                        Connected as <span className="font-bold">{draft.connection.email}</span>
                      </p>
                      {draft.connection?.detail && <p className="mt-1 text-xs text-faint">{draft.connection.detail}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="btn-ghost" onClick={disconnect}>
                        Disconnect
                      </button>
                      <button type="button" className="btn-secondary" onClick={connect} disabled={connecting}>
                        <IconKey size={15} />
                        {connecting ? 'Connecting…' : 'Reconnect'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {failed && !providerChanged ? (
                      <p className="mt-2 text-[15px] text-danger-ink">
                        {draft.connection.email} — connection failed. Reconnect to resume this mailbox.
                      </p>
                    ) : (
                      <p className="mt-2 text-[16px] text-faint">
                        No {shortName(displayProvider)} account is connected for this agent yet.
                      </p>
                    )}

                    {!isNew &&
                      (displayProvider === 'imap' ? (
                        <ImapForm
                          saving={connecting}
                          onSave={async (creds) => {
                            setConnecting(true)
                            const updated = await api.saveImap(draft.id, creds)
                            setDraft({ ...updated })
                            setSavedProvider(updated.provider)
                            setConnecting(false)
                            toast('IMAP settings saved — mailbox connected')
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={connect}
                          disabled={connecting}
                          style={{ background: connectColour(displayProvider) }}
                          className="mt-4 w-full h-[42px] rounded-lg text-white text-[15px] font-semibold
                                     hover:brightness-105 transition-all disabled:opacity-60"
                        >
                          {connecting ? 'Connecting…' : `Connect ${shortName(displayProvider)}`}
                        </button>
                      ))}
                  </>
                )}

                {connected && !providerChanged && (
                  <div className="mt-5 pt-4 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Meta
                      label="Watcher"
                      value={<StatusBadge value={draft.watcher === 'running' ? 'active' : draft.watcher === 'error' ? 'error' : 'paused'} />}
                    />
                    <Meta label="Poll bookmark" value={<span className="font-mono text-xs text-ink">{draft.bookmark}</span>} />
                    <Meta label="Last checked" value={<span className="text-xs text-ink">{draft.last_checked}</span>} />
                    <Meta label="Sent (30d)" value={<span className="text-xs text-ink tabular-nums">{draft.sent_30d}</span>} />
                  </div>
                )}
              </div>
            </div>
          )}
            </Card>
          )}

          {/* ------------------------------------------------ action bar --- */}
          <div className="card px-5 py-4">
            {!isNew && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mb-4 w-10 h-10 rounded-lg bg-danger text-white flex items-center justify-center
                           hover:brightness-110 transition-all"
                aria-label={`Delete ${draft.name}`}
                title="Delete agent"
              >
                <IconTrash size={17} />
              </button>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button className="btn-primary" disabled={saving} onClick={onUpdateClick}>
                {saving ? 'Saving…' : isNew ? 'Create Agent' : 'Update Agent'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                <IconArrowLeftCircle size={17} />
                Go Back
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Prompt editor — "Agent Prompt / Description" */}
      <Modal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        title="Agent Prompt / Description"
        subtitle="Available variables (type them in the prompt below):"
        width="max-w-2xl"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setPromptOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => setPromptOpen(false)}>
              <IconCheck size={15} /> Save
            </button>
          </>
        }
      >
        <div className="flex flex-wrap gap-1.5 mb-3">
          {VARIABLES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set('description', `${draft.description ?? ''}${v}`)}
              className="badge bg-accent-soft text-accent-ink font-mono"
              title="Insert into the prompt"
            >
              {v}
            </button>
          ))}
        </div>
        <textarea
          className="input font-mono text-xs leading-relaxed"
          rows={12}
          value={draft.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder="You are a concise sales rep for {{company_name}}…"
        />
        <p className="hint mt-2">
          Stored in the local config file and combined with the company profile on every send.
        </p>
      </Modal>

      {/* Provider switch confirmation */}
      <Modal
        open={confirmSwitch}
        onClose={() => setConfirmSwitch(false)}
        title="Change Email Provider?"
        width="max-w-md"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setConfirmSwitch(false)}>Cancel</button>
            <button
              className="btn"
              style={{ background: 'var(--danger)', color: '#fff' }}
              onClick={async (e) => {
                setConfirmSwitch(false)
                await submit(e)
              }}
            >
              Yes, switch provider
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Switching from <span className="font-semibold text-ink">{label(activeProvider)}</span> to{' '}
          <span className="font-semibold text-ink">{label(selectedProvider)}</span> will disconnect your existing{' '}
          {label(activeProvider)} connection. Do you want to continue?
        </p>
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete agent"
        width="max-w-md"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
            <button
              className="btn"
              onClick={remove}
              style={{ background: 'var(--danger)', color: '#fff' }}
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{draft.name}</span> and its email connection will be removed. Stored
          conversations stay in the local database.
        </p>
      </Modal>
    </>
  )
}

function Field({ label, id, children }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text-faint mb-1">{label}</div>
      {value}
    </div>
  )
}

const ENCRYPTIONS = ['SSL', 'TLS', 'STARTTLS', 'None']

const IMAP_INPUT =
  'w-full h-[40px] px-3.5 rounded-lg bg-surface border border-line-strong text-sm text-ink ' +
  'placeholder:text-dim transition-colors outline-none focus:border-accent focus:ring-4 focus:ring-[var(--focus)]'

/** Inline IMAP/SMTP credentials form, shown in place of a Connect button. */
function ImapForm({ onSave, saving }) {
  const [creds, setCreds] = useState({
    email: '',
    imap_host: '',
    imap_port: 993,
    encryption: 'SSL',
    username: '',
    password: '',
  })
  const set = (k, v) => setCreds({ ...creds, [k]: v })
  const ready = creds.email.includes('@') && creds.imap_host && creds.username && creds.password

  return (
    <div className="mt-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
        <ImapField label="Email" id="im-email" className="sm:col-span-2">
          <input id="im-email" type="email" className={IMAP_INPUT} value={creds.email} onChange={(e) => set('email', e.target.value)} />
        </ImapField>

        <ImapField label="IMAP Host" id="im-host">
          <input id="im-host" className={IMAP_INPUT} value={creds.imap_host} onChange={(e) => set('imap_host', e.target.value)} />
        </ImapField>

        <ImapField label="IMAP Port" id="im-port">
          <input id="im-port" type="number" className={`${IMAP_INPUT} tabular-nums`} value={creds.imap_port} onChange={(e) => set('imap_port', Number(e.target.value))} />
        </ImapField>

        <ImapField label="Username" id="im-user">
          <input id="im-user" className={IMAP_INPUT} value={creds.username} onChange={(e) => set('username', e.target.value)} />
        </ImapField>

        <ImapField label="Password" id="im-pass">
          <input id="im-pass" type="password" className={IMAP_INPUT} value={creds.password} onChange={(e) => set('password', e.target.value)} />
        </ImapField>

        <ImapField label="Encryption" id="im-enc">
          <select id="im-enc" className={`${IMAP_INPUT} appearance-none`} value={creds.encryption} onChange={(e) => set('encryption', e.target.value)}>
            {ENCRYPTIONS.map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </ImapField>
      </div>

      <button
        type="button"
        onClick={() => onSave(creds)}
        disabled={!ready || saving}
        style={{ background: '#2fbf72' }}
        className="mt-5 h-[40px] px-5 rounded-lg text-white text-sm font-semibold hover:brightness-105 transition-all
                   disabled:opacity-50 disabled:pointer-events-none"
      >
        {saving ? 'Saving…' : 'Save IMAP Settings'}
      </button>
    </div>
  )
}

function ImapField({ label, id, className = '', children }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  )
}
