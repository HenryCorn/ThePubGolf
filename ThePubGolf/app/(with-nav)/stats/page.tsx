import { createClient } from '@/lib/supabase/server'
import { buildLeaderboard } from '@/lib/utils/teams'
import LiveStats from './LiveStats'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const supabase = await createClient()

  const [{ data: rawTeams }, { data: allPlayers }, { data: scores }, { data: stops }, { data: rawMinigames }] =
    await Promise.all([
      supabase.from('teams').select('*').order('name'),
      supabase.from('players').select('*'),
      supabase.from('scores').select('*'),
      supabase.from('stops').select('id, position, pub_name').order('position'),
      supabase.from('minigame_results').select('*').order('avg_ms'),
    ])

  const teams = (rawTeams ?? []).map((team) => ({
    ...team,
    players: (allPlayers ?? []).filter((p) => p.team_id === team.id),
  }))

  const minigames = (rawMinigames ?? []).map((r) => {
    const player = (allPlayers ?? []).find((p) => p.id === r.player_id)
    return { ...r, players: player ? { name: player.name, emoji: player.emoji, team_id: player.team_id } : null }
  })

  const entries = buildLeaderboard((teams as any) ?? [], scores ?? [])

  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: 480, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(201,168,76,0.28)' }}>
        <p style={{
          fontFamily: 'var(--font-caveat, cursive)',
          fontSize: '0.88rem', color: '#7A9A85',
          letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 4,
        }}>
          — the —
        </p>
        <h1 style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: '2.4rem', fontWeight: 900, fontStyle: 'italic',
          color: '#F2E8C6', lineHeight: 1,
        }}>
          Stats
        </h1>
        <div style={{ width: 48, height: 2, background: '#C9A84C', margin: '0.65rem auto 0' }} />
      </header>

      <LiveStats
        initialEntries={entries}
        initialStops={stops ?? []}
        initialScores={scores ?? []}
        initialMinigames={(minigames as any) ?? []}
      />
    </div>
  )
}
