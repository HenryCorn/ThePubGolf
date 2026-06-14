'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Toast, useToast } from '@/components/Toast'
import type { Stop } from '@/lib/supabase/types'

interface Props { stops: Stop[] }

const EMPTY_FORM = { pub_name: '', location: '', drink: '', mini_game: '', is_web_game: false }

export default function ItineraryClient({ stops: initialStops }: Props) {
  const router = useRouter()
  const { toast, show, dismiss } = useToast()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editForm, setEditForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM)

  function patchForm(patch: Partial<typeof EMPTY_FORM>) {
    setForm((f) => ({ ...f, ...patch }))
  }
  function patchEdit(patch: Partial<typeof EMPTY_FORM>) {
    setEditForm((f) => ({ ...f, ...patch }))
  }

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

  const input: React.CSSProperties = {
    width: '100%', padding: '7px 10px', borderRadius: 8,
    background: '#1e2523', border: '1px solid #2a3533',
    color: '#e8f0ee', fontSize: '0.88rem', marginBottom: '0.4rem',
  }
  const btn = (bg = '#00594F'): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: 8, border: 'none',
    background: bg, color: bg === '#c0392b' ? '#fff' : '#e8f0ee',
    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
  })

  function StopForm({ values, onChange, onSubmit, label }: {
    values: typeof EMPTY_FORM
    onChange: (p: Partial<typeof EMPTY_FORM>) => void
    onSubmit: (e: React.FormEvent) => void
    label: string
  }) {
    return (
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <input required placeholder="Pub name" value={values.pub_name} onChange={(e) => onChange({ pub_name: e.target.value })} style={input} />
        <input required placeholder="Location / address" value={values.location} onChange={(e) => onChange({ location: e.target.value })} style={input} />
        <input required placeholder="Drink" value={values.drink} onChange={(e) => onChange({ drink: e.target.value })} style={input} />
        <input required placeholder="Mini-game description" value={values.mini_game} onChange={(e) => onChange({ mini_game: e.target.value })} style={input} />
        <label style={{ fontSize: '0.82rem', color: '#7a9390', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
          <input type="checkbox" checked={values.is_web_game} onChange={(e) => onChange({ is_web_game: e.target.checked })} />
          Web reaction game ⚡
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={isPending} style={btn()}>{label}</button>
          <button type="button" onClick={() => { setShowAdd(false); setEditingId(null) }} style={btn('#2a3533')}>Cancel</button>
        </div>
      </form>
    )
  }

  return (
    <>
      {toast && <Toast {...toast} onDismiss={dismiss} />}

      {!showAdd && (
        <button onClick={() => setShowAdd(true)} style={{ ...btn(), marginBottom: '1rem' }}>
          + Add stop
        </button>
      )}

      {showAdd && (
        <div style={{ background: '#151a19', borderRadius: 14, padding: '1rem', border: '1px solid #CEDC00', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>New Stop</h3>
          <StopForm values={form} onChange={patchForm} onSubmit={handleAdd} label="Add stop" />
        </div>
      )}

      {initialStops.map((stop, idx) => (
        <div key={stop.id} style={{
          background: '#151a19', borderRadius: 14, padding: '1rem',
          border: `1px solid ${editingId === stop.id ? '#CEDC00' : '#2a3533'}`,
          marginBottom: '0.75rem',
        }}>
          {editingId === stop.id ? (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Edit Stop {stop.position}</h3>
              <StopForm
                values={editForm}
                onChange={patchEdit}
                onSubmit={(e) => handleUpdate(e, stop.id)}
                label="Save"
              />
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button disabled={idx === 0 || isPending} onClick={() => handleReorder(stop.id, 'up')} style={{ ...btn('#1e2523'), padding: '4px 8px', fontSize: '0.9rem' }}>▲</button>
                <button disabled={idx === initialStops.length - 1 || isPending} onClick={() => handleReorder(stop.id, 'down')} style={{ ...btn('#1e2523'), padding: '4px 8px', fontSize: '0.9rem' }}>▼</button>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700 }}>{stop.position}. {stop.pub_name}</span>
                  {stop.is_web_game && <span style={{ background: '#CEDC00', color: '#0B0F0E', fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: 99 }}>GAME</span>}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#7a9390' }}>📍 {stop.location}</p>
                <p style={{ fontSize: '0.8rem', color: '#7a9390' }}>🍺 {stop.drink} · 🎯 {stop.mini_game}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                <button onClick={() => { setEditingId(stop.id); setEditForm({ pub_name: stop.pub_name, location: stop.location, drink: stop.drink, mini_game: stop.mini_game, is_web_game: stop.is_web_game }) }} style={btn('#1e2523')}>✏️</button>
                <button onClick={() => handleDelete(stop.id, stop.pub_name)} style={btn('#c0392b')}>🗑️</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  )
}
