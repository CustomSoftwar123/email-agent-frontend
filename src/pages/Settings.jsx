import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import { Loading } from '../components/ui.jsx'
import { api } from '../api/client.js'
export default function Settings() {
  const [s, setS] = useState(null); const [saved, setSaved] = useState(false); const [saving, setSaving] = useState(false)
  useEffect(() => { api.getSettings().then(setS) }, [])
  const setCompany = (k, v) => setS({ ...s, company: { ...s.company, [k]: v } })
  const setAgent = (k, v) => setS({ ...s, agent: { ...s.agent, [k]: v } })
  async function save(e) { e.preventDefault(); setSaving(true); await api.saveSettings(s); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  if (!s) return (<><PageHeader title="Settings" /><Loading /></>)
  return (
    <><PageHeader title="Company & Agent" subtitle="What the AI knows and how it behaves"
      actions={<button form="settings-form" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}</button>} />
      <form id="settings-form" onSubmit={save} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        <section className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Company profile</h2>
          <p className="text-xs text-slate-500 -mt-2">Used live in every email; overrides any old details.</p>
          <div><label className="label">Company name</label><input className="input" value={s.company.name} onChange={(e) => setCompany('name', e.target.value)} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={s.company.description} onChange={(e) => setCompany('description', e.target.value)} /></div>
          <div><label className="label">Pricing guidance</label><textarea className="input" rows={2} value={s.company.pricing} onChange={(e) => setCompany('pricing', e.target.value)} /></div>
          <div><label className="label">Address</label><input className="input" value={s.company.address} onChange={(e) => setCompany('address', e.target.value)} /></div>
        </section>
        <section className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Agent behaviour</h2>
          <p className="text-xs text-slate-500 -mt-2">Tone, spend limit, and lead capture.</p>
          <div><label className="label">Persona / tone</label><textarea className="input" rows={4} value={s.agent.persona} onChange={(e) => setAgent('persona', e.target.value)} /></div>
          <div><label className="label">Daily send limit (0 = unlimited)</label><input type="number" min="0" className="input" value={s.agent.daily_send_limit} onChange={(e) => setAgent('daily_send_limit', Number(e.target.value))} /></div>
          <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" checked={s.agent.capture_leads} onChange={(e) => setAgent('capture_leads', e.target.checked)} className="w-4 h-4" />Capture warm/hot prospects as leads</label>
        </section>
      </form></>
  )
}
