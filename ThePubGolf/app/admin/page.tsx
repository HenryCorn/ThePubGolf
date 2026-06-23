import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ResetButton from './ResetButton'

export const revalidate = 0

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [
    { count: playerCount },
    { count: stopCount },
    { count: scoreCount },
    { data: teams },
  ] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('stops').select('*', { count: 'exact', head: true }),
    supabase.from('scores').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('*, players(*)').order('name'),
  ])

  const typedTeams = (teams ?? []) as Array<{
    id: string; name: string; captain_id: string | null;
    players: Array<{ id: string; name: string; emoji: string }>
  }>

  const stats = [
    { label: 'Players', value: playerCount ?? 0 },
    { label: 'Teams', value: typedTeams.length },
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

      {/* Inline teams view */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#D6ECFF' }}>👥 Teams</h2>
          <Link href="/admin/teams" style={{ fontSize: '0.8rem', color: '#1666C4', textDecoration: 'none', fontWeight: 600 }}>
            Edit →
          </Link>
        </div>

        {typedTeams.length === 0 ? (
          <div style={{
            background: '#0C1728', borderRadius: 14, padding: '1.25rem',
            border: '1px dashed #1A3055', textAlign: 'center',
          }}>
            <p style={{ color: '#5879A0', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              No teams generated yet
            </p>
            <Link href="/admin/teams" style={{
              display: 'inline-block', padding: '8px 18px', borderRadius: 10,
              background: '#1666C4', color: '#D6ECFF', fontWeight: 600, fontSize: '0.85rem',
              textDecoration: 'none',
            }}>
              Generate teams →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.65rem' }}>
            {typedTeams.map((team) => (
              <div key={team.id} style={{
                background: '#0C1728', borderRadius: 14, padding: '0.85rem',
                border: '1px solid #1A3055',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F4C430', marginBottom: '0.5rem' }}>
                  {team.name}
                  <span style={{ fontWeight: 400, color: '#5879A0', marginLeft: 4 }}>
                    ({team.players.length})
                  </span>
                </div>
                {team.players.length === 0 ? (
                  <p style={{ color: '#5879A0', fontSize: '0.78rem' }}>Empty</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {team.players.map((p) => (
                      <div key={p.id} style={{ fontSize: '0.82rem', color: '#D6ECFF' }}>
                        {p.emoji} {p.name}
                        {team.captain_id === p.id && (
                          <span style={{ color: '#F4C430', marginLeft: 4 }}>★</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
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
