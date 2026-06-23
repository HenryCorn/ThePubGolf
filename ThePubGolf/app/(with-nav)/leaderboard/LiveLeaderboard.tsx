'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LeaderboardEntry } from '@/lib/supabase/types'

interface Props {
  initialEntries: LeaderboardEntry[]
  stops: { id: string; position: number; pub_name: string }[]
  reactionAvgs: Record<string, number>
}

const POSITION_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
const POSITION_COLORS = ['#C9A84C', '#8B9E8B', '#8B6914', '#6B5A3E']

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
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') console.error('[Realtime] leaderboard channel error')
      })
    return () => { supabase.removeChannel(channel) }
  }, [refetch])

  if (entries.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--font-caveat, cursive)', color: '#7A9A85', fontSize: '1.1rem', textAlign: 'center', marginTop: '2rem' }}>
        No teams yet — register some players first!
      </p>
    )
  }

  return (
    <div>
      {entries.map((entry, i) => {
        const isOpen = expanded === entry.team.id
        const posColor = POSITION_COLORS[Math.min(i, POSITION_COLORS.length - 1)]
        const avgMs = reactionAvgs[entry.team.id]

        return (
          <div key={entry.team.id} style={{ marginBottom: '0.65rem' }}>
            <button
              onClick={() => setExpanded(isOpen ? null : entry.team.id)}
              style={{
                width: '100%',
                background: i === 0 ? '#F2E8C6' : i === 1 ? '#EDE3BC' : '#EAE0B8',
                border: `1px solid rgba(122,92,16,0.25)`,
                borderLeft: `4px solid ${posColor}`,
                borderRadius: 3,
                padding: '0.85rem 0.9rem',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: i === 0 ? '0 4px 14px rgba(0,0,0,0.22)' : '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Position stamp */}
                <div style={{
                  width: 38, height: 38, flexShrink: 0,
                  background: '#1B3A2D',
                  border: '2px solid #2C1810',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 2,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-playfair, Georgia, serif)',
                    fontSize: '0.78rem', fontWeight: 700,
                    color: posColor, lineHeight: 1,
                    letterSpacing: '-0.01em',
                  }}>
                    {POSITION_LABELS[i] ?? `${i + 1}th`}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-playfair, Georgia, serif)',
                    fontWeight: 700, fontSize: '1rem',
                    color: '#1B3A2D', lineHeight: 1.2,
                  }}>
                    {entry.team.name}
                  </div>
                  <div style={{
                    fontSize: '0.78rem', color: '#6B5A3E', marginTop: 2,
                    fontFamily: 'var(--font-caveat, cursive)',
                  }}>
                    {entry.players.map((p) => `${p.emoji} ${p.name}`).join(' · ')}
                  </div>
                  {avgMs !== undefined && (
                    <div style={{
                      fontSize: '0.72rem', color: '#7A5C10', marginTop: 2,
                      fontFamily: 'var(--font-caveat, cursive)',
                    }}>
                      ⚡ avg reaction {avgMs}ms
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-playfair, Georgia, serif)',
                    fontWeight: 900, fontSize: '1.7rem',
                    color: i === 0 ? '#C9A84C' : '#2C1810',
                    lineHeight: 1,
                  }}>
                    {entry.totalScore}
                  </div>
                  <div style={{
                    fontSize: '0.65rem', color: '#6B5A3E',
                    fontFamily: 'var(--font-caveat, cursive)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    strokes
                  </div>
                </div>
              </div>

              {isOpen && stops.length > 0 && (
                <div style={{
                  marginTop: '0.75rem',
                  borderTop: '1px solid rgba(122,92,16,0.2)',
                  paddingTop: '0.65rem',
                }}>
                  {stops.map((stop) => {
                    const s = entry.scores.find((sc) => sc.stop_id === stop.id)
                    return (
                      <div
                        key={stop.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: '0.82rem', color: '#6B5A3E',
                          padding: '3px 0',
                          fontFamily: 'var(--font-caveat, cursive)',
                        }}
                      >
                        <span>{stop.position}. {stop.pub_name}</span>
                        {s ? (
                          <span style={{ color: '#2C1810', fontWeight: 700 }}>
                            {s.sips} sips{s.penalties > 0 ? ` +${s.penalties}` : ''}
                          </span>
                        ) : (
                          <span style={{ color: '#C4B077' }}>—</span>
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

      <p style={{
        fontSize: '0.72rem', color: 'rgba(201,168,76,0.4)', textAlign: 'center',
        marginTop: '1rem', fontFamily: 'var(--font-caveat, cursive)',
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        Updates live · tap a team for breakdown
      </p>
    </div>
  )
}
