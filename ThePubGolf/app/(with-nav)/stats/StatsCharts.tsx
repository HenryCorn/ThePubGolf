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

const TEAM_COLORS = ['#CEDC00', '#00594F', '#00b8a9', '#f9a825', '#e91e63', '#9c27b0']

export default function StatsCharts({ entries, stops, scores, minigames }: Props) {
  // Race chart data — cumulative score per stop
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

  // Per-stop bar data
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

  // Penalty board
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

  // Reaction-time podium
  const reactionPodium = useMemo(() => {
    return [...minigames]
      .sort((a, b) => a.avg_ms - b.avg_ms)
      .slice(0, 5)
  }, [minigames])

  // Fun stats
  const bestStop = useMemo(() => {
    let best: { team: string; pub: string; score: number } | null = null
    scores.forEach((s) => {
      const total = s.sips + s.penalties
      const team = entries.find((e) => e.team.id === s.team_id)
      const stop = stops.find((st) => st.id === s.stop_id)
      if (team && stop && (!best || total < best.score)) {
        best = { team: team.team.name, pub: stop.pub_name, score: total }
      }
    })
    return best
  }, [scores, entries, stops])

  const isEmpty = !entries.length || !stops.length

  if (isEmpty) {
    return <p style={{ color: '#7a9390' }}>Stats will appear once teams and scores are in.</p>
  }

  const tooltip = { contentStyle: { background: '#1e2523', border: '1px solid #2a3533', borderRadius: 10 } }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Race chart */}
      {raceData.length > 0 && (
        <section style={{ background: '#151a19', borderRadius: 14, padding: '1rem', border: '1px solid #2a3533' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem', color: '#e8f0ee' }}>
            Race for the Claret Mug
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={raceData}>
              <CartesianGrid stroke="#2a3533" strokeDasharray="3 3" />
              <XAxis dataKey="stop" tick={{ fill: '#7a9390', fontSize: 11 }} />
              <YAxis tick={{ fill: '#7a9390', fontSize: 11 }} />
              <Tooltip {...tooltip} />
              {entries.map((e, i) => (
                <Line key={e.team.id} type="monotone" dataKey={e.team.name}
                  stroke={TEAM_COLORS[i % TEAM_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, color: '#7a9390' }} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Per-stop bar */}
      {barData.length > 0 && (
        <section style={{ background: '#151a19', borderRadius: 14, padding: '1rem', border: '1px solid #2a3533' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem', color: '#e8f0ee' }}>
            Sips per Stop
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <CartesianGrid stroke="#2a3533" strokeDasharray="3 3" />
              <XAxis dataKey="stop" tick={{ fill: '#7a9390', fontSize: 11 }} />
              <YAxis tick={{ fill: '#7a9390', fontSize: 11 }} />
              <Tooltip {...tooltip} />
              {entries.map((e, i) => (
                <Bar key={e.team.id} dataKey={e.team.name} fill={TEAM_COLORS[i % TEAM_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, color: '#7a9390' }} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Penalty board */}
      {penaltyBoard.length > 0 && (
        <section style={{ background: '#151a19', borderRadius: 14, padding: '1rem', border: '1px solid #2a3533' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem', color: '#e8f0ee' }}>
            🚨 Hall of Shame
          </h2>
          {penaltyBoard.map((item) => (
            <div key={item.name} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ color: '#e55', fontWeight: 700 }}>+{item.total}⚠️</span>
              </div>
              {item.reasons.map((r, i) => (
                <p key={i} style={{ fontSize: '0.78rem', color: '#7a9390', marginLeft: 8 }}>
                  • {r}
                </p>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* Reaction-time podium */}
      {reactionPodium.length > 0 && (
        <section style={{ background: '#151a19', borderRadius: 14, padding: '1rem', border: '1px solid #2a3533' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem', color: '#e8f0ee' }}>
            ⚡ Fastest Reactions
          </h2>
          {reactionPodium.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '4px 0', borderTop: i > 0 ? '1px solid #2a3533' : undefined }}>
              <span>
                {['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]} {r.players?.emoji} {r.players?.name}
              </span>
              <span style={{ color: '#CEDC00', fontWeight: 700 }}>{r.avg_ms}ms</span>
            </div>
          ))}
        </section>
      )}

      {/* Fun stat */}
      {bestStop && (
        <section style={{ background: '#151a19', borderRadius: 14, padding: '1rem', border: '1px solid #2a3533' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem', color: '#e8f0ee' }}>
            ⭐ Best Stop
          </h2>
          <p style={{ fontSize: '0.9rem' }}>
            <strong>{(bestStop as any).team}</strong> at {(bestStop as any).pub} — {(bestStop as any).score} stroke{(bestStop as any).score !== 1 ? 's' : ''}
          </p>
        </section>
      )}
    </div>
  )
}
