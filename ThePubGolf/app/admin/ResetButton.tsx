'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetButton() {
  const router = useRouter()
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    if (!confirm(
      '⚠️ This will DELETE all players, teams, scores, and mini-game results.\n' +
      'The itinerary will be kept.\n\nAre you sure?'
    )) return

    setResetting(true)
    await fetch('/api/admin/reset', { method: 'DELETE' })
    setResetting(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleReset}
      disabled={resetting}
      style={{
        padding: '10px 18px', borderRadius: 10, border: '1px solid #c0392b',
        background: 'transparent', color: '#e55',
        fontSize: '0.9rem', fontWeight: 600,
        cursor: resetting ? 'not-allowed' : 'pointer',
        opacity: resetting ? 0.6 : 1,
      }}
    >
      {resetting ? 'Resetting…' : '🗑️ Reset event data'}
    </button>
  )
}
