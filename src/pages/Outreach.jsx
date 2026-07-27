import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import { StatusBadge, Loading, Empty } from '../components/ui.jsx'
import { api } from '../api/client.js'
export default function Outreach() {
  const [rows, setRows] = useState(null); const [raw, setRaw] = useState(''); const [busy, setBusy] = useState(false)
  const load = () => api.getProspects().then(setRows)
  useEffect(() => { load() }, [])
  function parse(text) {
    return text.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const [a, b] = line.split(',').map((x) => x.trim())
      return b ? { name: a, email: b } : { name: (a.split('@')[0] || 'Customer'), email: a }
    }).filter((r) => r.email.includes('@'))
  }
  async function importProspects() { const parsed = parse(raw); if (!parsed.length) return; setBusy(true); await api.addProspects(parsed); setRaw(''); await load(); setBusy(false) }
  async function startAll() { const q = (rows || []).filter((p) => p.status === 'queued').map((p) => p.id); if (!q.length) return; setBusy(true); await api.startOutreach(q); await load(); setBusy(false) }
  const queuedCount = (rows || []).filter((p) => p.status === 'queued').length
  return (
    <><PageHeader title="Outreach" subtitle="Scenario 1 — start the first cold email to prospects"
      actions={<button className="btn-primary" onClick={startAll} disabled={busy || !queuedCount}>🚀 Start outreach ({queuedCount})</button>} />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-slate-800">Import prospects</h2>
          <p className="text-xs text-slate-500">One per line — <code>Name, email</code> or just an email.</p>
          <textarea className="input font-mono text-xs" rows={8} placeholder={'Ali Raza, ali@acme.com\nsara@globex.io'} value={raw} onChange={(e) => setRaw(e.target.value)} />
          <button className="btn-ghost border border-slate-200 w-full" onClick={importProspects} disabled={busy || !raw.trim()}>+ Add to queue</button>
        </div>
        <div className="lg:col-span-2">{!rows ? <Loading /> : rows.length === 0 ? <Empty label="No prospects yet. Import some on the left." /> : (
          <div className="card overflow-hidden"><table className="w-full">
            <thead className="bg-slate-50"><tr><th className="th">Name</th><th className="th">Email</th><th className="th">Status</th></tr></thead>
            <tbody>{rows.map((p) => (<tr key={p.id}><td className="td font-medium">{p.name}</td><td className="td text-slate-500">{p.email}</td><td className="td"><StatusBadge value={p.status} /></td></tr>))}</tbody>
          </table></div>)}</div>
      </div></>
  )
}
