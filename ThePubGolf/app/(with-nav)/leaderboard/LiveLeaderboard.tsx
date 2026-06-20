'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LeaderboardEntry } from '@/lib/supabase/types'

interface Props {
  initialEntries: LeaderboardEntry[]
  stops: { id: string; position: number; pub_name: string }[]
  reactionAvgs: Record<string, number>
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span>🥇</span>
  if (rank === 2) return <span>🥈</span>
  if (rank === 3) return <span>🥉</span>
  return <span style={{ color: '#5879A0', fontSize: '0.9rem' }}>#{rank}</span>
}

export default function LiveLeaderboard({ initialEntries, stops, reactionAvgs: initialReactionAvgs }: Props) {
  const [entries, setEntries] = useState(initialEntries)
  const [reactionAvgs, setReactionAvgs] = useState(initialReactionAvgs)
  const [expanded, setExpanded] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    const res = await fetch('/api/leaderboard')
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
      setReactionAvgs(data.reactionAvgs)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'minigame_results' }, refetch)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [refetch])

  if (entries.length === 0) {
    return <p style={{ color: '#5879A0' }}>No teams yet — register some players first!</p>
  }

  return (
    <div>
      {entries.map((entry, i) => {
        const avgMs = reactionAvgs[entry.team.id]
        return (
          <div key={entry.team.id} style={{ marginBottom: '0.75rem' }}>
            <button
              onClick={() => setExpanded(expanded === entry.team.id ? null : entry.team.id)}
              style={{
                width: '100%', background: '#0C1728', border: '1px solid #1A3055',
                borderRadius: 14, padding: '0.9rem 1rem', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, textAlign: 'center', fontSize: '1.4rem' }}>
                  <Medal rank={i + 1} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#D6ECFF' }}>
                    {entry.team.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#5879A0', marginTop: 2 }}>
                    {entry.players.map((p) => `${p.emoji}${p.name}`).join(' · ')}
                  </div>
                  {avgMs !== undefined && (
                    <div style={{ fontSize: '0.75rem', color: '#F4C430', marginTop: 2 }}>
                      ⚡ avg reaction {avgMs}ms
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#F4C430' }}>
                    {entry.totalScore}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#5879A0' }}>strokes</div>
                </div>
              </div>

              {expanded === entry.team.id && stops.length > 0 && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid #1A3055', paddingTop: '0.75rem' }}>
                  {stops.map((stop) => {
                    const s = entry.scores.find((sc) => sc.stop_id === stop.id)
                    return (
                      <div
                        key={stop.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: '0.82rem', color: '#5879A0', padding: '3px 0',
                        }}
                      >
                        <span>{stop.position}. {stop.pub_name}</span>
                        {s ? (
                          <span style={{ color: '#D6ECFF' }}>
                            {s.sips} sips{s.penalties > 0 ? ` +${s.penalties}⚠️` : ''}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </button>
          </div>
        )
      })}
      <p style={{ fontSize: '0.75rem', color: '#1A3055', textAlign: 'center', marginTop: '1rem' }}>
        Updates live · tap a team for breakdown
      </p>
    </div>
  )
}
