'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onDismiss: () => void
}

export function Toast({ message, type = 'info', onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  const bg =
    type === 'success' ? '#1B3A2D'
    : type === 'error' ? '#8B1E1E'
    : '#243F30'

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', top: 16, left: 16, right: 16, zIndex: 100,
        background: bg, color: '#F2E8C6',
        borderRadius: 3, padding: '12px 16px',
        fontFamily: 'var(--font-caveat, cursive)',
        fontSize: '1rem', fontWeight: 600,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        border: '1px solid rgba(201,168,76,0.25)',
        maxWidth: 480, margin: '0 auto',
        cursor: 'pointer',
      }}
    >
      {message}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => setToast({ message, type })
  const dismiss = () => setToast(null)
  return { toast, show, dismiss }
}
