import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createSignedCookie, PLAYER_COOKIE, COOKIE_OPTIONS } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { player_id } = await req.json()
  if (!player_id) return NextResponse.json({ error: 'Missing player_id' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('players')
    .select('id, name, emoji')
    .eq('id', player_id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

  const cookieValue = await createSignedCookie({ player_id: data.id })
  const cookieStore = await cookies()
  cookieStore.set(PLAYER_COOKIE, cookieValue, COOKIE_OPTIONS)

  return NextResponse.json({ id: data.id, name: data.name })
}
