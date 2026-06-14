'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError('Wrong passcode')
        setPasscode('')
      }
    })
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', background: '#0B0F0E',
    }}>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <h1 style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.5rem', color: '#CEDC00', marginBottom: '1.5rem' }}>
          🔒 Admin
        </h1>
        <form onSubmit={handleSubmit} style={{
          background: '#151a19', borderRadius: 16, padding: '1.25rem',
          border: '1px solid #2a3533',
        }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9390', marginBottom: 4 }}>Passcode</label>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            required
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10,
              background: '#1e2523', border: `1px solid ${error ? '#e55' : '#2a3533'}`,
              color: '#e8f0ee', fontSize: '1rem', marginBottom: '0.75rem',
            }}
          />
          {error && <p style={{ color: '#e55', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</p>}
          <button
            type="submit" disabled={isPending}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, border: 'none',
              background: isPending ? '#2a3533' : '#00594F', color: '#e8f0ee',
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
