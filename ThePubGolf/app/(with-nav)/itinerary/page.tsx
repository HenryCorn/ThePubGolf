import { createClient } from '@/lib/supabase/server'
import type { Stop } from '@/lib/supabase/types'
import Link from 'next/link'

// Subtle variation — cards are NOT identical clones
const CARD_VARIANTS = [
  { bg: '#F2E8C6', leftAccent: '#2E6B47' },
  { bg: '#EDE3BC', leftAccent: '#C9A84C' },
  { bg: '#F4EAC8', leftAccent: '#1B3A2D' },
  { bg: '#EAE0B8', leftAccent: '#7A5C10' },
]

function HoleBox({ n }: { n: number }) {
  return (
    <div style={{
      width: 44, height: 44, flexShrink: 0,
      background: '#1B3A2D',
      border: '2px solid #2C1810',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 2,
    }}>
      <span style={{
        fontFamily: 'var(--font-playfair, Georgia, serif)',
        fontSize: '1rem', fontWeight: 700,
        color: '#C9A84C', lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {String(n).padStart(2, '0')}
      </span>
    </div>
  )
}

function Stamp({ children, tilt = 0 }: { children: string; tilt?: number }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px 1px',
      border: '1.5px solid rgba(122,92,16,0.6)',
      boxShadow: '0 0 0 1px #F2E8C6, 0 0 0 3px rgba(122,92,16,0.35)',
      fontSize: '0.67rem',
      fontFamily: 'var(--font-caveat, cursive)',
      fontWeight: 700,
      color: '#4A3010',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      background: 'rgba(201,168,76,0.1)',
      borderRadius: 1,
      transform: `rotate(${tilt}deg)`,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function PinnedStop({ stop }: { stop: Stop }) {
  const mapsUrl = stop.lat && stop.lng
    ? `https://maps.google.com/?q=${stop.lat},${stop.lng}`
    : `https://maps.google.com/?q=${encodeURIComponent(stop.location)}`

  return (
    <div style={{ position: 'relative', marginBottom: '1.75rem', marginTop: '0.5rem' }}>
      {/* Tape mark */}
      <div style={{
        position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
        width: 70, height: 18, borderRadius: 1,
        background: 'rgba(240,218,148,0.7)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
        zIndex: 2,
      }} />

      <div style={{
        background: '#EDD9A3',
        borderRadius: 3,
        padding: '1.2rem 1.1rem 1.1rem',
        border: '1px solid #C4A050',
        boxShadow: '0 8px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.2)',
        transform: 'rotate(-0.7deg)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Game stop stamp — pinned at top-right, angled */}
        <div style={{ position: 'absolute', top: '0.85rem', right: '0.85rem', transform: 'rotate(10deg)' }}>
          <span style={{
            display: 'inline-block',
            padding: '2px 7px 1px',
            border: '2px solid rgba(139,30,30,0.55)',
            boxShadow: '0 0 0 1px #EDD9A3, 0 0 0 3px rgba(139,30,30,0.3)',
            fontSize: '0.66rem',
            fontFamily: 'var(--font-caveat, cursive)',
            fontWeight: 700,
            color: '#8B1E1E',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            borderRadius: 1,
          }}>
            Game Stop
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
          <HoleBox n={stop.position} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              fontSize: '1.25rem', fontWeight: 700, fontStyle: 'italic',
              color: '#1B3A2D', lineHeight: 1.15,
              marginBottom: 3, paddingRight: '5rem',
            }}>
              {stop.pub_name}
            </h2>
            <a
              href={mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-caveat, cursive)',
                fontSize: '0.88rem', color: '#6B5A3E',
                textDecoration: 'none', display: 'block', marginBottom: '0.7rem',
              }}
            >
              {stop.location}
            </a>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <Stamp>{stop.drink}</Stamp>
              <Stamp tilt={-1.5}>{stop.mini_game}</Stamp>
            </div>
          </div>
        </div>

        {/* Chalky CTA — printed-text feel, not pill button */}
        <Link
          href={`/play/${stop.id}`}
          style={{
            display: 'block',
            padding: '11px 0',
            background: '#1B3A2D',
            color: '#F2E8C6',
            textAlign: 'center',
            fontFamily: 'var(--font-playfair, Georgia, serif)',
            fontSize: '0.85rem', fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            textDecoration: 'none',
            borderRadius: 2,
            border: '1px solid #2E6B47',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.18), -1px -1px 0 rgba(255,255,255,0.04)',
          }}
        >
          Play Now
        </Link>
      </div>
    </div>
  )
}

function StopCard({ stop, index }: { stop: Stop; index: number }) {
  const v = CARD_VARIANTS[index % CARD_VARIANTS.length]
  const mapsUrl = stop.lat && stop.lng
    ? `https://maps.google.com/?q=${stop.lat},${stop.lng}`
    : `https://maps.google.com/?q=${encodeURIComponent(stop.location)}`

  return (
    <div style={{
      background: v.bg,
      borderRadius: 3,
      padding: '0.85rem 0.9rem',
      marginBottom: '0.6rem',
      borderLeft: `4px solid ${v.leftAccent}`,
      border: `1px solid rgba(122,92,16,0.2)`,
      borderLeftWidth: 4,
      borderLeftColor: v.leftAccent,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <HoleBox n={stop.position} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair, Georgia, serif)',
            fontSize: '1.05rem', fontWeight: 700,
            color: '#1B3A2D', lineHeight: 1.2, marginBottom: 2,
          }}>
            {stop.pub_name}
          </h2>
          <a
            href={mapsUrl} target="_blank" rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-caveat, cursive)',
              fontSize: '0.83rem', color: '#6B5A3E',
              textDecoration: 'none', display: 'block', marginBottom: '0.5rem',
            }}
          >
            {stop.location}
          </a>
          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
            <Stamp>{stop.drink}</Stamp>
            <Stamp tilt={-1}>{stop.mini_game}</Stamp>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function ItineraryPage() {
  const supabase = await createClient()
  const { data: stops } = await supabase.from('stops').select('*').order('position')

  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: 480, margin: '0 auto' }}>

      {/* Header — pub menu style */}
      <header style={{ textAlign: 'center', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(201,168,76,0.28)' }}>
        <p style={{
          fontFamily: 'var(--font-caveat, cursive)',
          fontSize: '0.88rem', color: '#7A9A85',
          letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 4,
        }}>
          — tonight&apos;s —
        </p>
        <h1 style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: '2.6rem', fontWeight: 900, fontStyle: 'italic',
          color: '#F2E8C6', lineHeight: 1, letterSpacing: '-0.01em',
        }}>
          The Route
        </h1>
        {stops?.length ? (
          <p style={{
            fontFamily: 'var(--font-caveat, cursive)',
            color: '#C9A84C', fontSize: '0.9rem', marginTop: '0.35rem',
          }}>
            {stops.length} {stops.length === 1 ? 'hole' : 'holes'} &middot; par excellence
          </p>
        ) : null}
        <div style={{ width: 48, height: 2, background: '#C9A84C', margin: '0.65rem auto 0' }} />
      </header>

      {!stops?.length ? (
        <p style={{
          fontFamily: 'var(--font-caveat, cursive)',
          color: '#7A9A85', textAlign: 'center', fontSize: '1.1rem',
        }}>
          No stops yet — check back soon!
        </p>
      ) : (
        stops.map((stop, i) =>
          stop.is_web_game
            ? <PinnedStop key={stop.id} stop={stop} />
            : <StopCard key={stop.id} stop={stop} index={i} />
        )
      )}
    </div>
  )
}
