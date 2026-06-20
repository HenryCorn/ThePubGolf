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
    type === 'success' ? '#1666C4' : type === 'error' ? '#c0392b' : '#132040'

  return (
    <div
      className="fixed top-4 left-4 right-4 z-50 rounded-xl px-4 py-3 text-white text-sm font-medium shadow-lg"
      style={{ background: bg, maxWidth: 480, margin: '0 auto' }}
      onClick={onDismiss}
    >
      {message}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  const dismiss = () => setToast(null)

  return { toast, show, dismiss }
}
