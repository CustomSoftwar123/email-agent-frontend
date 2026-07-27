import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import { Avatar, Card, Empty, SearchInput, SkeletonTable, StatusBadge, useToast } from '../components/ui.jsx'
import { IconFile, IconLock, IconSend, IconUnlock, IconUpload } from '../components/icons.jsx'
import { api } from '../api/client.js'

const FILTERS = ['all', 'queued', 'sent', 'replied', 'bounced']

/** Accepts the same two shapes the outreach runner reads: CSV rows or a JSON array. */
function parseProspects(text) {
  const trimmed = text.trim()
  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed)
        .map((r) => ({ name: r.name || (r.email || '').split('@')[0] || 'Customer', email: r.email || '' }))
        .filter((r) => r.email.includes('@'))
    } catch {
      return []
    }
  }
  return trimmed
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^name\s*,\s*email$/i.test(l)) // drop a CSV header row
    .map((line) => {
      const [a, b] = line.split(',').map((x) => x.trim().replace(/^"|"$/g, ''))
      return b ? { name: a, email: b } : { name: a.split('@')[0] || 'Customer', email: a }
    })
    .filter((r) => r.email.includes('@'))
}

export default function Outreach() {
  const [rows, setRows] = useState(null)
  const [raw, setRaw] = useState('')
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState([])
  const fileInput = useRef(null)
  const toast = useToast()

  const load = () => api.getProspects().then(setRows)
  useEffect(() => {
    load()
  }, [])

  const parsed = useMemo(() => parseProspects(raw), [raw])

  function readFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setRaw(String(reader.result))
      setFileName(file.name)
    }
    reader.readAsText(file)
  }

  async function importProspects() {
    if (!parsed.length) return
    setBusy(true)
    await api.addProspects(parsed)
    setRaw('')
    setFileName('')
    await load()
    setBusy(false)
    toast(`${parsed.length} prospect${parsed.length > 1 ? 's' : ''} queued`)
  }

  const queued = (rows || []).filter((p) => p.status === 'queued')
  const targets = selected.length ? selected : queued.map((p) => p.id)

  async function run() {
    if (!targets.length) return
    setBusy(true)
    const res = await api.startOutreach(targets)
    setSelected([])
    await load()
    setBusy(false)
    toast(
      res.skipped
        ? `Sent ${res.started} · skipped ${res.skipped} already locked`
        : `Outreach started for ${res.started} prospect${res.started > 1 ? 's' : ''}`,
    )
  }

  const visible = (rows || []).filter((p) => {
    const matchesFilter = filter === 'all' || p.status === filter
    const q = query.trim().toLowerCase()
    const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    return matchesFilter && matchesQuery
  })

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const visibleQueued = visible.filter((p) => p.status === 'queued')
  const allSelected = visibleQueued.length > 0 && visibleQueued.every((p) => selected.includes(p.id))

  return (
    <>
      <PageHeader
        eyebrow="Workflow A"
        icon={<IconSend size={12} />}
        title="Outreach runner"
        subtitle="Workflow A — the local trigger that starts cold outreach"
        actions={
          <button className="btn-primary" onClick={run} disabled={busy || !targets.length}>
            <IconSend size={15} />
            {busy ? 'Running…' : `Run outreach (${targets.length})`}
          </button>
        }
      />

      <div className="page-body grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <div className="space-y-5 xl:sticky xl:top-24">
          <Card title="Prospects list" subtitle="CSV or JSON — “Name, email” per row, or just an email">
            <div className="flex items-center gap-2 mb-3">
              <button type="button" className="btn-secondary" onClick={() => fileInput.current?.click()}>
                <IconFile size={15} />
                Choose file
              </button>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,.json,.txt"
                className="hidden"
                onChange={(e) => readFile(e.target.files?.[0])}
              />
              <span className="text-xs text-faint truncate">{fileName || 'or paste below'}</span>
            </div>

            <textarea
              className="input font-mono text-xs leading-relaxed"
              rows={7}
              placeholder={'Ali Raza, ali@acme.com\nsara@globex.io'}
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value)
                setFileName('')
              }}
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="hint">
                {parsed.length ? `${parsed.length} valid address${parsed.length > 1 ? 'es' : ''}` : 'Nothing to import yet'}
              </span>
              <button className="btn-secondary" onClick={importProspects} disabled={busy || !parsed.length}>
                <IconUpload size={15} />
                Add to queue
              </button>
            </div>
          </Card>

          <Card title="Same thing from the CLI" subtitle="The runner takes a list or a single prospect" bodyClass="p-0">
            <pre className="overflow-x-auto px-5 py-4 text-xs leading-relaxed font-mono text-muted">
              {'agent outreach --file prospects.csv\n\nagent outreach \\\n  --email ali@acme.com \\\n  --name "Ali Raza"'}
            </pre>
          </Card>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <SearchInput value={query} onChange={setQuery} placeholder="Search prospects…" className="sm:max-w-xs" />
            <div className="flex gap-1 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 h-8 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                    filter === f ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:text-ink hover:bg-page'
                  }`}
                >
                  {f}
                  {f !== 'all' && rows && (
                    <span className="ml-1 text-faint tabular-nums">{rows.filter((p) => p.status === f).length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {!rows ? (
            <SkeletonTable rows={4} cols={4} />
          ) : visible.length === 0 ? (
            <Empty
              icon={<IconUpload size={20} />}
              title={rows.length ? 'No prospects match' : 'The queue is empty'}
              hint={
                rows.length
                  ? 'Try a different search or filter.'
                  : 'Load a prospects list on the left to get started.'
              }
            />
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr>
                      <th className="th w-px pr-0">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[var(--accent)] align-middle"
                          checked={allSelected}
                          disabled={!visibleQueued.length}
                          onChange={() => setSelected(allSelected ? [] : visibleQueued.map((p) => p.id))}
                          aria-label="Select all queued prospects"
                        />
                      </th>
                      <th className="th">Prospect</th>
                      <th className="th">Sends from</th>
                      <th className="th">Send lock</th>
                      <th className="th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((p) => (
                      <tr key={p.id} className="row">
                        <td className="td pr-0">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-[var(--accent)] align-middle disabled:opacity-30"
                            checked={selected.includes(p.id)}
                            disabled={p.status !== 'queued'}
                            onChange={() => toggle(p.id)}
                            aria-label={`Select ${p.email}`}
                          />
                        </td>
                        <td className="td">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.name} size={32} />
                            <div className="min-w-0">
                              <div className="font-medium text-ink truncate">{p.name}</div>
                              <div className="text-xs text-faint truncate">{p.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="td text-xs whitespace-nowrap">{p.mailbox ?? '—'}</td>
                        <td className="td">
                          {p.send_lock && p.send_lock !== 'none' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                              <IconLock size={13} className="text-faint" />
                              taken
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-faint">
                              <IconUnlock size={13} />
                              free
                            </span>
                          )}
                        </td>
                        <td className="td">
                          <StatusBadge value={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <p className="hint">
            Each prospect gets a one-time send lock, so running the same list twice never double-mails anyone. Every send
            is checked against the local daily limit first.
          </p>
        </div>
      </div>
    </>
  )
}
