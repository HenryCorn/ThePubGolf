'use client'

import { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import type { LeaderboardEntry, Score } from '@/lib/supabase/types'

interface Props {
  entries: LeaderboardEntry[]
  stops: { id: string; position: number; pub_name: string }[]
  scores: Score[]
  minigames: any[]
}

const TEAM_COLORS = ['#C9A84C', '#2E6B47', '#7A5C10', '#8B6914', '#3A6B50', '#4A3010']

const cardStyle: React.CSSProperties = {
  background: '#F2E8C6',
  borderRadius: 3,
  padding: '1rem',
  border: '1px solid rgba(122,92,16,0.22)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-playfair, Georgia, serif)',
  fontWeight: 700, marginBottom: '0.75rem',
  fontSize: '1rem', color: '#1B3A2D',
  fontStyle: 'italic',
}

export default function StatsCharts({ entries, stops, scores, minigames }: Props) {
  const raceData = useMemo(() => {
    if (!stops.length || !entries.length) return []
    return stops.map((stop) => {
      const row: Record<string, string | number> = { stop: stop.pub_name.split(' ').slice(-1)[0] }
      entries.forEach((e) => {
        const stopIdx = stops.findIndex((s) => s.id === stop.id)
        const cumulative = scores
          .filter((s) => s.team_id === e.team.id && stops.findIndex((st) => st.id === s.stop_id) <= stopIdx)
          .reduce((sum, s) => sum + s.sips + s.penalties, 0)
        row[e.team.name] = cumulative
      })
      return row
    })
  }, [entries, stops, scores])

  const barData = useMemo(() => {
    return stops.map((stop) => {
      const row: Record<string, string | number> = { stop: stop.pub_name.split(' ').slice(-1)[0] }
      entries.forEach((e) => {
        const s = scores.find((sc) => sc.team_id === e.team.id && sc.stop_id === stop.id)
        row[e.team.name] = s ? s.sips + s.penalties : 0
      })
      return row
    })
  }, [entries, stops, scores])

  const penaltyBoard = useMemo(() => {
    return entries
      .map((e) => ({
        name: e.team.name,
        total: e.totalPenalties,
        reasons: scores
          .filter((s) => s.team_id === e.team.id && s.penalties > 0)
          .map((s) => s.penalty_reason)
          .filter(Boolean),
      }))
      .filter((e) => e.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [entries, scores])

  const reactionPodium = useMemo(() => {
    return [...minigames].sort((a, b) => a.avg_ms - b.avg_ms).slice(0, 5)
  }, [minigames])

  const bestStop = useMemo(() => {
    let best: { team: string; pub: string; score: number } | null = null
    scores.forEach((s) => {
      const total = s.sips + s.penalties
      const team = entries.find((e) => e.team.id === s.team_id)
      const stop = stops.find((st) => st.id === s.stop_id)
      if (team && stop && (!best || total < best.score))
        best = { team: team.team.name, pub: stop.pub_name, score: total }
    })
    return best
  }, [scores, entries, stops])

  const isEmpty = !entries.length || !stops.length

  if (isEmpty) {
    return (
      <p style={{ fontFamily: 'var(--font-caveat, cursive)', color: '#7A9A85', fontSize: '1.05rem', textAlign: 'center' }}>
        Stats will appear once teams and scores are in.
      </p>
    )
  }

  const tooltipStyle = {
    contentStyle: {
      background: '#F2E8C6', border: '1px solid rgba(122,92,16,0.3)',
      borderRadius: 3, color: '#2C1810', fontSize: 12,
      fontFamily: 'Georgia, serif',
    },
  }

  const axisStyle = { fill: '#6B5A3E', fontSize: 11, fontFamily: 'Georgia, serif' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {raceData.length > 0 && (
        <section style={cardStyle}>
          <h2 style={headingStyle}>Race for the Claret Mug</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={raceData}>
              <CartesianGrid stroke="rgba(122,92,16,0.15)" strokeDasharray="3 3" />
              <XAxis dataKey="stop" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip {...tooltipStyle} />
              {entries.map((e, i) => (
                <Line
                  key={e.team.id} type="monotone" dataKey={e.team.name}
                  stroke={TEAM_COLORS[i % TEAM_COLORS.length]} strokeWidth={2} dot={{ r: 3 }}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, color: '#6B5A3E', fontFamily: 'Georgia, serif' }} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {barData.length > 0 && (
        <section style={cardStyle}>
          <h2 style={headingStyle}>Sips per Stop</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <CartesianGrid stroke="rgba(122,92,16,0.15)" strokeDasharray="3 3" />
              <XAxis dataKey="stop" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip {...tooltipStyle} />
              {entries.map((e, i) => (
                <Bar
                  key={e.team.id} dataKey={e.team.name}
                  fill={TEAM_COLORS[i % TEAM_COLORS.length]} radius={[3, 3, 0, 0]}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, color: '#6B5A3E', fontFamily: 'Georgia, serif' }} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {penaltyBoard.length > 0 && (
        <section style={cardStyle}>
          <h2 style={{ ...headingStyle, color: '#8B1E1E' }}>Hall of Shame</h2>
          {penaltyBoard.map((item) => (
            <div key={item.name} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 700, color: '#2C1810', fontFamily: 'Georgia, serif' }}>{item.name}</span>
                <span style={{
                  color: '#8B1E1E', fontWeight: 700,
                  fontFamily: 'var(--font-caveat, cursive)', fontSize: '0.95rem',
                }}>
                  +{item.total} penalty
                </span>
              </div>
              {item.reasons.map((r, i) => (
                <p key={i} style={{
                  fontSize: '0.78rem', color: '#6B5A3E', marginLeft: 8,
                  fontFamily: 'var(--font-caveat, cursive)',
                }}>
                  · {r}
                </p>
              ))}
            </div>
          ))}
        </section>
      )}

      {reactionPodium.length > 0 && (
        <section style={cardStyle}>
          <h2 style={headingStyle}>Fastest Reactions</h2>
          {reactionPodium.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.88rem', padding: '4px 0',
              borderTop: i > 0 ? '1px solid rgba(122,92,16,0.15)' : undefined,
            }}>
              <span style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                {i + 1}. {r.players?.emoji} {r.players?.name}
              </span>
              <span style={{
                color: '#7A5C10', fontWeight: 700,
                fontFamily: 'var(--font-caveat, cursive)',
              }}>
                {r.avg_ms}ms
              </span>
            </div>
          ))}
        </section>
      )}

      {bestStop && (
        <section style={{ ...cardStyle, borderLeft: '4px solid #C9A84C' }}>
          <h2 style={headingStyle}>Best Stop</h2>
          <p style={{ fontSize: '0.9rem', color: '#2C1810', fontFamily: 'Georgia, serif' }}>
            <strong>{(bestStop as any).team}</strong> at {(bestStop as any).pub}{' '}
            — {(bestStop as any).score} stroke{(bestStop as any).score !== 1 ? 's' : ''}
          </p>
        </section>
      )}
    </div>
  )
}
