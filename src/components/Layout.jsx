import { createContext, useContext, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useTheme } from '../lib/theme.jsx'
import {
  IconClose,
  IconInfo,
  IconDashboard,
  IconChevronDown,
  IconMail,
  IconMenu,
  IconMoon,
  IconPlus,
  IconRobot,
  IconSend,
  IconSparkles,
  IconSun,
} from './icons.jsx'

const NAV = [
  {
    group: 'Overview',
    items: [{ to: '/', label: 'Dashboard', Icon: IconDashboard, end: true }],
  },
  {
    group: 'Company',
    items: [{ to: '/company-info', label: 'Company Info', Icon: IconInfo }],
  },
  {
    group: 'Workflows',
    items: [{ to: '/outreach', label: 'Outreach', Icon: IconSend }],
  },
  {
    group: 'Activities',
    items: [{ to: '/emails', label: 'Emails', Icon: IconMail }],
  },
  {
    group: 'Configuration',
    items: [
      { to: '/agents', label: 'Manage Agents', Icon: IconRobot, agents: true },
    ],
  },
]

const NavContext = createContext({ openNav: () => {} })

export default function Layout() {
  const [navOpen, setNavOpen] = useState(false)
  const [agents, setAgents] = useState([])
  const { theme, toggle } = useTheme()
  const location = useLocation()

  // The agent list lives in the sidebar, so it reloads whenever an agent is
  // added, renamed or deleted on the Manage Agents screen.
  useEffect(() => {
    api.getAgents().then(setAgents).catch(() => setAgents([]))
  }, [location.key])

  useEffect(() => setNavOpen(false), [location.pathname])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setNavOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <NavContext.Provider value={{ openNav: () => setNavOpen(true) }}>
      <div className="min-h-screen lg:flex">
        {navOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setNavOpen(false)} aria-hidden="true" />
        )}

        {/* Sidebar — brand gradient with white ink */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col text-white
                      transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto lg:shrink-0
                      ${navOpen ? 'translate-x-0 shadow-pop' : '-translate-x-full'}`}
          style={{ backgroundImage: 'var(--sidebar-gradient)' }}
        >
          <div className="flex items-center gap-2.5 px-4 pt-[18px] pb-3">
            <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <IconSparkles size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold leading-tight tracking-tight">Email Agent</span>
              <span className="block text-[11px] text-white/60 leading-tight">Standalone edition</span>
            </span>
            <button
              className="ml-auto lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:bg-white/10"
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
            >
              <IconClose />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto pb-3">
            {NAV.map(({ group, items }) => (
              <div key={group}>
                <p className="px-[26px] mt-[18px] mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">
                  {group}
                </p>
                {items.map((item) =>
                  item.agents ? (
                    <AgentsNav key={item.to} item={item} agents={agents} />
                  ) : (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `mx-3 my-1 flex items-center gap-3 rounded-xl px-3.5 py-[11px] text-sm font-medium transition-colors ${
                          isActive ? 'bg-white/[0.18] text-white shadow-xs' : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <item.Icon size={17} />
                      {item.label}
                    </NavLink>
                  ),
                )}
              </div>
            ))}
          </nav>

        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Navbar — white, hairline bottom, extra-small shadow */}
          <header
            className="sticky top-0 z-30 h-16 shrink-0 flex items-center gap-3 px-4 sm:px-6 bg-surface border-b border-line"
            style={{ boxShadow: 'var(--shadow-xs)' }}
          >
            <button className="btn-icon lg:hidden -ml-1" onClick={() => setNavOpen(true)} aria-label="Open menu">
              <IconMenu />
            </button>

            <p className="text-sm font-semibold text-ink">
              Welcome back<span className="hidden sm:inline">, operator</span>
            </p>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-subtle px-3 h-8 text-xs font-semibold text-faint">
                <span className="w-1.5 h-1.5 rounded-full bg-good" />
                Standalone deployment
              </span>
              <button
                className="btn-icon"
                onClick={toggle}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
              >
                {theme === 'dark' ? <IconSun /> : <IconMoon />}
              </button>
            </div>
          </header>

          <main className="flex-1 min-w-0 flex flex-col">
            <Outlet />
          </main>
        </div>
      </div>
    </NavContext.Provider>
  )
}

/**
 * In-content page header: eyebrow, 1.55rem/800 title, sub, and
 * right-aligned actions.
 */
export function PageHeader({ eyebrow, icon, title, subtitle, actions }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-5 flex items-start justify-between flex-wrap gap-4 animate-fade-up">
      <div className="min-w-0">
        {eyebrow && (
          <p className="ph-eyebrow">
            {icon}
            {eyebrow}
          </p>
        )}
        <h1 className="ph-title">{title}</h1>
        {subtitle && <p className="ph-sub">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  )
}

/**
 * "Manage Agents" — collapses to a normal nav row, expands into a white panel
 * listing every agent as a radio item, with Add Agent underneath.
 */
function AgentsNav({ item, agents }) {
  const location = useLocation()
  const navigate = useNavigate()
  const onAgents = location.pathname.startsWith('/agents')
  const [open, setOpen] = useState(onAgents)
  const currentId = onAgents ? location.pathname.split('/')[2] : null

  useEffect(() => {
    if (onAgents) setOpen(true)
  }, [onAgents])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`mx-3 my-1 w-[calc(100%-1.5rem)] flex items-center gap-3 rounded-xl px-3.5 py-[11px] text-sm font-medium transition-colors ${
          onAgents ? 'bg-white/[0.18] text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        <item.Icon size={17} />
        {item.label}
        <IconChevronDown size={15} className="ml-auto" />
      </button>
    )
  }

  return (
    <div className="mx-3 my-1 rounded-xl bg-surface text-ink shadow-pop overflow-hidden">
      <button
        onClick={() => setOpen(false)}
        className="w-full flex items-center gap-3 px-3.5 py-3 text-sm font-semibold hover:bg-subtle transition-colors"
      >
        <item.Icon size={18} className="text-accent" />
        {item.label}
        <IconChevronDown size={15} className="ml-auto rotate-180 text-faint" />
      </button>

      <ul className="px-2 pb-1">
        {agents.map((a) => {
          const active = String(a.id) === currentId
          return (
            <li key={a.id}>
              <button
                onClick={() => navigate(`/agents/${a.id}`)}
                className={`w-full flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                  active ? 'bg-subtle' : 'hover:bg-subtle'
                }`}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                    active ? 'border-ink' : 'border-line-strong'
                  }`}
                >
                  {active && <span className="w-2 h-2 rounded-full bg-ink" />}
                </span>
                <span className="text-sm text-ink truncate">{a.name}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-line mx-3" />
      <button
        onClick={() => navigate('/agents/new')}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-accent hover:bg-subtle transition-colors"
      >
        <IconPlus size={16} />
        Add Agent
      </button>
    </div>
  )
}

export const useNav = () => useContext(NavContext)
