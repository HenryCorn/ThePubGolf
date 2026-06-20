import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySignedCookie, PLAYER_COOKIE } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import RegistrationForm from './RegistrationForm'

export default async function HomePage() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PLAYER_COOKIE)?.value

  if (raw) {
    const payload = await verifySignedCookie<{ player_id: string }>(raw)
    if (payload?.player_id) {
      redirect('/itinerary')
    }
  }

  const supabase = await createClient()
  const { data: players } = await supabase
    .from('players')
    .select('id, name, emoji')
    .order('name')

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold text-center mb-1" style={{ color: '#F4C430' }}>
          ⛳ Pub Golf
        </h1>
        <p className="text-center mb-8" style={{ color: '#5879A0' }}>
          May the best drinker win
        </p>
        <RegistrationForm existingPlayers={players ?? []} />
      </div>
    </div>
  )
}
