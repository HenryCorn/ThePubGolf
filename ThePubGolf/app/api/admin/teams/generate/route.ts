import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { splitIntoTeams, generateTeamNames } from '@/lib/utils/teams'
import type { Player } from '@/lib/supabase/types'

export async function POST(req: NextRequest) {
  const { numTeams } = await req.json()
  if (!numTeams || numTeams < 2) {
    return NextResponse.json({ error: 'numTeams must be ≥ 2' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: players, error: pErr } = await supabase
    .from('players')
    .select('*')
  if (pErr || !players) return NextResponse.json({ error: 'Could not fetch players' }, { status: 500 })

  if (players.length === 0) return NextResponse.json({ error: 'No players registered yet' }, { status: 400 })

  // Clear existing team assignments and teams
  // (.neq('id','') causes a UUID cast error — use .not('id','is',null) instead)
  await supabase.from('teams').update({ captain_id: null }).not('id', 'is', null)
  await supabase.from('players').update({ team_id: null }).not('id', 'is', null)
  await supabase.from('teams').delete().not('id', 'is', null)

  const names = generateTeamNames(numTeams)
  const groups = splitIntoTeams(players as Player[], numTeams)

  for (let i = 0; i < numTeams; i++) {
    const { data: team } = await supabase
      .from('teams')
      .insert({ name: names[i] })
      .select()
      .single()

    if (!team) continue

    const ids = groups[i]?.map((p) => p.id) ?? []
    if (ids.length > 0) {
      await supabase.from('players').update({ team_id: team.id }).in('id', ids)
    }
  }

  return NextResponse.json({ ok: true })
}
