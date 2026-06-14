import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { stopId, direction } = await req.json()
  if (!stopId || !['up', 'down'].includes(direction)) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: stop } = await supabase.from('stops').select('id, position').eq('id', stopId).single()
  if (!stop) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const targetPosition = direction === 'up' ? stop.position - 1 : stop.position + 1

  const { data: neighbor } = await supabase
    .from('stops')
    .select('id, position')
    .eq('position', targetPosition)
    .single()

  if (!neighbor) return NextResponse.json({ ok: true }) // Already at boundary

  // Swap positions using a temporary value to avoid unique constraint violation
  await supabase.from('stops').update({ position: 9999 }).eq('id', stop.id)
  await supabase.from('stops').update({ position: stop.position }).eq('id', neighbor.id)
  await supabase.from('stops').update({ position: targetPosition }).eq('id', stop.id)

  return NextResponse.json({ ok: true })
}
