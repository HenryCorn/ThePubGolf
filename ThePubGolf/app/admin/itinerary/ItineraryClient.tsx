'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Toast, useToast } from '@/components/Toast'
import type { Stop } from '@/lib/supabase/types'

interface Props { stops: Stop[] }

const EMPTY_FORM = { pub_name: '', location: '', drink: '', mini_game: '', is_web_game: false, game_enabled: false }

// ─── Module-level styles (stable references, never recreated) ────────────────
const input: React.CSSProperties = {
  width: '100%', padding: '7px 10px', borderRadius: 6,
  background: '#1A3020', border: '1px solid rgba(201,168,76,0.3)',
  color: '#F2E8C6', fontSize: '0.88rem', marginBottom: '0.4rem',
}
const btnStyle = (bg = '#1B3A2D'): React.CSSProperties => ({
  padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(201,168,76,0.3)',
  background: bg, color: '#F2E8C6',
  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
})

// ─── StopForm MUST be at module level — defining it inside a component causes
//     React to treat it as a new type on every render, unmounting the input and
//     losing focus after each keystroke. ────────────────────────────────────────
interface StopFormProps {
  values: typeof EMPTY_FORM
  onChange: (p: Partial<typeof EMPTY_FORM>) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  label: string
  isPending: boolean
}

function StopForm({ values, onChange, onSubmit, onCancel, label, isPending }: StopFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
      <input required placeholder="Pub name" value={values.pub_name}
        onChange={(e) => onChange({ pub_name: e.target.value })} style={input} />
      <input required placeholder="Location / address" value={values.location}
        onChange={(e) => onChange({ location: e.target.value })} style={input} />
      <input required placeholder="Drink" value={values.drink}
        onChange={(e) => onChange({ drink: e.target.value })} style={input} />
      <input required placeholder="Mini-game description" value={values.mini_game}
        onChange={(e) => onChange({ mini_game: e.target.value })} style={input} />
      <label style={{ fontSize: '0.82rem', color: '#7A9A85', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem', marginTop: '0.2rem' }}>
        <input type="checkbox" checked={values.is_web_game}
          onChange={(e) => onChange({ is_web_game: e.target.checked, game_enabled: e.target.checked ? values.game_enabled : false })} />
        Has reaction mini-game
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" disabled={isPending} style={btnStyle()}>{label}</button>
        <button type="button" onClick={onCancel} style={btnStyle('#2E4A35')}>Cancel</button>
      </div>
    </form>
  )
}

// ─── Main client component ────────────────────────────────────────────────────
export default function ItineraryClient({ stops: initialStops }: Props) {
  const router = useRouter()
  const { toast, show, dismiss } = useToast()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editForm, setEditForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM)

  const patchForm = (patch: Partial<typeof EMPTY_FORM>) => setForm((f) => ({ ...f, ...patch }))
  const patchEdit = (patch: Partial<typeof EMPTY_FORM>) => setEditForm((f) => ({ ...f, ...patch }))

  function cancelEdit() { setShowAdd(false); setEditingId(null) }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch('/api/admin/stops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) show('Failed to add stop', 'error')
      else { setShowAdd(false); setForm(EMPTY_FORM); show('Stop added', 'success'); router.refresh() }
    })
  }

  async function handleUpdate(e: React.FormEvent, stopId: string) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch(`/api/admin/stops/${stopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) show('Failed to update', 'error')
      else { setEditingId(null); show('Updated', 'success'); router.refresh() }
    })
  }

  async function handleDelete(stopId: string, name: string) {
    if (!confirm(`Delete "${name}"? This will also delete all scores for this stop.`)) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/stops/${stopId}`, { method: 'DELETE' })
      if (!res.ok) show('Failed to delete', 'error')
      else { show('Deleted', 'info'); router.refresh() }
    })
  }

  async function handleReorder(stopId: string, dir: 'up' | 'down') {
    startTransition(async () => {
      await fetch('/api/admin/stops/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stopId, direction: dir }),
      })
      router.refresh()
    })
  }

  async function handleToggleGame(stop: Stop) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/stops/${stop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_enabled: !stop.game_enabled }),
      })
      if (!res.ok) show('Failed to toggle game', 'error')
      else router.refresh()
    })
  }

  const cardBg = '#132B20'

  return (
    <>
      {toast && <Toast {...toast} onDismiss={dismiss} />}

      {!showAdd && (
        <button onClick={() => setShowAdd(true)} style={{ ...btnStyle(), marginBottom: '1rem' }}>
          + Add stop
        </button>
      )}

      {showAdd && (
        <div style={{ background: cardBg, borderRadius: 10, padding: '1rem', border: '1px solid #C9A84C', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#C9A84C' }}>New Stop</h3>
          <StopForm values={form} onChange={patchForm} onSubmit={handleAdd} onCancel={cancelEdit} label="Add stop" isPending={isPending} />
        </div>
      )}

      {initialStops.map((stop, idx) => (
        <div key={stop.id} style={{
          background: cardBg, borderRadius: 10, padding: '1rem',
          border: `1px solid ${editingId === stop.id ? '#C9A84C' : 'rgba(201,168,76,0.2)'}`,
          marginBottom: '0.65rem',
        }}>
          {editingId === stop.id ? (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#C9A84C' }}>
                Edit Stop {stop.position}
              </h3>
              <StopForm
                values={editForm}
                onChange={patchEdit}
                onSubmit={(e) => handleUpdate(e, stop.id)}
                onCancel={cancelEdit}
                label="Save"
                isPending={isPending}
              />
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              {/* Reorder arrows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button disabled={idx === 0 || isPending} onClick={() => handleReorder(stop.id, 'up')}
                  style={{ ...btnStyle('#1A3020'), padding: '3px 8px', fontSize: '0.85rem' }}>▲</button>
                <button disabled={idx === initialStops.length - 1 || isPending} onClick={() => handleReorder(stop.id, 'down')}
                  style={{ ...btnStyle('#1A3020'), padding: '3px 8px', fontSize: '0.85rem' }}>▼</button>
              </div>

              {/* Stop info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#F2E8C6' }}>{stop.position}. {stop.pub_name}</span>
                  {stop.is_web_game && (
                    <span style={{
                      background: stop.game_enabled ? '#2E6B47' : '#3A3010',
                      color: stop.game_enabled ? '#A8E8B8' : '#C9A84C',
                      fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                      border: `1px solid ${stop.game_enabled ? '#5A9A65' : 'rgba(201,168,76,0.4)'}`,
                    }}>
                      {stop.game_enabled ? 'GAME OPEN' : 'GAME LOCKED'}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#7A9A85' }}>{stop.location}</p>
                <p style={{ fontSize: '0.78rem', color: '#7A9A85' }}>{stop.drink} · {stop.mini_game}</p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0, alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => {
                      setEditingId(stop.id)
                      setEditForm({
                        pub_name: stop.pub_name, location: stop.location,
                        drink: stop.drink, mini_game: stop.mini_game,
                        is_web_game: stop.is_web_game, game_enabled: stop.game_enabled,
                      })
                    }}
                    style={btnStyle('#1A3020')}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(stop.id, stop.pub_name)} style={btnStyle('#4A1010')}>
                    Delete
                  </button>
                </div>
                {stop.is_web_game && (
                  <button
                    onClick={() => handleToggleGame(stop)}
                    disabled={isPending}
                    style={{
                      ...btnStyle(stop.game_enabled ? '#4A1010' : '#1B4A2A'),
                      fontSize: '0.75rem', padding: '4px 10px', width: '100%',
                    }}
                  >
                    {stop.game_enabled ? 'Lock game' : 'Open game'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  )
}
