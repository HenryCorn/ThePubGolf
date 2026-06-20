'use client'

import { useState, useTransition } from 'react'
import { PLAYER_EMOJIS } from '@/lib/emojis'
import { Toast, useToast } from '@/components/Toast'

interface Props {
  existingPlayers: { id: string; name: string; emoji: string }[]
}

export default function RegistrationForm({ existingPlayers }: Props) {
  const [tab, setTab] = useState<'new' | 'returning'>('new')
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [isPending, startTransition] = useTransition()
  const { toast, show, dismiss } = useToast()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!emoji) { show('Pick an emoji!', 'error'); return }
    if (name.trim().length < 2) { show('Name must be at least 2 characters', 'error'); return }

    startTransition(async () => {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), emoji }),
      })
      const data = await res.json()
      if (!res.ok) {
        show(data.error ?? 'Something went wrong', 'error')
      } else {
        show(`Welcome, ${emoji} ${data.name}! 🎉`, 'success')
        setTimeout(() => { window.location.href = '/itinerary' }, 800)
      }
    })
  }

  async function handleReturning(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) { show('Pick your name', 'error'); return }

    startTransition(async () => {
      const res = await fetch('/api/players/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: selectedId }),
      })
      if (!res.ok) {
        show('Could not log in', 'error')
      } else {
        window.location.href = '/itinerary'
      }
    })
  }

  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: '10px 0',
    fontSize: '0.9rem',
    fontWeight: active ? 600 : 400,
    color: active ? '#F4C430' : '#5879A0',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #F4C430' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'color 0.15s',
  } as React.CSSProperties)

  return (
    <>
      {toast && <Toast {...toast} onDismiss={dismiss} />}

      <div style={{ background: '#0C1728', borderRadius: 16, overflow: 'hidden', border: '1px solid #1A3055' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #1A3055' }}>
          <button style={tabStyle(tab === 'new')} onClick={() => setTab('new')}>New Player</button>
          <button style={tabStyle(tab === 'returning')} onClick={() => setTab('returning')}>Returning</button>
        </div>

        {tab === 'new' ? (
          <form onSubmit={handleRegister} style={{ padding: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#5879A0', marginBottom: 4 }}>Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="e.g. Alex"
              required
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: '#132040', border: '1px solid #1A3055', color: '#D6ECFF',
                fontSize: '1rem', marginBottom: '1rem',
              }}
            />

            <label style={{ display: 'block', fontSize: '0.8rem', color: '#5879A0', marginBottom: 6 }}>Pick your emoji</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 4, marginBottom: '1.25rem', maxHeight: 180, overflowY: 'auto',
            }}>
              {PLAYER_EMOJIS.map((e) => (
                <button
                  key={e} type="button"
                  onClick={() => setEmoji(e)}
                  style={{
                    fontSize: '1.4rem', padding: '4px 0', borderRadius: 8, border: 'none',
                    background: emoji === e ? '#1666C4' : 'transparent',
                    outline: emoji === e ? '2px solid #F4C430' : 'none',
                    cursor: 'pointer', lineHeight: 1.4,
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            {emoji && (
              <p style={{ fontSize: '0.85rem', color: '#5879A0', marginBottom: '0.75rem', textAlign: 'center' }}>
                Playing as {emoji} {name || '…'}
              </p>
            )}

            <button
              type="submit" disabled={isPending}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                background: isPending ? '#1A3055' : '#1666C4', color: '#D6ECFF',
                fontSize: '1rem', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Joining…' : "Let's golf! ⛳"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReturning} style={{ padding: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#5879A0', marginBottom: 4 }}>Who are you?</label>
            {existingPlayers.length === 0 ? (
              <p style={{ color: '#5879A0', marginBottom: '1rem', fontSize: '0.9rem' }}>
                No players registered yet — be the first!
              </p>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  background: '#132040', border: '1px solid #1A3055', color: '#D6ECFF',
                  fontSize: '1rem', marginBottom: '1rem',
                }}
              >
                <option value="">Select your name…</option>
                {existingPlayers.map((p) => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            )}
            <button
              type="submit" disabled={isPending || !selectedId}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                background: !selectedId || isPending ? '#1A3055' : '#1666C4', color: '#D6ECFF',
                fontSize: '1rem', fontWeight: 600, cursor: !selectedId || isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Logging in…' : 'Continue ⛳'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
