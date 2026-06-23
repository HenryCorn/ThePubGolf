import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = ['pub_name', 'location', 'drink', 'mini_game', 'is_web_game', 'game_enabled', 'lat', 'lng'] as const
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const supabase = await createClient()
  const { error } = await supabase.from('stops').update(update as any).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: stop } = await supabase.from('stops').select('position').eq('id', id).single()
  if (!stop) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('stops').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Close the position gap — shift everything after the deleted stop down by 1
  const { data: following } = await supabase
    .from('stops')
    .select('id, position')
    .gt('position', stop.position)
    .order('position')

  for (const s of following ?? []) {
    await supabase.from('stops').update({ position: s.position - 1 } as any).eq('id', s.id)
  }

  return NextResponse.json({ ok: true })
}
