import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal.jsx'
import { Empty, Skeleton, useToast } from '../components/ui.jsx'
import {
  IconCheck,
  IconInbox,
  IconMail,
  IconRefresh,
  IconSearch,
  IconSend,
  IconSparkles,
} from '../components/icons.jsx'
import { api } from '../api/client.js'

const FOLDERS = [
  { key: 'inbox', label: 'Inbox', Icon: IconInbox },
  { key: 'sent', label: 'Sent', Icon: IconSend },
]

const PROVIDER_LABEL = { gmail: 'GMAIL', outlook: 'OUTLOOK', imap: 'IMAP' }

export default function Emails() {
  const [rows, setRows] = useState(null)
  const [mailboxes, setMailboxes] = useState([])
  const [mailbox, setMailbox] = useState('all')
  const [folder, setFolder] = useState('all')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'date_sent', dir: 'desc' })
  const [refreshing, setRefreshing] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [summary, setSummary] = useState(null)
  const [composing, setComposing] = useState(false)
  const toast = useToast()

  const load = (f = folder) => api.getEmails(f).then(setRows)

  useEffect(() => {
    load(folder)
  }, [folder])

  useEffect(() => {
    api.getMailboxes().then(setMailboxes)
  }, [])

  async function refresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
    toast('Mailbox refreshed')
  }

  async function showSummary(email) {
    setSummary({ loading: true, subject: email.subject })
    const result = await api.summariseEmail(email.id)
    setSummary({ ...result, subject: email.subject })
  }

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))

  const visible = useMemo(() => {
    let list = rows ?? []
    if (mailbox !== 'all') {
      list = list.filter((e) => e.to === mailbox || e.from_email === mailbox)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (e) =>
          e.from_name.toLowerCase().includes(q) ||
          e.from_email.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => {
      const av = String(a[sort.key] ?? '')
      const bv = String(b[sort.key] ?? '')
      return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [rows, mailbox, search, sort])

  const primary = mailboxes[0]

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 pt-5">
        {/* Connection banner */}
        {primary ? (
          <div className="flex items-center gap-2.5 text-sm">
            <IconCheck size={17} className="text-good" />
            <span className="text-good-ink">
              Connected as <span className="font-bold">{primary.email}</span>
            </span>
            <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold tracking-wide text-white bg-good">
              {PROVIDER_LABEL[primary.provider] ?? primary.provider?.toUpperCase()}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <IconMail size={17} className="text-faint" />
            <span className="text-faint">No mailbox connected.</span>
            <Link to="/agents" className="font-semibold text-accent hover:underline">
              Connect one in Manage Agents
            </Link>
          </div>
        )}
      </div>

      <div className="page-body pt-5 grid grid-cols-1 lg:grid-cols-[170px_1fr] gap-6 items-start">
        {/* Folder rail */}
        <nav className="lg:sticky lg:top-24">
          <p className="text-[15px] font-semibold text-ink mb-3">Emails</p>
          <ul className="space-y-1">
            {FOLDERS.map(({ key, label, Icon }) => (
              <li key={key}>
                <button
                  onClick={() => setFolder(folder === key ? 'all' : key)}
                  className={`flex items-center gap-2.5 text-sm transition-colors ${
                    folder === key ? 'text-accent font-semibold' : 'text-accent/80 hover:text-accent'
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <select
              className="input h-11 w-auto min-w-[110px]"
              value={mailbox}
              onChange={(e) => setMailbox(e.target.value)}
              aria-label="Filter by mailbox"
            >
              <option value="all">All</option>
              {mailboxes.map((m) => (
                <option key={m.id} value={m.email}>{m.email}</option>
              ))}
            </select>

            <form
              className="flex-1 min-w-[220px] flex"
              onSubmit={(e) => {
                e.preventDefault()
                setSearch(query)
              }}
            >
              <input
                className="input h-11 rounded-r-none"
                placeholder="Search emails..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="h-11 px-4 rounded-lg rounded-l-none border border-l-0 border-line-strong bg-surface
                           text-faint hover:text-ink transition-colors"
                aria-label="Search"
              >
                <IconSearch size={18} />
              </button>
            </form>

            <button
              className="h-11 w-11 rounded-lg border border-line-strong bg-surface text-faint hover:text-ink
                         flex items-center justify-center transition-colors shrink-0"
              onClick={refresh}
              disabled={refreshing}
              aria-label="Refresh"
              title="Refresh"
            >
              <IconRefresh size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>

            <button className="btn-primary h-11 px-6" onClick={() => setComposing(true)}>
              Compose
            </button>
          </div>

          {/* Page title */}
          <div className="mb-5">
            <p className="ph-eyebrow">
              <IconMail size={13} />
              Mailbox
            </p>
            <h1 className="ph-title">Emails</h1>
            <p className="ph-sub">View your connected mailbox and compose messages to contacts.</p>
          </div>

          {/* Table */}
          {!rows ? (
            <div className="card p-2">
              <Skeleton className="h-11 w-full mb-2" />
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full mb-2" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <Empty
              icon={<IconMail size={20} />}
              title={rows.length ? 'No emails match' : 'This folder is empty'}
              hint={rows.length ? 'Try a different search term or mailbox.' : 'Messages appear here as the poller reads the mailbox.'}
            />
          ) : (
            <div className="card overflow-hidden">
              <div className="h-2.5" style={{ background: 'var(--accent)' }} />
              <div className="table-wrap">
                <table className="w-full min-w-[860px]">
                  <thead>
                    <tr>
                      <SortableTh label="From" col="from_name" sort={sort} onSort={toggleSort} />
                      <SortableTh label="Subject" col="subject" sort={sort} onSort={toggleSort} />
                      <SortableTh label="Body" col="body" sort={sort} onSort={toggleSort} />
                      <SortableTh label="Date Sent" col="date_sent" sort={sort} onSort={toggleSort} />
                      <th className="th w-px" />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((e) => (
                      <tr key={e.id} className="row cursor-pointer" onClick={() => setViewing(e)}>
                        <td className="td font-semibold text-ink whitespace-nowrap">{e.from_name}</td>
                        <td className="td text-ink max-w-[240px]">{e.subject}</td>
                        <td className="td">
                          <span className="block max-w-[260px] truncate text-faint">{e.body}</span>
                        </td>
                        <td className="td whitespace-nowrap text-faint">{e.date_sent}</td>
                        <td className="td text-right">
                          <button
                            className="btn-primary px-4"
                            onClick={(ev) => {
                              ev.stopPropagation()
                              showSummary(e)
                            }}
                          >
                            Show Summary
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View message */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.subject} width="max-w-2xl">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Detail label="From" value={`${viewing.from_name} <${viewing.from_email}>`} />
              <Detail label="To" value={viewing.to} />
              <Detail label="Date" value={viewing.date_sent} />
            </div>
            <div className="rounded-xl border border-line bg-subtle p-4 text-sm leading-relaxed text-muted whitespace-pre-wrap">
              {viewing.body}
            </div>
            <button
              className="btn-secondary"
              onClick={() => {
                const e = viewing
                setViewing(null)
                showSummary(e)
              }}
            >
              <IconSparkles size={15} className="text-accent" />
              Show Summary
            </button>
          </div>
        )}
      </Modal>

      {/* AI summary */}
      <Modal open={!!summary} onClose={() => setSummary(null)} title="Summary" subtitle={summary?.subject} width="max-w-xl">
        {summary?.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ) : (
          <div className="space-y-5">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-faint mb-1.5">Short Summary</h3>
              <p className="text-sm text-ink leading-relaxed">{summary?.short}</p>
            </section>
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-faint mb-1.5">Detailed Summary</h3>
              <p className="text-sm text-muted leading-relaxed">{summary?.detailed}</p>
            </section>
          </div>
        )}
      </Modal>

      <Compose
        open={composing}
        mailboxes={mailboxes}
        onClose={() => setComposing(false)}
        onSent={async (msg) => {
          await api.sendEmail(msg)
          await load()
          setComposing(false)
          toast(`Email sent to ${msg.to}`)
        }}
      />
    </>
  )
}

function SortableTh({ label, col, sort, onSort }) {
  const active = sort.key === col
  return (
    <th className="th">
      <button className="inline-flex items-center gap-1.5 uppercase" onClick={() => onSort(col)}>
        {label}
        <span className="flex flex-col leading-none text-[8px]">
          <span className={active && sort.dir === 'asc' ? 'opacity-100' : 'opacity-40'}>▲</span>
          <span className={active && sort.dir === 'desc' ? 'opacity-100' : 'opacity-40'}>▼</span>
        </span>
      </button>
    </th>
  )
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg border border-line px-3 py-2">
      <div className="text-[11px] text-faint">{label}</div>
      <div className="text-xs font-medium text-ink break-words">{value}</div>
    </div>
  )
}

function Compose({ open, onClose, onSent, mailboxes }) {
  const [form, setForm] = useState({ from: '', to: '', cc: '', subject: '', body: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open && mailboxes.length) setForm((f) => ({ ...f, from: f.from || mailboxes[0].email }))
  }, [open, mailboxes])

  const set = (k, v) => setForm({ ...form, [k]: v })
  const ready = form.from && form.to.includes('@') && form.subject && form.body

  async function submit(e) {
    e.preventDefault()
    if (!ready) return
    setSending(true)
    await onSent(form)
    setSending(false)
    setForm({ from: mailboxes[0]?.email ?? '', to: '', cc: '', subject: '', body: '' })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Compose"
      subtitle="Send from your connected mailbox"
      width="max-w-2xl"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button form="compose-form" className="btn-primary" disabled={!ready || sending}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </>
      }
    >
      <form id="compose-form" onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="cm-from">From</label>
          <select id="cm-from" className="input" value={form.from} onChange={(e) => set('from', e.target.value)}>
            {mailboxes.map((m) => (
              <option key={m.id} value={m.email}>{m.email}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="cm-to">To</label>
            <input id="cm-to" type="email" className="input" placeholder="contact@company.com" value={form.to} onChange={(e) => set('to', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="cm-cc">CC</label>
            <input id="cm-cc" className="input" placeholder="optional" value={form.cc} onChange={(e) => set('cc', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="cm-subject">Subject</label>
          <input id="cm-subject" className="input" value={form.subject} onChange={(e) => set('subject', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="cm-body">Body</label>
          <textarea id="cm-body" className="input leading-relaxed" rows={8} value={form.body} onChange={(e) => set('body', e.target.value)} />
        </div>
      </form>
    </Modal>
  )
}
