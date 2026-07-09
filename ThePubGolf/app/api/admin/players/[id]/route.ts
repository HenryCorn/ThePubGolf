import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type PlayerUpdate = Database['public']['Tables']['players']['Update']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const update: PlayerUpdate = {}

  if ('team_id' in body) update.team_id = body.team_id ?? null

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('players').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()

  // Deleting the player cascades cleanly: teams.captain_id is ON DELETE SET NULL
  // (captaincy is cleared if they held it) and minigame_results ON DELETE CASCADE
  // (their reaction results go too). Team-level scores are unaffected.
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
