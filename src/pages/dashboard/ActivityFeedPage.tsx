import { useState, useMemo } from 'react'
import { Panel } from '../../components/ui/Panel'
import { ActivityItem } from '../../components/dashboard/ActivityItem'
import { activityFeed } from '../../data/dashboardSample'
import type { ActivityEntry } from '../../components/dashboard/ActivityItem'
import { Search } from 'lucide-react'

type TypeFilter = 'all' | ActivityEntry['type']

const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Agent', value: 'agent' },
  { label: 'Human', value: 'human' },
  { label: 'System', value: 'system' },
  { label: 'Alert', value: 'alert' },
]

// Build hourly buckets from HH:MM time strings
function buildHourlyBuckets(entries: ActivityEntry[]) {
  const buckets: Record<string, number> = {}
  entries.forEach(e => {
    const hour = e.time.split(':')[0]
    buckets[hour] = (buckets[hour] ?? 0) + 1
  })
  return buckets
}

export default function ActivityFeedPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const filtered = useMemo(() => {
    let data = [...activityFeed]
    if (typeFilter !== 'all') data = data.filter(e => e.type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(e =>
        e.actor.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        (e.target ?? '').toLowerCase().includes(q)
      )
    }
    return data
  }, [search, typeFilter])

  // Summary counts per type
  const typeCounts = useMemo(() =>
    (['agent', 'human', 'system', 'alert'] as ActivityEntry['type'][]).map(t => ({
      type: t,
      count: activityFeed.filter(e => e.type === t).length,
    })), []
  )

  // Hourly timeline from all entries
  const hourlyBuckets = useMemo(() => buildHourlyBuckets(activityFeed), [])
  const hours = Object.keys(hourlyBuckets).sort()
  const maxCount = Math.max(...Object.values(hourlyBuckets), 1)

  const typeColor: Record<ActivityEntry['type'], string> = {
    agent:  'text-nexus-info  bg-nexus-info/10',
    human:  'text-nexus-success bg-nexus-success/10',
    system: 'text-nexus-textMuted bg-nexus-muted',
    alert:  'text-nexus-warning bg-nexus-warning/10',
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-display font-semibold text-nexus-text">Activity Feed</h1>
        <p className="text-nexus-textMuted text-xs mt-0.5">All system, agent, and human events across NexusGrowth</p>
      </div>

      {/* Summary count chips */}
      <div className="flex flex-wrap gap-2">
        <div className="glass-panel px-4 py-2 flex items-center gap-2">
          <span className="text-nexus-textMuted text-[11px]">Total events</span>
          <span className="text-nexus-text font-semibold text-sm">{activityFeed.length}</span>
        </div>
        {typeCounts.map(({ type, count }) => (
          <div key={type} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${typeColor[type]}`}>
            <span className="text-[11px] font-medium capitalize">{type}</span>
            <span className="font-semibold text-sm">{count}</span>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-nexus-textMuted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search actor, action, or target…"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-nexus-muted border border-nexus-border rounded-md text-nexus-text placeholder:text-nexus-textMuted focus:outline-none focus:border-nexus-accent"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                typeFilter === f.value
                  ? 'bg-nexus-accent text-white'
                  : 'bg-nexus-muted text-nexus-textMuted hover:text-nexus-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main feed */}
        <Panel
          title={`Events (${filtered.length})`}
          className="xl:col-span-2"
          titleRight={
            <span className="flex items-center gap-1 text-[10px] text-nexus-success">
              <span className="status-dot healthy animate-pulse-slow" />
              Live
            </span>
          }
        >
          {filtered.length === 0 ? (
            <p className="text-nexus-textMuted text-xs py-6 text-center">No events match the current filters.</p>
          ) : (
            <div className="divide-y divide-nexus-border/30">
              {filtered.map(e => (
                <ActivityItem key={e.id} entry={e} />
              ))}
            </div>
          )}
        </Panel>

        {/* Hourly timeline sidebar */}
        <Panel title="Hourly Activity">
          <div className="space-y-2">
            {hours.length === 0 ? (
              <p className="text-nexus-textMuted text-xs">No data</p>
            ) : (
              hours.map(h => {
                const count = hourlyBuckets[h]
                const pct = Math.round((count / maxCount) * 100)
                return (
                  <div key={h} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-nexus-textMuted w-8 shrink-0">{h}:xx</span>
                    <div className="flex-1 h-4 bg-nexus-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-nexus-accent/60 rounded transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-nexus-textMuted w-4 text-right">{count}</span>
                  </div>
                )
              })
            )}
          </div>
          <p className="text-[10px] text-nexus-textMuted mt-4 border-t border-nexus-border/40 pt-3">
            Based on {activityFeed.length} total events. Live data updates on page refresh.
          </p>
        </Panel>
      </div>
    </div>
  )
}
