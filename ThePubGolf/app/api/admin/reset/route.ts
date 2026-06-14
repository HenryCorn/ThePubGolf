import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  const supabase = await createClient()

  // Order matters: scores/minigame_results reference players/teams
  await supabase.from('minigame_results').delete().neq('id', '')
  await supabase.from('scores').delete().neq('id', '')
  await supabase.from('players').delete().neq('id', '')
  await supabase.from('teams').delete().neq('id', '')

  return NextResponse.json({ ok: true })
}
