import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  const supabase = await createClient()

  // Null out circular FKs first:
  //   teams.captain_id → players.id  (blocks deleting players)
  //   players.team_id  → teams.id    (blocks deleting teams)
  await supabase.from('teams').update({ captain_id: null }).neq('id', '')
  await supabase.from('players').update({ team_id: null }).neq('id', '')

  // Now safe to delete in dependency order
  await supabase.from('minigame_results').delete().neq('id', '')
  await supabase.from('scores').delete().neq('id', '')
  await supabase.from('players').delete().neq('id', '')
  await supabase.from('teams').delete().neq('id', '')

  return NextResponse.json({ ok: true })
}
