import type { Player, TeamWithPlayers } from '@/lib/supabase/types'

export function splitIntoTeams(players: Player[], numTeams: number): Player[][] {
  if (numTeams < 1 || players.length === 0) return []

  const shuffled = [...players].sort(() => Math.random() - 0.5)
  const teams: Player[][] = Array.from({ length: numTeams }, () => [])

  shuffled.forEach((player, i) => {
    teams[i % numTeams].push(player)
  })

  return teams
}

export function calcTeamScore(scores: { sips: number; penalties: number }[]): number {
  return scores.reduce((sum, s) => sum + s.sips + s.penalties, 0)
}

export function buildLeaderboard(
  teams: TeamWithPlayers[],
  scores: { team_id: string; stop_id: string; sips: number; penalties: number }[]
) {
  return teams
    .map((team) => {
      const teamScores = scores.filter((s) => s.team_id === team.id)
      const totalSips = teamScores.reduce((sum, s) => sum + s.sips, 0)
      const totalPenalties = teamScores.reduce((sum, s) => sum + s.penalties, 0)
      return {
        team,
        players: team.players,
        totalSips,
        totalPenalties,
        totalScore: totalSips + totalPenalties,
        scores: teamScores,
      }
    })
    .sort((a, b) => a.totalScore - b.totalScore)
}

export function computeTeamReactionAvgs(
  teams: { id: string }[],
  minigameResults: { player_id: string; avg_ms: number }[],
  players: { id: string; team_id: string | null }[]
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const team of teams) {
    const memberIds = new Set(players.filter((p) => p.team_id === team.id).map((p) => p.id))
    const results = minigameResults.filter((r) => memberIds.has(r.player_id))
    if (results.length > 0) {
      result[team.id] = Math.round(results.reduce((s, r) => s + r.avg_ms, 0) / results.length)
    }
  }
  return result
}

export function generateTeamNames(n: number): string[] {
  const names = [
    'The Sippers', 'Par Four More', 'Hole in Rum', 'Gin & Carry It',
    'The Bogeys', 'Double or Stout', 'The Caddies', 'Iron Stomachs',
    'Birdies & Beers', 'The Back Nine', 'Eagle Shots', 'Mulligan Crew',
  ]
  return names.slice(0, n).concat(
    Array.from({ length: Math.max(0, n - names.length) }, (_, i) => `Team ${i + names.length + 1}`)
  )
}
