import { NavLink, Outlet } from 'react-router-dom'
import { api } from '../api/client.js'
const nav = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/mailboxes', label: 'Mailboxes', icon: '📬' },
  { to: '/outreach', label: 'Outreach', icon: '🚀' },
  { to: '/conversations', label: 'Conversations', icon: '💬' },
  { to: '/leads', label: 'Leads', icon: '⭐' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]
export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-100">
          <span className="text-xl">✉️</span><span className="font-semibold text-slate-800">Email Agent</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span>{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </nav>
        {api.useMock && (
          <div className="m-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700">
            Mock mode — sample data. Set <code>VITE_USE_MOCK=0</code> for the live backend.
          </div>
        )}
      </aside>
      <main className="flex-1 min-w-0"><Outlet /></main>
    </div>
  )
}
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-10">
      <div><h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}</div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  )
}
