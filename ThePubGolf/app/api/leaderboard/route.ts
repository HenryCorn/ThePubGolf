import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildLeaderboard, computeTeamReactionAvgs } from '@/lib/utils/teams'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const [{ data: rawTeams }, { data: allPlayers }, { data: scores }, { data: minigames }] = await Promise.all([
    supabase.from('teams').select('*').order('name'),
    supabase.from('players').select('*'),
    supabase.from('scores').select('*'),
    supabase.from('minigame_results').select('player_id, avg_ms'),
  ])

  const teams = (rawTeams ?? []).map((team) => ({
    ...team,
    players: (allPlayers ?? []).filter((p) => p.team_id === team.id),
  }))

  const entries = buildLeaderboard((teams as any) ?? [], scores ?? [])
  const reactionAvgs = computeTeamReactionAvgs(
    rawTeams ?? [],
    minigames ?? [],
    (allPlayers ?? []) as { id: string; team_id: string | null }[]
  )

  return NextResponse.json({ entries, reactionAvgs })
}
