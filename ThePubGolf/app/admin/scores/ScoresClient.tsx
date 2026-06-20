'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Toast, useToast } from '@/components/Toast'
import type { Score } from '@/lib/supabase/types'

interface Props {
  teams: { id: string; name: string }[]
  stops: { id: string; position: number; pub_name: string }[]
  scores: Score[]
}

export default function ScoresClient({ teams, stops, scores }: Props) {
  const router = useRouter()
  const { toast, show, dismiss } = useToast()
  const [selectedStop, setSelectedStop] = useState(stops[0]?.id ?? '')
  const [isPending, startTransition] = useTransition()

  const currentScores = scores.filter((s) => s.stop_id === selectedStop)
  const getScore = (teamId: string) => currentScores.find((s) => s.team_id === teamId)

  function handleSubmit(teamId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const sips = Number(fd.get('sips'))
    const penalties = Number(fd.get('penalties') ?? 0)
    const penalty_reason = (fd.get('penalty_reason') as string) || null

    if (!sips || sips < 1) { show('Sips must be ≥ 1', 'error'); return }

    startTransition(async () => {
      const res = await fetch('/api/admin/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, stop_id: selectedStop, sips, penalties, penalty_reason }),
      })
      if (!res.ok) show('Failed to save score', 'error')
      else { show('Score saved ✓', 'success'); router.refresh() }
    })
  }

  const input: React.CSSProperties = {
    padding: '6px 10px', borderRadius: 8, background: '#132040',
    border: '1px solid #1A3055', color: '#D6ECFF', fontSize: '0.9rem', width: '100%',
  }

  return (
    <>
      {toast && <Toast {...toast} onDismiss={dismiss} />}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.8rem', color: '#5879A0', display: 'block', marginBottom: 4 }}>Stop</label>
        <select
          value={selectedStop}
          onChange={(e) => setSelectedStop(e.target.value)}
          style={{ ...input, width: 'auto' }}
        >
          {stops.map((s) => (
            <option key={s.id} value={s.id}>{s.position}. {s.pub_name}</option>
          ))}
        </select>
      </div>

      {teams.length === 0 && (
        <p style={{ color: '#5879A0' }}>No teams yet — generate teams first.</p>
      )}

      {teams.map((team) => {
        const existing = getScore(team.id)
        return (
          <form
            key={team.id}
            onSubmit={(e) => handleSubmit(team.id, e)}
            style={{
              background: '#0C1728', borderRadius: 14, padding: '1rem',
              border: '1px solid #1A3055', marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontWeight: 700 }}>{team.name}</h3>
              {existing && (
                <span style={{ fontSize: '0.8rem', color: '#F4C430' }}>
                  Saved: {existing.sips} sips{existing.penalties > 0 ? ` +${existing.penalties}⚠️` : ''}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#5879A0', display: 'block', marginBottom: 2 }}>Sips *</label>
                <input
                  name="sips" type="number" min={1} max={99}
                  defaultValue={existing?.sips ?? ''}
                  placeholder="e.g. 4"
                  style={input}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#5879A0', display: 'block', marginBottom: 2 }}>Penalties</label>
                <input
                  name="penalties" type="number" min={0} max={99}
                  defaultValue={existing?.penalties ?? 0}
                  style={input}
                />
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#5879A0', display: 'block', marginBottom: 2 }}>Penalty reason</label>
              <input
                name="penalty_reason"
                defaultValue={existing?.penalty_reason ?? ''}
                placeholder="e.g. spilled drink"
                style={input}
              />
            </div>

            <button
              type="submit" disabled={isPending}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none',
                background: isPending ? '#1A3055' : '#1666C4',
                color: '#D6ECFF', fontSize: '0.9rem', fontWeight: 600,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {existing ? 'Update' : 'Save'}
            </button>
          </form>
        )
      })}
    </>
  )
}
