'use client'

import { useState, useTransition } from 'react'

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })
      if (res.ok) {
        window.location.href = '/admin'
      } else {
        setError('Wrong passcode')
        setPasscode('')
      }
    })
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', background: '#070F1B',
    }}>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <h1 style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.5rem', color: '#F4C430', marginBottom: '1.5rem' }}>
          🔒 Admin
        </h1>
        <form onSubmit={handleSubmit} style={{
          background: '#0C1728', borderRadius: 16, padding: '1.25rem',
          border: '1px solid #1A3055',
        }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#5879A0', marginBottom: 4 }}>Passcode</label>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            required
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10,
              background: '#132040', border: `1px solid ${error ? '#e55' : '#1A3055'}`,
              color: '#D6ECFF', fontSize: '1rem', marginBottom: '0.75rem',
            }}
          />
          {error && <p style={{ color: '#e55', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</p>}
          <button
            type="submit" disabled={isPending}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, border: 'none',
              background: isPending ? '#1A3055' : '#1666C4', color: '#D6ECFF',
              fontSize: '1rem', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
