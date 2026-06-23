import { createClient } from '@/lib/supabase/server'
import { buildLeaderboard, computeTeamReactionAvgs } from '@/lib/utils/teams'
import LiveLeaderboard from './LiveLeaderboard'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const [{ data: rawTeams }, { data: allPlayers }, { data: scores }, { data: stops }, { data: minigames }] =
    await Promise.all([
      supabase.from('teams').select('*').order('name'),
      supabase.from('players').select('*'),
      supabase.from('scores').select('*'),
      supabase.from('stops').select('id, position, pub_name').order('position'),
      supabase.from('minigame_results').select('player_id, avg_ms'),
    ])

  const teams = (rawTeams ?? []).map((team) => ({
    ...team,
    players: (allPlayers ?? []).filter((p) => p.team_id === team.id),
  }))

  const entries = buildLeaderboard((teams as any) ?? [], scores ?? [])
  const reactionAvgs = computeTeamReactionAvgs(
    rawTeams ?? [],
    minigames ?? [],
    (allPlayers ?? []) as { id: string; team_id: string | null }[]
  )

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
          Scoreboard
        </h1>
        <p style={{
          fontFamily: 'var(--font-caveat, cursive)',
          color: '#C9A84C', fontSize: '0.88rem', marginTop: '0.35rem',
        }}>
          Lowest score wins
        </p>
        <div style={{ width: 48, height: 2, background: '#C9A84C', margin: '0.65rem auto 0' }} />
      </header>

      <LiveLeaderboard initialEntries={entries} stops={stops ?? []} reactionAvgs={reactionAvgs} />
    </div>
  )
}
