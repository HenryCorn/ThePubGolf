import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Set which pub the party is currently at. Only one stop can be active at a
// time; passing stopId: null clears the active pub entirely.
export async function POST(req: NextRequest) {
  const { stopId } = await req.json()

  if (stopId !== null && typeof stopId !== 'string') {
    return NextResponse.json({ error: 'Invalid stopId' }, { status: 400 })
  }

  const supabase = await createClient()

  // Clear the current active pub first — the partial unique index only allows
  // one active row, so the old one must be turned off before the new one on.
  const { error: clearError } = await supabase
    .from('stops')
    .update({ is_active: false })
    .eq('is_active', true)
  if (clearError) return NextResponse.json({ error: clearError.message }, { status: 500 })

  if (stopId) {
    const { error } = await supabase
      .from('stops')
      .update({ is_active: true })
      .eq('id', stopId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
