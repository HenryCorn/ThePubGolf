import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { pub_name, location, drink, mini_game, is_web_game = false } = body

  if (!pub_name || !location || !drink || !mini_game) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Append at the end
  const { data: last } = await supabase
    .from('stops')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (last?.position ?? 0) + 1

  const { data, error } = await supabase
    .from('stops')
    .insert({ pub_name, location, drink, mini_game, is_web_game, position })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
