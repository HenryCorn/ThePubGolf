import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ResetButton from './ResetButton'

export const revalidate = 0

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [
    { count: playerCount },
    { count: teamCount },
    { count: stopCount },
    { count: scoreCount },
  ] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('stops').select('*', { count: 'exact', head: true }),
    supabase.from('scores').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Players', value: playerCount ?? 0 },
    { label: 'Teams', value: teamCount ?? 0 },
    { label: 'Stops', value: stopCount ?? 0 },
    { label: 'Scores logged', value: scoreCount ?? 0 },
  ]

  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '1rem', color: '#F4C430' }}>
        Overview
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: '#0C1728', borderRadius: 14, padding: '1rem',
            border: '1px solid #1A3055', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F4C430' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#5879A0' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/admin/teams" style={linkStyle}>👥 Manage Teams & Players →</Link>
        <Link href="/admin/scores" style={linkStyle}>⛳ Enter Scores →</Link>
        <Link href="/admin/itinerary" style={linkStyle}>📍 Edit Itinerary →</Link>
        <Link href="/leaderboard" style={{ ...linkStyle, borderColor: '#F4C430', color: '#F4C430' }}>
          🏆 View Live Leaderboard →
        </Link>
      </div>

      <div style={{ borderTop: '1px solid #1A3055', paddingTop: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: '#5879A0', marginBottom: '0.75rem' }}>
          Danger zone — clears all players, teams, and scores (keeps itinerary)
        </p>
        <ResetButton />
      </div>
    </div>
  )
}

const linkStyle: React.CSSProperties = {
  display: 'block', padding: '0.9rem 1rem', borderRadius: 12,
  background: '#0C1728', border: '1px solid #1A3055',
  color: '#D6ECFF', textDecoration: 'none', fontWeight: 600,
}
