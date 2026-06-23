'use client'

import { useState } from 'react'

export default function ResetButton() {
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState('')

  async function handleReset() {
    if (!confirm(
      '⚠️ This will DELETE all players, teams, scores, and mini-game results.\n' +
      'The itinerary will be kept.\n\nAre you sure?'
    )) return

    setResetting(true)
    setError('')

    const res = await fetch('/api/admin/reset', { method: 'DELETE' })
    if (res.ok) {
      // Hard reload so the server re-fetches fresh counts — router.refresh()
      // can serve a stale layout segment cache.
      window.location.reload()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.errors?.join(', ') ?? 'Reset failed')
      setResetting(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleReset}
        disabled={resetting}
        style={{
          padding: '10px 18px', borderRadius: 8,
          border: '1px solid rgba(139,30,30,0.6)',
          background: 'transparent', color: '#C05050',
          fontSize: '0.9rem', fontWeight: 600,
          cursor: resetting ? 'not-allowed' : 'pointer',
          opacity: resetting ? 0.6 : 1,
          fontFamily: 'var(--font-caveat, cursive)',
        }}
      >
        {resetting ? 'Resetting…' : 'Reset event data'}
      </button>
      {error && (
        <p style={{ color: '#C05050', fontSize: '0.8rem', marginTop: 6, fontFamily: 'var(--font-caveat, cursive)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
