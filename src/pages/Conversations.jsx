import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import { StatusBadge, Loading, Empty } from '../components/ui.jsx'
import { api } from '../api/client.js'
export default function Conversations() {
  const [rows, setRows] = useState(null); const [active, setActive] = useState(null)
  useEffect(() => { api.getConversations().then((c) => { setRows(c); setActive(c[0] || null) }) }, [])
  return (
    <><PageHeader title="Conversations" subtitle="Scenario 2 — threads the agent is auto-replying to" />
      <div className="p-8">{!rows ? <Loading /> : rows.length === 0 ? <Empty label="No conversations yet." /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card overflow-hidden divide-y divide-slate-100">{rows.map((c) => (
            <button key={c.id} onClick={() => setActive(c)} className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${active?.id === c.id ? 'bg-brand-50' : ''}`}>
              <div className="flex items-center justify-between"><span className="font-medium text-sm text-slate-800 truncate">{c.counterparty}</span><StatusBadge value={c.lead_status} /></div>
              <div className="text-xs text-slate-500 truncate">{c.subject}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{c.updated_at}</div>
            </button>))}</div>
          <div className="lg:col-span-2 card p-5">{!active ? <Empty label="Select a conversation." /> : (<>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div><div className="font-semibold text-slate-800">{active.counterparty}</div><div className="text-xs text-slate-500">{active.subject}</div></div>
              <StatusBadge value={active.lead_status} />
            </div>
            <div className="space-y-3">{active.messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.from === 'agent' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  <div className="text-[10px] opacity-70 mb-1">{m.from === 'agent' ? 'AI agent' : 'Lead'} · {m.at}</div>{m.body}
                </div></div>))}</div></>)}</div>
        </div>)}</div></>
  )
}
