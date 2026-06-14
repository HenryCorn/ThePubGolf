import { createClient } from '@/lib/supabase/server'
import { buildLeaderboard } from '@/lib/utils/teams'
import StatsCharts from './StatsCharts'

export const revalidate = 0

export default async function StatsPage() {
  const supabase = await createClient()

  const [{ data: teams }, { data: scores }, { data: stops }, { data: minigames }] =
    await Promise.all([
      supabase.from('teams').select('*, players(*)').order('name'),
      supabase.from('scores').select('*'),
      supabase.from('stops').select('id, position, pub_name').order('position'),
      supabase.from('minigame_results').select('*, players(name, emoji, team_id)').order('avg_ms'),
    ])

  const entries = buildLeaderboard((teams as any) ?? [], scores ?? [])

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '1rem', color: '#CEDC00' }}>
        📊 Stats
      </h1>
      <StatsCharts
        entries={entries}
        stops={stops ?? []}
        scores={scores ?? []}
        minigames={(minigames as any) ?? []}
      />
    </div>
  )
}
