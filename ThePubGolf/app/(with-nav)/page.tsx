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
    // Layout already verified the player exists in the DB before we get here.
    // If the cookie is valid, the player is live — send them to the app.
    if (payload?.player_id) redirect('/itinerary')
  }

  const supabase = await createClient()
  const { data: players } = await supabase
    .from('players')
    .select('id, name, emoji')
    .order('name')

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Pub sign header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.35)' }} />
            <span style={{
              fontFamily: 'var(--font-caveat, cursive)',
              color: '#7A9A85', fontSize: '0.75rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
            }}>
              est. tonight
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.35)' }} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair, Georgia, serif)',
            fontSize: '3.2rem', fontWeight: 900, fontStyle: 'italic',
            color: '#F2E8C6', lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            Pub Golf
          </h1>

          <p style={{
            fontFamily: 'var(--font-caveat, cursive)',
            color: '#C9A84C', fontSize: '1rem', marginTop: '0.4rem',
          }}>
            May the best drinker win
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.35)' }} />
            <span style={{ color: '#C9A84C', fontSize: '0.9rem' }}>⛳</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.35)' }} />
          </div>
        </div>

        <RegistrationForm existingPlayers={players ?? []} />
      </div>
    </div>
  )
}
