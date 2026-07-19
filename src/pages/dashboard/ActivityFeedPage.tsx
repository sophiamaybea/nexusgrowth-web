import { Panel } from '../../components/ui/Panel'
import { ActivityItem } from '../../components/dashboard/ActivityItem'
import { activityFeed } from '../../data/dashboardSample'

export default function ActivityFeedPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-display font-semibold text-nexus-text">Activity Feed</h1>
      <Panel title="All Activity">
        <div>{activityFeed.map(e => <ActivityItem key={e.id} entry={e} />)}</div>
      </Panel>
    </div>
  )
}
