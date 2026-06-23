import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { verifySignedCookie, PLAYER_COOKIE } from '@/lib/auth'
import MiniGame from './MiniGame'

export default async function PlayPage({ params }: { params: Promise<{ stopId: string }> }) {
  const { stopId } = await params

  const cookieStore = await cookies()
  const raw = cookieStore.get(PLAYER_COOKIE)?.value
  const payload = raw ? await verifySignedCookie<{ player_id: string }>(raw) : null
  if (!payload?.player_id) redirect('/')

  const supabase = await createClient()

  const { data: stop } = await supabase
    .from('stops')
    .select('*')
    .eq('id', stopId)
    .eq('is_web_game', true)
    .single()

  if (!stop) notFound()

  if (!stop.game_enabled) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: '#0F2018' }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h1 style={{
            fontFamily: 'var(--font-playfair, Georgia, serif)',
            fontSize: '1.6rem', fontWeight: 700, fontStyle: 'italic',
            color: '#F2E8C6', marginBottom: '0.5rem',
          }}>
            {stop.pub_name}
          </h1>
          <p style={{
            fontFamily: 'var(--font-caveat, cursive)',
            color: '#7A9A85', fontSize: '1.05rem', lineHeight: 1.5,
          }}>
            The game hasn&apos;t started yet — the admin will open it when you arrive at this stop.
          </p>
        </div>
      </div>
    )
  }

  const { data: existing } = await supabase
    .from('minigame_results')
    .select('id, avg_ms, round_times_ms')
    .eq('player_id', payload.player_id)
    .eq('stop_id', stopId)
    .single()

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#0F2018' }}>
      <MiniGame
        stopId={stopId}
        previousResult={existing ?? null}
      />
    </div>
  )
}
