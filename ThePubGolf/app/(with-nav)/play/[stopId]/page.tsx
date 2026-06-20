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

  const { data: existing } = await supabase
    .from('minigame_results')
    .select('id, avg_ms, round_times_ms')
    .eq('player_id', payload.player_id)
    .eq('stop_id', stopId)
    .single()

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#070F1B' }}>
      <MiniGame
        stopId={stopId}
        previousResult={existing ?? null}
      />
    </div>
  )
}
