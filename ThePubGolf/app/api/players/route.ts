import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createSignedCookie, PLAYER_COOKIE, COOKIE_OPTIONS } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const name: string = (body.name ?? '').trim()
  const emoji: string = body.emoji ?? ''

  if (name.length < 2 || name.length > 20) {
    return NextResponse.json({ error: 'Name must be 2–20 characters' }, { status: 400 })
  }
  if (!emoji) {
    return NextResponse.json({ error: 'Emoji is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('players')
    .insert({ name, emoji })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That name is already taken — pick another!' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Could not register' }, { status: 500 })
  }

  const cookieValue = await createSignedCookie({ player_id: data.id })
  const cookieStore = await cookies()
  cookieStore.set(PLAYER_COOKIE, cookieValue, COOKIE_OPTIONS)

  return NextResponse.json({ id: data.id, name: data.name, emoji: data.emoji })
}
