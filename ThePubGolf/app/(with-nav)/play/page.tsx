import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

export default async function PlayIndexPage() {
  const supabase = await createClient()
  const { data: gameStops } = await supabase
    .from('stops')
    .select('id, position, pub_name')
    .eq('is_web_game', true)
    .order('position')

  if (gameStops && gameStops.length === 1) {
    redirect(`/play/${gameStops[0].id}`)
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '1rem', color: '#CEDC00' }}>
        ⚡ Mini-Game
      </h1>

      {!gameStops?.length ? (
        <div style={{ background: '#151a19', borderRadius: 14, padding: '1.25rem', border: '1px solid #2a3533' }}>
          <p style={{ color: '#7a9390' }}>No game stop set up yet — the admin will enable one from the itinerary.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {gameStops.map((stop) => (
            <Link
              key={stop.id}
              href={`/play/${stop.id}`}
              style={{
                display: 'block', background: '#151a19', borderRadius: 14,
                padding: '1rem', border: '1px solid #2a3533', textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700, color: '#e8f0ee' }}>Stop {stop.position}: {stop.pub_name}</p>
                  <p style={{ fontSize: '0.82rem', color: '#7a9390', marginTop: 2 }}>Tap the 🫠 face!</p>
                </div>
                <span style={{ color: '#CEDC00', fontSize: '1.5rem' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
