export function StatCard({ label, value, hint, tone = 'default' }) {
  const tones = { default: 'text-slate-800', good: 'text-emerald-600', warn: 'text-amber-600', bad: 'text-red-600' }
  return (
    <div className="card p-5">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tones[tone]}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  )
}
const badgeTones = { connected:'bg-emerald-50 text-emerald-700', error:'bg-red-50 text-red-700',
  queued:'bg-slate-100 text-slate-600', sent:'bg-brand-50 text-brand-700', replied:'bg-violet-50 text-violet-700',
  cold:'bg-slate-100 text-slate-600', warm:'bg-amber-50 text-amber-700', hot:'bg-red-50 text-red-700' }
export function StatusBadge({ value }) {
  return <span className={`badge ${badgeTones[value] || 'bg-slate-100 text-slate-600'}`}>{value}</span>
}
const providerIcon = { gmail: '📧', outlook: '📨', imap: '✉️' }
export function ProviderTag({ provider }) {
  return <span className="badge bg-slate-100 text-slate-700">{providerIcon[provider] || '✉️'} {provider}</span>
}
export function Loading({ label = 'Loading…' }) { return <div className="p-8 text-sm text-slate-400">{label}</div> }
export function Empty({ label }) {
  return <div className="p-10 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">{label}</div>
}
