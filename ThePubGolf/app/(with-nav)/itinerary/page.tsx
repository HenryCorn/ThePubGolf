import { createClient } from '@/lib/supabase/server'
import type { Stop } from '@/lib/supabase/types'
import Link from 'next/link'

function StopCard({ stop }: { stop: Stop }) {
  const mapsUrl = stop.lat && stop.lng
    ? `https://maps.google.com/?q=${stop.lat},${stop.lng}`
    : `https://maps.google.com/?q=${encodeURIComponent(stop.location)}`

  return (
    <div
      style={{
        background: '#151a19', borderRadius: 14, padding: '1rem',
        border: '1px solid #2a3533', marginBottom: '0.75rem',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: '#00594F', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: '1rem',
          }}
        >
          {stop.position}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e8f0ee' }}>
              {stop.pub_name}
            </h2>
            {stop.is_web_game && (
              <span style={{
                background: '#CEDC00', color: '#0B0F0E', fontSize: '0.65rem',
                fontWeight: 700, padding: '1px 6px', borderRadius: 99,
              }}>GAME</span>
            )}
          </div>
          <a
            href={mapsUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: '#7a9390', fontSize: '0.82rem', textDecoration: 'none' }}
          >
            📍 {stop.location}
          </a>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              background: '#1e2523', border: '1px solid #2a3533',
              borderRadius: 8, padding: '2px 8px', fontSize: '0.8rem', color: '#e8f0ee',
            }}>
              🍺 {stop.drink}
            </span>
            <span style={{
              background: '#1e2523', border: '1px solid #2a3533',
              borderRadius: 8, padding: '2px 8px', fontSize: '0.8rem', color: '#e8f0ee',
            }}>
              🎯 {stop.mini_game}
            </span>
          </div>
          {stop.is_web_game && (
            <Link
              href={`/play/${stop.id}`}
              style={{
                display: 'inline-block', marginTop: '0.6rem',
                background: '#CEDC00', color: '#0B0F0E', borderRadius: 8,
                padding: '5px 14px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none',
              }}
            >
              ⚡ Play now
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function ItineraryPage() {
  const supabase = await createClient()
  const { data: stops } = await supabase
    .from('stops')
    .select('*')
    .order('position')

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '1rem', color: '#CEDC00' }}>
        📍 Tonight&apos;s Route
      </h1>
      {!stops?.length ? (
        <p style={{ color: '#7a9390' }}>No stops yet — check back soon!</p>
      ) : (
        stops.map((stop) => <StopCard key={stop.id} stop={stop} />)
      )}
    </div>
  )
}
