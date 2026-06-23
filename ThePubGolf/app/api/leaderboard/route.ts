import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildLeaderboard, computeTeamReactionAvgs } from '@/lib/utils/teams'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const [{ data: teams }, { data: scores }, { data: minigames }, { data: players }] = await Promise.all([
    supabase.from('teams').select('*, players(*)').order('name'),
    supabase.from('scores').select('*'),
    supabase.from('minigame_results').select('player_id, avg_ms'),
    supabase.from('players').select('id, team_id'),
  ])

  const entries = buildLeaderboard((teams as any) ?? [], scores ?? [])
  const reactionAvgs = computeTeamReactionAvgs(
    (teams ?? []) as { id: string }[],
    minigames ?? [],
    (players ?? []) as { id: string; team_id: string | null }[]
  )

  return NextResponse.json({ entries, reactionAvgs })
}
