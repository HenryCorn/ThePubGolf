'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Toast, useToast } from '@/components/Toast'
import type { Player } from '@/lib/supabase/types'

interface Team { id: string; name: string; captain_id: string | null; players: Player[] }

interface Props {
  teams: Team[]
  players: Player[]
}

export default function TeamsClient({ teams: initialTeams, players }: Props) {
  const router = useRouter()
  const { toast, show, dismiss } = useToast()
  const [numTeams, setNumTeams] = useState(4)
  const [isPending, startTransition] = useTransition()
  const [editingName, setEditingName] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const unassigned = players.filter((p) => !p.team_id)

  async function handleGenerate() {
    if (!confirm(`Re-generate ${numTeams} teams from all players? This will reassign everyone.`)) return
    startTransition(async () => {
      const res = await fetch('/api/admin/teams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numTeams }),
      })
      const d = await res.json()
      if (!res.ok) show(d.error ?? 'Failed', 'error')
      else { show('Teams generated!', 'success'); router.refresh() }
    })
  }

  async function handleRename(teamId: string) {
    if (!newName.trim()) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) show('Failed to rename', 'error')
      else { setEditingName(null); router.refresh() }
    })
  }

  async function handleCaptain(teamId: string, captainId: string) {
    startTransition(async () => {
      await fetch(`/api/admin/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captain_id: captainId }),
      })
      router.refresh()
    })
  }

  async function handleMovePlayer(playerId: string, targetTeamId: string) {
    startTransition(async () => {
      await fetch(`/api/admin/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: targetTeamId || null }),
      })
      router.refresh()
    })
  }

  const card: React.CSSProperties = {
    background: '#151a19', borderRadius: 14, padding: '1rem',
    border: '1px solid #2a3533', marginBottom: '0.75rem',
  }

  const input: React.CSSProperties = {
    padding: '6px 10px', borderRadius: 8, background: '#1e2523',
    border: '1px solid #2a3533', color: '#e8f0ee', fontSize: '0.9rem',
  }

  const btn = (color = '#00594F'): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 8, border: 'none',
    background: color, color: '#e8f0ee', fontSize: '0.85rem',
    fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer',
  })

  return (
    <>
      {toast && <Toast {...toast} onDismiss={dismiss} />}

      {/* Generate */}
      <div style={card}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Generate Teams</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.85rem', color: '#7a9390' }}>Number of teams</label>
          <input
            type="number" min={2} max={12} value={numTeams}
            onChange={(e) => setNumTeams(Number(e.target.value))}
            style={{ ...input, width: 70 }}
          />
          <button onClick={handleGenerate} disabled={isPending} style={btn()}>
            {isPending ? 'Generating…' : 'Shuffle & assign'}
          </button>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#7a9390', marginTop: '0.5rem' }}>
          {players.length} players registered · {unassigned.length} unassigned
        </p>
      </div>

      {/* Unassigned players */}
      {unassigned.length > 0 && (
        <div style={{ ...card, borderColor: '#f9a825' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#f9a825' }}>Unassigned players</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {unassigned.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#1e2523', borderRadius: 8, padding: '3px 8px', fontSize: '0.85rem' }}>
                  {p.emoji} {p.name}
                </span>
                <select
                  onChange={(e) => handleMovePlayer(p.id, e.target.value)}
                  defaultValue=""
                  style={{ ...input, fontSize: '0.78rem' }}
                >
                  <option value="">Move to…</option>
                  {initialTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team cards */}
      {initialTeams.map((team) => (
        <div key={team.id} style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {editingName === team.id ? (
              <>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} style={input} />
                <button onClick={() => handleRename(team.id)} style={btn()}>Save</button>
                <button onClick={() => setEditingName(null)} style={btn('#2a3533')}>Cancel</button>
              </>
            ) : (
              <>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{team.name}</h3>
                <button onClick={() => { setEditingName(team.id); setNewName(team.name) }} style={btn('#1e2523')}>
                  ✏️ Rename
                </button>
              </>
            )}
          </div>

          {team.players.length === 0 ? (
            <p style={{ color: '#7a9390', fontSize: '0.85rem' }}>No players yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {team.players.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem', flex: 1 }}>
                    {p.emoji} {p.name}
                    {team.captain_id === p.id && <span style={{ marginLeft: 4, color: '#CEDC00' }}>★ Captain</span>}
                  </span>
                  {team.captain_id !== p.id && (
                    <button onClick={() => handleCaptain(team.id, p.id)} style={btn('#1e2523')}>
                      Make captain
                    </button>
                  )}
                  <select
                    defaultValue=""
                    onChange={(e) => handleMovePlayer(p.id, e.target.value)}
                    style={{ ...input, fontSize: '0.78rem' }}
                  >
                    <option value="">Move to…</option>
                    {initialTeams.filter((t) => t.id !== team.id).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    <option value="">Remove from team</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  )
}
