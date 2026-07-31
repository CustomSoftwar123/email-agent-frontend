import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import { BarList, ColumnChart } from '../components/charts.jsx'
import { Card, Empty, Skeleton, SkeletonCards, StatCard, StatusBadge } from '../components/ui.jsx'
import {
  IconAlert,
  IconBolt,
  IconChart,
  IconChat,
  IconInbox,
  IconMail,
  IconRefresh,
  IconSend,
  IconStar,
} from '../components/icons.jsx'
import { api } from '../api/client.js'

// Slot order is fixed: sent is always series 1, replies always series 2.
const SERIES = [
  { key: 'sent', label: 'Sent', color: 'var(--series-1)' },
  { key: 'replies', label: 'Replies', color: 'var(--series-2)' },
]

// Lead temperature is a state, not an identity, so it wears the status ramp.
const LEAD_STAGES = [
  { key: 'hot', color: 'var(--danger)' },
  { key: 'warm', color: 'var(--warn)' },
  { key: 'cold', color: 'var(--dim)' },
]

export default function Dashboard() {
  const [status, setStatus] = useState(null)
  const [activity, setActivity] = useState(null)
  const [leads, setLeads] = useState(null)
  const [mailboxes, setMailboxes] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = () =>
    Promise.all([api.getStatus(), api.getActivity(), api.getLeads(), api.getMailboxes()])
      .then(([s, a, l, m]) => {
        setStatus(s)
        setActivity(a)
        setLeads(l)
        setMailboxes(m)
      })
      .catch(() => {})

  useEffect(() => {
    load()
  }, [])

  async function refresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const daily = status?.daily ?? []
  const replyTrend = daily.map((d) => d.replies)
  const sentTrend = daily.map((d) => d.sent)
  // The backend always returns a full 14-day window, so an all-zero series is
  // "nothing has been sent yet" rather than "no data" — say so instead of
  // drawing fourteen empty columns, and keep flat sparklines off the tiles.
  const hasTraffic = daily.some((d) => d.sent > 0 || d.replies > 0)
  const repliesWindow = replyTrend.reduce((a, b) => a + b, 0)
  const sentWindow = sentTrend.reduce((a, b) => a + b, 0)

  const pipeline = LEAD_STAGES.map(({ key, color }) => ({
    label: key,
    color,
    value: (leads ?? []).filter((l) => l.status === key).length,
  }))

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        icon={<IconChart size={12} />}
        title="Agent Dashboard"
        subtitle="What Corvo has answered, captured and is watching right now."
        actions={
          <>
            <span className="ai-chip">
              <IconBolt size={13} />
              AI agent {status?.poller_running ? 'active' : 'stopped'}
            </span>
            <button className="btn-secondary" onClick={refresh} disabled={refreshing}>
              <IconRefresh size={15} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </>
        }
      />

      <div className="page-body space-y-6">
        <RunStateBand
          status={status}
          mailboxes={mailboxes}
          sentWindow={sentWindow}
          repliesWindow={repliesWindow}
        />

        {!status ? (
          <SkeletonCards />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* The lead metric — the one the chart below plots — is the only
                tile with the accent rule; the rest identify by chip alone. */}
            <StatCard
              primary
              tone="accent"
              icon={<IconSend size={18} />}
              label="Emails sent"
              period="Today"
              value={status.sent_today}
              delta={status.deltas?.sent}
              hint={`${sentWindow} in the last 14 days`}
              trend={sentWindow ? sentTrend : null}
              trendColor="var(--series-1)"
            />
            <StatCard
              tone="info"
              icon={<IconChat size={18} />}
              label="Replies received"
              period="Today"
              value={status.replies_today}
              delta={status.deltas?.replies}
              hint={`${repliesWindow} in the last 14 days`}
              trend={repliesWindow ? replyTrend : null}
              trendColor="var(--series-2)"
            />
            <StatCard
              tone="violet"
              icon={<IconInbox size={18} />}
              label="Active threads"
              period="Auto-replying"
              value={status.threads}
              delta={status.deltas?.threads}
              hint={mailboxes?.length ? `across ${mailboxes.length} mailbox${mailboxes.length > 1 ? 'es' : ''}` : null}
            />
            <StatCard
              tone="good"
              icon={<IconStar size={18} />}
              label="Leads captured"
              period="Warm / hot"
              value={status.leads}
              delta={status.deltas?.leads}
              hint={pipeline[0].value ? `${pipeline[0].value} hot right now` : null}
            />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card
            className="xl:col-span-2"
            title="Sending activity"
            subtitle="Sent and replies per day, last 14 days"
            bodyClass="px-5 pb-5 pt-2"
          >
            {!status ? (
              <Skeleton className="h-[240px] w-full" />
            ) : !hasTraffic ? (
              <Empty
                icon={<IconSend size={19} />}
                title="No mail recorded yet"
                hint="Every reply the agent sends, and every message it answers, lands here. The window starts over when the backend restarts."
              />
            ) : (
              <ColumnChart
                data={daily.map((d) => ({ label: d.label, values: { sent: d.sent, replies: d.replies } }))}
                series={SERIES}
                height={240}
              />
            )}
          </Card>

          <Card title="Lead pipeline" subtitle="By temperature" bodyClass="p-5">
            {!leads ? (
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <BarList items={pipeline} emptyLabel="No leads captured yet." />
                <p className="mt-5 pt-4 border-t border-line text-xs text-faint">
                  Captured automatically once a thread reads warm or hot, or a phone number appears.
                </p>
              </>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card
            className="xl:col-span-2 overflow-hidden"
            title="Mailboxes"
            subtitle="Every connected account the poller watches"
            bodyClass="p-0"
          >
            {!mailboxes ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : mailboxes.length === 0 ? (
              <div className="p-5">
                <Empty
                  icon={<IconMail size={19} />}
                  title="No mailbox connected"
                  hint="Connect one from Manage Agents and the agent starts watching it for new mail."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="th">Mailbox</th>
                      <th className="th">Agent</th>
                      <th className="th">Watcher</th>
                      <th className="th text-right">Last checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mailboxes.map((m) => (
                      <tr key={m.id}>
                        <td className="td">
                          <span className="block text-ink font-medium truncate">{m.email}</span>
                          <span className="block text-xs text-faint uppercase tracking-wide">{m.provider}</span>
                        </td>
                        <td className="td">{m.agent}</td>
                        <td className="td"><StatusBadge value={m.watcher === 'running' ? 'active' : m.watcher} /></td>
                        <td className="td text-right text-faint whitespace-nowrap">{m.last_checked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Recent activity" subtitle="Latest replies and captures" bodyClass="p-2">
            {!activity ? (
              <div className="p-3 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-4/5" />
                      <Skeleton className="h-2.5 w-2/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-faint">Nothing has happened yet.</p>
            ) : (
              <ul className="space-y-0.5">
                {activity.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

/**
 * The one saturated element on the page — it anchors the top and answers the
 * first question a user opening the app has: is the agent actually running?
 */
function RunStateBand({ status, mailboxes, sentWindow, repliesWindow }) {
  const live = !!status?.poller_running
  const facts = [
    { label: 'Checked every', value: status ? `${status.poll_interval}s` : '—' },
    { label: 'Mailboxes', value: mailboxes ? String(mailboxes.length) : '—' },
    { label: 'Sent in 14 days', value: status ? String(sentWindow) : '—' },
    { label: 'Replies in 14 days', value: status ? String(repliesWindow) : '—' },
  ]

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-4 sm:px-6 sm:py-5 text-white"
      // The flat presets set --accent-gradient to none, so the solid accent
      // underneath is what they show — the band is never text on nothing.
      style={{
        backgroundColor: 'var(--accent)',
        backgroundImage: 'var(--accent-gradient)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <span
        className="pointer-events-none absolute -right-10 -top-16 w-48 h-48 rounded-full"
        style={{ background: 'rgba(255,255,255,0.12)' }}
      />
      <div className="relative flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold">
            {/* State never rests on colour alone — there is a label beside it. */}
            <span className={`w-2 h-2 rounded-full ${live ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
            {live ? 'Agent is live' : 'Agent is stopped'}
          </span>
          <p className="mt-1 text-xs text-white/75">
            {live
              ? 'Watching every connected mailbox and replying on its own.'
              : 'Start the poller to resume auto-replies.'}
          </p>
        </div>

        <dl className="flex flex-wrap items-center gap-x-8 gap-y-3 sm:ml-auto">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-[11px] uppercase tracking-wide text-white/65">{f.label}</dt>
              <dd className="text-lg font-semibold leading-tight">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

const ACTIVITY_STYLES = {
  lead: { Icon: IconStar, className: 'bg-good-soft text-good-ink' },
  reply: { Icon: IconChat, className: 'bg-violet-soft text-violet-ink' },
  sent: { Icon: IconSend, className: 'bg-accent-soft text-accent-ink' },
  error: { Icon: IconAlert, className: 'bg-danger-soft text-danger-ink' },
}

/** Today's entries only need the clock; older ones need the day. */
function shortStamp(at) {
  const [day, time] = String(at ?? '').split(' ')
  if (!time) return at
  // en-CA gives YYYY-MM-DD in *local* time, which is what the backend stamps.
  const today = new Date().toLocaleDateString('en-CA')
  return day === today ? time.slice(0, 5) : `${day.slice(5)} ${time.slice(0, 5)}`
}

function ActivityRow({ item }) {
  const { Icon, className } = ACTIVITY_STYLES[item.type] || ACTIVITY_STYLES.sent
  return (
    <li className="flex gap-3 px-3 py-2.5 rounded-lg hover:bg-page transition-colors">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${className}`}>
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink truncate">{item.title}</p>
        <p className="text-xs text-faint truncate">{item.detail}</p>
      </div>
      <span className="text-[11px] text-faint tabular-nums shrink-0" title={item.at}>
        {shortStamp(item.at)}
      </span>
    </li>
  )
}
