'use client'

import { useState, useTransition } from 'react'
import { Toast, useToast } from '@/components/Toast'
import type { Player } from '@/lib/supabase/types'

interface Team { id: string; name: string; captain_id: string | null; players: Player[] }
interface Props { teams: Team[]; players: Player[] }

const card: React.CSSProperties = {
  background: '#132B20', borderRadius: 10, padding: '1rem',
  border: '1px solid rgba(201,168,76,0.2)', marginBottom: '0.65rem',
}
const inputStyle: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 6,
  background: '#1A3020', border: '1px solid rgba(201,168,76,0.3)',
  color: '#F2E8C6', fontSize: '0.9rem',
}
const btn = (bg = '#1B3A2D'): React.CSSProperties => ({
  padding: '6px 14px', borderRadius: 6,
  border: '1px solid rgba(201,168,76,0.25)',
  background: bg, color: '#F2E8C6',
  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
})

function reload() { window.location.reload() }

export default function TeamsClient({ teams: initialTeams, players }: Props) {
  const { toast, show, dismiss } = useToast()
  const [numTeams, setNumTeams] = useState(4)
  const [isPending, startTransition] = useTransition()
  const [editingName, setEditingName] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const unassigned = players.filter((p) => !p.team_id)

  async function handleGenerate() {
    if (!confirm(`Generate ${numTeams} teams from all ${players.length} players? This will reassign everyone.`)) return
    startTransition(async () => {
      const res = await fetch('/api/admin/teams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numTeams }),
      })
      const d = await res.json()
      if (!res.ok) show(d.error ?? 'Failed', 'error')
      else reload()
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
      else reload()
    })
  }

  async function handleCaptain(teamId: string, captainId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captain_id: captainId }),
      })
      if (!res.ok) show('Failed', 'error')
      else reload()
    })
  }

  async function handleRemovePlayer(playerId: string, name: string) {
    if (!confirm(`Remove ${name}? This deletes them from the event, their team, and any mini-game results. Team scores are unaffected.`)) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/players/${playerId}`, { method: 'DELETE' })
      if (!res.ok) show('Failed to remove player', 'error')
      else reload()
    })
  }

  async function handleMovePlayer(playerId: string, targetTeamId: string) {
    if (!targetTeamId) return
    startTransition(async () => {
      const teamId = targetTeamId === '__unassign__' ? null : targetTeamId
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId }),
      })
      if (!res.ok) show('Failed to move player', 'error')
      else reload()
    })
  }

  return (
    <>
      {toast && <Toast {...toast} onDismiss={dismiss} />}

      {/* Generate section */}
      <div style={card}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#C9A84C' }}>Generate Teams</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.85rem', color: '#7A9A85' }}>Number of teams</label>
          <input
            type="number" min={2} max={12} value={numTeams}
            onChange={(e) => setNumTeams(Number(e.target.value))}
            style={{ ...inputStyle, width: 70 }}
          />
          <button onClick={handleGenerate} disabled={isPending} style={btn()}>
            {isPending ? 'Generating…' : 'Shuffle & assign'}
          </button>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#7A9A85', marginTop: '0.5rem' }}>
          {players.length} players registered · {unassigned.length} unassigned
        </p>
      </div>

      {/* Unassigned players */}
      {unassigned.length > 0 && (
        <div style={{ ...card, borderColor: '#C9A84C' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#C9A84C' }}>
            Unassigned ({unassigned.length})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {unassigned.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: '#1A3020', borderRadius: 6, padding: '3px 8px', fontSize: '0.85rem', color: '#F2E8C6' }}>
                  {p.emoji} {p.name}
                </span>
                <select
                  onChange={(e) => { if (e.target.value) handleMovePlayer(p.id, e.target.value) }}
                  defaultValue=""
                  style={{ ...inputStyle, fontSize: '0.78rem' }}
                >
                  <option value="">Assign to…</option>
                  {initialTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button
                  onClick={() => handleRemovePlayer(p.id, p.name)}
                  disabled={isPending}
                  style={{ ...btn('#4A1010'), fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No teams yet */}
      {initialTeams.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#7A9A85', fontFamily: 'var(--font-caveat, cursive)', fontSize: '1rem' }}>
            No teams yet — use the generator above to create them.
          </p>
        </div>
      )}

      {/* Team cards */}
      {initialTeams.map((team) => (
        <div key={team.id} style={card}>
          {/* Team name + rename */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {editingName === team.id ? (
              <>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: 120 }}
                  autoFocus
                />
                <button onClick={() => handleRename(team.id)} disabled={isPending} style={btn()}>Save</button>
                <button onClick={() => setEditingName(null)} style={btn('#2E4A35')}>Cancel</button>
              </>
            ) : (
              <>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#F2E8C6', flex: 1 }}>{team.name}</h3>
                <span style={{ fontSize: '0.75rem', color: '#7A9A85' }}>
                  {team.players.length} player{team.players.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => { setEditingName(team.id); setNewName(team.name) }}
                  style={btn('#2E4A35')}
                >
                  Rename
                </button>
              </>
            )}
          </div>

          {/* Players */}
          {team.players.length === 0 ? (
            <p style={{ color: '#7A9A85', fontSize: '0.85rem' }}>No players yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {team.players.map((p) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                  padding: '6px 8px', borderRadius: 6,
                  background: 'rgba(0,0,0,0.15)',
                }}>
                  <span style={{ fontSize: '0.9rem', flex: 1, color: '#F2E8C6' }}>
                    {p.emoji} {p.name}
                    {team.captain_id === p.id && (
                      <span style={{ marginLeft: 6, color: '#C9A84C', fontSize: '0.75rem', fontWeight: 700 }}>
                        ★ Captain
                      </span>
                    )}
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {team.captain_id !== p.id && (
                      <button
                        onClick={() => handleCaptain(team.id, p.id)}
                        disabled={isPending}
                        style={{ ...btn('#2E4A35'), fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        ★ Captain
                      </button>
                    )}
                    <select
                      defaultValue=""
                      onChange={(e) => handleMovePlayer(p.id, e.target.value)}
                      style={{ ...inputStyle, fontSize: '0.78rem' }}
                    >
                      <option value="">Move…</option>
                      {initialTeams.filter((t) => t.id !== team.id).map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                      <option value="__unassign__">Unassign</option>
                    </select>
                    <button
                      onClick={() => handleRemovePlayer(p.id, p.name)}
                      disabled={isPending}
                      style={{ ...btn('#4A1010'), fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  )
}
