import { useEffect, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { ActivityItem } from '../../components/dashboard/ActivityItem'
import { getCombinedActivityFeed } from '../../services/activityFeed'
import type { ActivityEntry } from '../../types/dashboard'

type MergedActivity = ActivityEntry & { source: 'audit' | 'chat' }

export default function ActivityFeedPage() {
  const [items, setItems] = useState<MergedActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getCombinedActivityFeed(40)
        setItems(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity feed')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const chatCount = items.filter(i => i.source === 'chat').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-nexus-text">Activity Feed</h1>
        <span className="text-[11px] text-nexus-textMuted">
          {items.length} events · {chatCount} from chat
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-nexus-danger/10 border border-nexus-danger/30 text-nexus-danger text-xs">
          {error}
        </div>
      )}

      <Panel title="All Activity">
        {loading ? (
          <div className="text-nexus-textMuted text-sm py-8 text-center">Loading activity…</div>
        ) : items.length === 0 ? (
          <div className="text-nexus-textMuted text-sm py-8 text-center">No activity recorded yet.</div>
        ) : (
          <div>
            {items.map(e => (
              <ActivityItem key={e.id} entry={e} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
