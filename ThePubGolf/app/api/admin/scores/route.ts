import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { team_id, stop_id, sips, penalties = 0, penalty_reason = null } = await req.json()

  if (!team_id || !stop_id) return NextResponse.json({ error: 'team_id and stop_id required' }, { status: 400 })
  if (!sips || sips < 1) return NextResponse.json({ error: 'sips must be ≥ 1' }, { status: 400 })

  const supabase = await createClient()
  const { error } = await supabase
    .from('scores')
    .upsert(
      { team_id, stop_id, sips, penalties, penalty_reason, updated_at: new Date().toISOString() },
      { onConflict: 'team_id,stop_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
