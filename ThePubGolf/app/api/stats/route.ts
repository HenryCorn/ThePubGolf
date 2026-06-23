import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildLeaderboard } from '@/lib/utils/teams'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const [{ data: rawTeams }, { data: allPlayers }, { data: scores }, { data: stops }, { data: rawMinigames }] = await Promise.all([
    supabase.from('teams').select('*').order('name'),
    supabase.from('players').select('*'),
    supabase.from('scores').select('*'),
    supabase.from('stops').select('id, position, pub_name').order('position'),
    supabase.from('minigame_results').select('*').order('avg_ms'),
  ])

  const teams = (rawTeams ?? []).map((team) => ({
    ...team,
    players: (allPlayers ?? []).filter((p) => p.team_id === team.id),
  }))

  const minigames = (rawMinigames ?? []).map((r) => {
    const player = (allPlayers ?? []).find((p) => p.id === r.player_id)
    return { ...r, players: player ? { name: player.name, emoji: player.emoji, team_id: player.team_id } : null }
  })

  const entries = buildLeaderboard((teams as any) ?? [], scores ?? [])
  return NextResponse.json({ entries, stops: stops ?? [], scores: scores ?? [], minigames: minigames ?? [] })
}
