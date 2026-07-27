import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/Layout.jsx'
import { ColumnChart } from '../components/charts.jsx'
import { Card, Skeleton, SkeletonCards, StatCard } from '../components/ui.jsx'
import {
  IconAlert,
  IconBolt,
  IconChart,
  IconChat,
  IconChevronRight,
  IconInbox,
  IconRefresh,
  IconSend,
  IconStar,
} from '../components/icons.jsx'
import { api } from '../api/client.js'

export default function Dashboard() {
  const [status, setStatus] = useState(null)
  const [activity, setActivity] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = () =>
    Promise.all([api.getStatus(), api.getActivity()]).then(([s, a]) => {
      setStatus(s)
      setActivity(a)
    })

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

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        icon={<IconChart size={12} />}
        title="Agent Dashboard"
        subtitle="Your standalone email agent at a glance — self-contained, with no shared database."
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
        {!status ? (
          <SkeletonCards />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              tone="indigo"
              icon={<IconSend size={18} />}
              label="Emails sent"
              period="Today"
              value={status.sent_today}
              delta={status.deltas?.sent}
              hint={`of ${status.daily_limit} daily limit`}
              progress={{ value: status.sent_today, max: status.daily_limit }}
            />
            <StatCard
              tone="sky"
              icon={<IconChat size={18} />}
              label="Replies received"
              period="Today"
              value={status.replies_today}
              delta={status.deltas?.replies}
              hint={`${status.reply_rate}% reply rate`}
              trend={replyTrend}
            />
            <StatCard
              tone="violet"
              icon={<IconInbox size={18} />}
              label="Active threads"
              period="Auto-replying"
              value={status.threads}
              delta={status.deltas?.threads}
            />
            <StatCard
              tone="emerald"
              icon={<IconStar size={18} />}
              label="Leads captured"
              period="Warm / hot"
              value={status.leads}
              delta={status.deltas?.leads}
            />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card
            className="xl:col-span-2"
            title="Emails sent"
            subtitle="Last 14 days, all mailboxes"
            bodyClass="px-5 pb-5 pt-2"
          >
            {!status ? (
              <Skeleton className="h-[200px] w-full" />
            ) : daily.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm text-faint">
                No sends recorded yet.
              </div>
            ) : (
              <ColumnChart
                data={daily.map((d) => ({ label: d.label, value: d.sent }))}
                valueLabel="Emails"
              />
            )}
          </Card>

          <Card
            title="Recent activity"
            subtitle="Today"
            bodyClass="p-2"
            actions={
              <Link to="/emails" className="btn-ghost -mr-2 text-xs">
                View emails
                <IconChevronRight size={14} />
              </Link>
            }
          >
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

const ACTIVITY_STYLES = {
  lead: { Icon: IconStar, className: 'bg-good-soft text-good-ink' },
  reply: { Icon: IconChat, className: 'bg-violet-soft text-violet-ink' },
  sent: { Icon: IconSend, className: 'bg-accent-soft text-accent-ink' },
  error: { Icon: IconAlert, className: 'bg-danger-soft text-danger-ink' },
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
      <span className="text-[11px] text-faint tabular-nums shrink-0">{item.at}</span>
    </li>
  )
}


