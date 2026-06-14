import { describe, it, expect } from 'vitest'
import { splitIntoTeams, calcTeamScore } from '@/lib/utils/teams'
import type { Player } from '@/lib/supabase/types'

function makePlayers(n: number): Player[] {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i),
    name: `Player${i}`,
    emoji: '🦁',
    team_id: null,
    is_admin: false,
    created_at: '',
  }))
}

describe('splitIntoTeams', () => {
  it('assigns every player', () => {
    const players = makePlayers(11)
    const teams = splitIntoTeams(players, 3)
    const assigned = teams.flat()
    expect(assigned).toHaveLength(11)
    expect(new Set(assigned.map((p) => p.id)).size).toBe(11)
  })

  it('distributes remainder round-robin: 11 players → 4/4/3', () => {
    const players = makePlayers(11)
    const teams = splitIntoTeams(players, 3)
    const sizes = teams.map((t) => t.length).sort((a, b) => b - a)
    expect(sizes).toEqual([4, 4, 3])
  })

  it('handles exact division: 12 players → 4/4/4', () => {
    const players = makePlayers(12)
    const teams = splitIntoTeams(players, 3)
    teams.forEach((t) => expect(t).toHaveLength(4))
  })

  it('returns empty array when no players', () => {
    expect(splitIntoTeams([], 3)).toEqual([])
  })

  it('single team gets all players', () => {
    const players = makePlayers(7)
    const teams = splitIntoTeams(players, 1)
    expect(teams[0]).toHaveLength(7)
  })
})

describe('calcTeamScore', () => {
  it('sums sips + penalties across stops', () => {
    const scores = [
      { sips: 3, penalties: 0 },
      { sips: 5, penalties: 2 },
      { sips: 2, penalties: 1 },
    ]
    expect(calcTeamScore(scores)).toBe(13)
  })

  it('returns 0 for empty scores', () => {
    expect(calcTeamScore([])).toBe(0)
  })
})
