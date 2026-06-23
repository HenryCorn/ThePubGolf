import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildLeaderboard } from '@/lib/utils/teams'

export async function GET() {
  const supabase = await createClient()
  const [{ data: teams }, { data: scores }, { data: stops }, { data: minigames }] = await Promise.all([
    supabase.from('teams').select('*, players(*)').order('name'),
    supabase.from('scores').select('*'),
    supabase.from('stops').select('id, position, pub_name').order('position'),
    supabase.from('minigame_results').select('*, players(name, emoji, team_id)').order('avg_ms'),
  ])
  const entries = buildLeaderboard((teams as any) ?? [], scores ?? [])
  return NextResponse.json({ entries, stops: stops ?? [], scores: scores ?? [], minigames: minigames ?? [] })
}
