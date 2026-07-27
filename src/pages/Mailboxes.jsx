import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import { ProviderTag, StatusBadge, Loading, Empty } from '../components/ui.jsx'
import { api } from '../api/client.js'
const blank = { email: '', provider: 'gmail' }
export default function Mailboxes() {
  const [rows, setRows] = useState(null); const [form, setForm] = useState(blank); const [saving, setSaving] = useState(false)
  const load = () => api.getMailboxes().then(setRows)
  useEffect(() => { load() }, [])
  async function add(e) { e.preventDefault(); if (!form.email) return; setSaving(true); await api.addMailbox(form); setForm(blank); await load(); setSaving(false) }
  async function remove(id) { if (!confirm('Remove this mailbox?')) return; await api.deleteMailbox(id); load() }
  return (
    <><PageHeader title="Mailboxes" subtitle="Connected accounts the agent watches & sends from" />
      <div className="p-8 space-y-6">
        <form onSubmit={add} className="card p-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]"><label className="label">Email address</label>
            <input className="input" placeholder="sales@yourco.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="w-40"><label className="label">Provider</label>
            <select className="input" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
              <option value="gmail">Gmail</option><option value="outlook">Outlook</option><option value="imap">IMAP / SMTP</option>
            </select></div>
          <button className="btn-primary" disabled={saving}>{saving ? 'Adding…' : '+ Add mailbox'}</button>
        </form>
        {!rows ? <Loading /> : rows.length === 0 ? <Empty label="No mailboxes yet. Add one above." /> : (
          <div className="card overflow-hidden"><table className="w-full">
            <thead className="bg-slate-50"><tr><th className="th">Email</th><th className="th">Provider</th><th className="th">Role</th><th className="th">Status</th><th className="th"></th></tr></thead>
            <tbody>{rows.map((m) => (
              <tr key={m.id}>
                <td className="td font-medium">{m.email}</td>
                <td className="td"><ProviderTag provider={m.provider} /></td>
                <td className="td">{m.is_primary && <span className="badge bg-brand-50 text-brand-700 mr-1">primary</span>}
                  {m.leads_action ? <span className="badge bg-emerald-50 text-emerald-700">outreach</span> : <span className="badge bg-slate-100 text-slate-500">reply-only</span>}</td>
                <td className="td"><StatusBadge value={m.status} /></td>
                <td className="td text-right"><button className="btn-danger" onClick={() => remove(m.id)}>Remove</button></td>
              </tr>))}</tbody>
          </table></div>)}
      </div></>
  )
}
