import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import { StatCard, Loading } from '../components/ui.jsx'
import { api } from '../api/client.js'
export default function Dashboard() {
  const [status, setStatus] = useState(null)
  useEffect(() => { api.getStatus().then(setStatus) }, [])
  return (
    <><PageHeader title="Dashboard" subtitle="Standalone AI email agent — live status" />
      <div className="p-8">{!status ? <Loading /> : (<>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Poller" value={status.poller_running ? 'Running' : 'Stopped'} tone={status.poller_running ? 'good' : 'bad'} hint="Watches every inbox every 30s" />
          <StatCard label="Sent today" value={`${status.sent_today} / ${status.daily_limit}`} tone={status.sent_today >= status.daily_limit ? 'warn' : 'default'} hint="Daily send limit" />
          <StatCard label="Conversations" value={status.threads} hint="Active email threads" />
          <StatCard label="Leads captured" value={status.leads} tone="good" hint="Warm / hot prospects" />
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FlowCard icon="🚀" title="Scenario 1 — Cold outreach" steps={['Add prospects on the Outreach page','Agent takes a one-time send lock (no duplicates)','AI writes the first email from your company profile','Credit check → email sent → thread saved']} />
          <FlowCard icon="💬" title="Scenario 2 — Auto-reply" steps={['Poller checks each inbox every 30s','Filters self / no-reply / already-handled mail','Reply lock → AI writes reply from the thread','Credit check → reply sent → lead captured']} />
        </div></>)}</div></>
  )
}
function FlowCard({ icon, title, steps }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 font-semibold text-slate-800"><span>{icon}</span> {title}</div>
      <ol className="mt-3 space-y-2">{steps.map((s, i) => (
        <li key={i} className="flex gap-3 text-sm text-slate-600">
          <span className="shrink-0 w-5 h-5 rounded-full bg-brand-50 text-brand-700 text-xs flex items-center justify-center font-semibold">{i + 1}</span>{s}
        </li>))}</ol>
    </div>
  )
}
