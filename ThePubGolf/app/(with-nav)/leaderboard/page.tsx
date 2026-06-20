import { createClient } from '@/lib/supabase/server'
import { buildLeaderboard, computeTeamReactionAvgs } from '@/lib/utils/teams'
import LiveLeaderboard from './LiveLeaderboard'

export const revalidate = 0

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const [{ data: teams }, { data: scores }, { data: stops }, { data: minigames }, { data: players }] =
    await Promise.all([
      supabase.from('teams').select('*, players(*)').order('name'),
      supabase.from('scores').select('*'),
      supabase.from('stops').select('id, position, pub_name').order('position'),
      supabase.from('minigame_results').select('player_id, avg_ms'),
      supabase.from('players').select('id, team_id'),
    ])

  const entries = buildLeaderboard((teams as any) ?? [], scores ?? [])
  const reactionAvgs = computeTeamReactionAvgs(
    (teams ?? []) as { id: string }[],
    minigames ?? [],
    (players ?? []) as { id: string; team_id: string | null }[]
  )

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '1rem', color: '#F4C430' }}>
        🏆 Leaderboard
      </h1>
      <LiveLeaderboard initialEntries={entries} stops={stops ?? []} reactionAvgs={reactionAvgs} />
    </div>
  )
}
