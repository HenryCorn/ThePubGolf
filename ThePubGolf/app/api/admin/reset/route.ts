import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  const supabase = await createClient()
  const errors: string[] = []

  // .neq('id', '') casts '' to UUID → Postgres error → silent no-op.
  // Use .not('id', 'is', null) instead — matches every row safely.

  // Break circular FKs first:
  //   teams.captain_id → players.id  (blocks deleting players)
  //   players.team_id  → teams.id    (blocks deleting teams)
  const { error: e1 } = await supabase.from('teams').update({ captain_id: null }).not('id', 'is', null)
  if (e1) errors.push('clear captain: ' + e1.message)

  const { error: e2 } = await supabase.from('players').update({ team_id: null }).not('id', 'is', null)
  if (e2) errors.push('clear team_id: ' + e2.message)

  const { error: e3 } = await supabase.from('minigame_results').delete().not('id', 'is', null)
  if (e3) errors.push('delete minigame_results: ' + e3.message)

  const { error: e4 } = await supabase.from('scores').delete().not('id', 'is', null)
  if (e4) errors.push('delete scores: ' + e4.message)

  const { error: e5 } = await supabase.from('players').delete().not('id', 'is', null)
  if (e5) errors.push('delete players: ' + e5.message)

  const { error: e6 } = await supabase.from('teams').delete().not('id', 'is', null)
  if (e6) errors.push('delete teams: ' + e6.message)

  if (errors.length > 0) {
    console.error('[reset]', errors)
    return NextResponse.json({ ok: false, errors }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
