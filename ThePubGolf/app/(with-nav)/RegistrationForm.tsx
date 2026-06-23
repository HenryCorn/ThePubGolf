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

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 0',
    fontSize: '0.88rem',
    fontFamily: 'var(--font-caveat, cursive)',
    fontWeight: active ? 700 : 400,
    letterSpacing: '0.04em',
    color: active ? '#1B3A2D' : '#6B5A3E',
    background: 'none', border: 'none',
    borderBottom: active ? '2px solid #C9A84C' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'color 0.15s',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 2,
    background: '#F8F2DC', border: '1px solid rgba(122,92,16,0.35)',
    color: '#2C1810', fontSize: '1rem',
    fontFamily: 'Georgia, serif',
    outline: 'none',
  }

  return (
    <>
      {toast && <Toast {...toast} onDismiss={dismiss} />}

      <div style={{
        background: '#F2E8C6',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(122,92,16,0.3)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(122,92,16,0.2)' }}>
          <button style={tabStyle(tab === 'new')} onClick={() => setTab('new')}>New Player</button>
          <button style={tabStyle(tab === 'returning')} onClick={() => setTab('returning')}>Returning</button>
        </div>

        {tab === 'new' ? (
          <form onSubmit={handleRegister} style={{ padding: '1.25rem' }}>
            <label style={{
              display: 'block', fontSize: '0.75rem', color: '#6B5A3E',
              fontFamily: 'var(--font-caveat, cursive)', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 4,
            }}>
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="e.g. Alex"
              required
              style={{ ...inputStyle, marginBottom: '1rem' }}
            />

            <label style={{
              display: 'block', fontSize: '0.75rem', color: '#6B5A3E',
              fontFamily: 'var(--font-caveat, cursive)', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 6,
            }}>
              Pick your emoji
            </label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 3, marginBottom: '1.1rem', maxHeight: 180, overflowY: 'auto',
            }}>
              {PLAYER_EMOJIS.map((e) => (
                <button
                  key={e} type="button"
                  onClick={() => setEmoji(e)}
                  style={{
                    fontSize: '1.4rem', padding: '4px 0', borderRadius: 3, border: 'none',
                    background: emoji === e ? '#1B3A2D' : 'transparent',
                    outline: emoji === e ? '2px solid #C9A84C' : 'none',
                    cursor: 'pointer', lineHeight: 1.4,
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            {emoji && (
              <p style={{
                fontSize: '0.85rem', color: '#6B5A3E', marginBottom: '0.75rem',
                textAlign: 'center', fontFamily: 'var(--font-caveat, cursive)',
              }}>
                Playing as {emoji} {name || '…'}
              </p>
            )}

            <button
              type="submit" disabled={isPending}
              style={{
                width: '100%', padding: '12px',
                borderRadius: 2, border: '1px solid #2E6B47',
                background: isPending ? '#5A8A6A' : '#1B3A2D',
                color: '#F2E8C6',
                fontFamily: 'var(--font-playfair, Georgia, serif)',
                fontSize: '0.88rem', fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                cursor: isPending ? 'not-allowed' : 'pointer',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.12)',
              }}
            >
              {isPending ? 'Joining…' : "Let's Golf"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReturning} style={{ padding: '1.25rem' }}>
            <label style={{
              display: 'block', fontSize: '0.75rem', color: '#6B5A3E',
              fontFamily: 'var(--font-caveat, cursive)', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 4,
            }}>
              Who are you?
            </label>
            {existingPlayers.length === 0 ? (
              <p style={{ color: '#6B5A3E', marginBottom: '1rem', fontSize: '0.9rem', fontFamily: 'var(--font-caveat, cursive)' }}>
                No players yet — be the first!
              </p>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{ ...inputStyle, marginBottom: '1rem' }}
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
                width: '100%', padding: '12px',
                borderRadius: 2, border: '1px solid #2E6B47',
                background: !selectedId || isPending ? '#5A8A6A' : '#1B3A2D',
                color: '#F2E8C6',
                fontFamily: 'var(--font-playfair, Georgia, serif)',
                fontSize: '0.88rem', fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                cursor: !selectedId || isPending ? 'not-allowed' : 'pointer',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.12)',
              }}
            >
              {isPending ? 'Logging in…' : 'Continue'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
