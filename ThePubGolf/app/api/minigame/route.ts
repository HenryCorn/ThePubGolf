import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { verifySignedCookie, PLAYER_COOKIE } from '@/lib/auth'
import { isValidReactionTime, average, NUM_ROUNDS } from '@/lib/utils/minigame'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PLAYER_COOKIE)?.value
  const payload = raw ? await verifySignedCookie<{ player_id: string }>(raw) : null
  if (!payload?.player_id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { stopId, roundTimes } = await req.json()

  if (!stopId) return NextResponse.json({ error: 'stopId required' }, { status: 400 })
  if (!Array.isArray(roundTimes) || roundTimes.length !== NUM_ROUNDS) {
    return NextResponse.json({ error: `Expected ${NUM_ROUNDS} round times` }, { status: 400 })
  }
  if (!roundTimes.every(isValidReactionTime)) {
    return NextResponse.json({ error: 'Invalid reaction times' }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('minigame_results')
    .insert({
      player_id: payload.player_id,
      stop_id: stopId,
      round_times_ms: roundTimes,
      avg_ms: average(roundTimes),
    })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already played this stop' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
