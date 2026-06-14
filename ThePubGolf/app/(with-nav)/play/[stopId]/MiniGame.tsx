'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateFacePositions } from '@/lib/utils/placement'
import {
  TARGET_FACE, FUN_FACES, NUM_ROUNDS, NUM_FACES,
  randomDelay, average,
} from '@/lib/utils/minigame'
import { Toast, useToast } from '@/components/Toast'

type Phase = 'idle' | 'countdown' | 'waiting' | 'active' | 'roundDone' | 'finished' | 'alreadyPlayed'

interface Face { emoji: string; x: number; y: number; isTarget: boolean; id: number }

interface Props {
  stopId: string
  previousResult: { avg_ms: number; round_times_ms: number[] } | null
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function MiniGame({ stopId, previousResult }: Props) {
  const router = useRouter()
  const { toast, show, dismiss } = useToast()
  const [phase, setPhase] = useState<Phase>(previousResult ? 'alreadyPlayed' : 'idle')
  const [countdown, setCountdown] = useState(3)
  const [round, setRound] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const [faces, setFaces] = useState<Face[]>([])
  const [shaking, setShaking] = useState<number | null>(null)
  const startRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const startCountdown = useCallback(() => {
    setPhase('countdown')
    setCountdown(3)
  }, [])

  // Countdown tick
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      setPhase('waiting')
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // Random delay then show faces
  useEffect(() => {
    if (phase !== 'waiting') return
    const delay = randomDelay()
    const t = setTimeout(() => {
      const bounds = containerRef.current?.getBoundingClientRect()
      const w = bounds?.width ?? 375
      const h = bounds?.height ?? 667
      const positions = generateFacePositions(NUM_FACES, w, h)

      const others = shuffle(FUN_FACES).slice(0, NUM_FACES - 1)
      const targetIdx = Math.floor(Math.random() * NUM_FACES)
      const faceList: Face[] = positions.map((pos, i) => ({
        id: i,
        x: pos.x,
        y: pos.y,
        isTarget: i === targetIdx,
        emoji: i === targetIdx ? TARGET_FACE : others[i < targetIdx ? i : i - 1],
      }))

      setFaces(faceList)
      startRef.current = performance.now()
      setPhase('active')
    }, delay)
    return () => clearTimeout(t)
  }, [phase])

  function handleFaceTap(face: Face) {
    if (phase !== 'active') return
    if (!face.isTarget) {
      setShaking(face.id)
      setTimeout(() => setShaking(null), 400)
      return
    }
    const elapsed = Math.round(performance.now() - startRef.current)
    const newTimes = [...times, elapsed]
    setTimes(newTimes)

    if (newTimes.length >= NUM_ROUNDS) {
      setPhase('finished')
      submitResult(newTimes)
    } else {
      setPhase('roundDone')
    }
  }

  async function submitResult(roundTimes: number[]) {
    const res = await fetch('/api/minigame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stopId, roundTimes }),
    })
    if (!res.ok) {
      const d = await res.json()
      show(d.error ?? 'Could not save result', 'error')
    }
  }

  function nextRound() {
    setRound((r) => r + 1)
    setFaces([])
    setCountdown(3)
    setPhase('countdown')
  }

  if (phase === 'alreadyPlayed' && previousResult) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-4">
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#CEDC00' }}>Already played!</h2>
        <p style={{ color: '#7a9390' }}>
          Your best average was <strong style={{ color: '#e8f0ee' }}>{previousResult.avg_ms}ms</strong>
        </p>
        <p style={{ color: '#7a9390', fontSize: '0.85rem' }}>
          Rounds: {previousResult.round_times_ms.map((t) => `${t}ms`).join(' · ')}
        </p>
        <button
          onClick={() => router.push('/leaderboard')}
          style={{
            marginTop: '1rem', padding: '12px 28px', borderRadius: 12, border: 'none',
            background: '#00594F', color: '#e8f0ee', fontSize: '1rem', fontWeight: 600,
          }}
        >
          See leaderboard
        </button>
      </div>
    )
  }

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-6">
        {toast && <Toast {...toast} onDismiss={dismiss} />}
        <div style={{ fontSize: '5rem' }}>{TARGET_FACE}</div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#CEDC00', marginBottom: 8 }}>
            Tap this face!
          </h2>
          <p style={{ color: '#7a9390', lineHeight: 1.5 }}>
            {NUM_FACES} faces will appear. Tap <strong style={{ color: '#e8f0ee' }}>{TARGET_FACE}</strong> as fast as you can.
            {NUM_ROUNDS} rounds. The melting face is the one.
          </p>
        </div>
        <button
          onClick={startCountdown}
          style={{
            padding: '14px 36px', borderRadius: 14, border: 'none',
            background: '#CEDC00', color: '#0B0F0E', fontSize: '1.1rem', fontWeight: 700,
          }}
        >
          Start
        </button>
      </div>
    )
  }

  if (phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <div style={{
          fontSize: '8rem', fontWeight: 900, color: '#CEDC00',
          animation: 'pulse 0.9s ease-in-out',
        }}>
          {countdown > 0 ? countdown : '…'}
        </div>
        <p style={{ color: '#7a9390', marginTop: 8 }}>Round {round + 1} of {NUM_ROUNDS}</p>
      </div>
    )
  }

  if (phase === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <div style={{ fontSize: '3rem', opacity: 0.4 }}>⏳</div>
      </div>
    )
  }

  if (phase === 'active') {
    return (
      <div ref={containerRef} style={{ position: 'fixed', inset: 0, overflow: 'hidden', cursor: 'none' }}>
        {faces.map((face) => (
          <button
            key={face.id}
            onClick={() => handleFaceTap(face)}
            style={{
              position: 'absolute',
              left: face.x,
              top: face.y,
              width: 56,
              height: 56,
              fontSize: '2.5rem',
              lineHeight: '56px',
              textAlign: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transform: shaking === face.id ? 'translateX(-4px)' : undefined,
              animation: shaking === face.id ? 'shake 0.4s ease' : undefined,
              transition: 'transform 0.1s',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {face.emoji}
          </button>
        ))}
        <style>{`
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            25%{transform:translateX(-6px)}
            75%{transform:translateX(6px)}
          }
        `}</style>
      </div>
    )
  }

  if (phase === 'roundDone') {
    const lastTime = times[times.length - 1]
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-4">
        <div style={{ fontSize: '3rem' }}>⚡</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#CEDC00' }}>
          Round {round + 1} done!
        </h2>
        <p style={{ color: '#e8f0ee', fontSize: '1.1rem' }}>
          {lastTime}ms
        </p>
        <button
          onClick={nextRound}
          style={{
            padding: '12px 32px', borderRadius: 12, border: 'none',
            background: '#00594F', color: '#e8f0ee', fontSize: '1rem', fontWeight: 600,
          }}
        >
          Next round →
        </button>
      </div>
    )
  }

  if (phase === 'finished') {
    const avg = average(times)
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-4">
        {toast && <Toast {...toast} onDismiss={dismiss} />}
        <div style={{ fontSize: '4rem' }}>🏁</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#CEDC00' }}>Done!</h2>
        <div style={{ background: '#151a19', borderRadius: 14, padding: '1rem 1.5rem', border: '1px solid #2a3533' }}>
          <p style={{ color: '#7a9390', marginBottom: 6, fontSize: '0.85rem' }}>Your rounds</p>
          {times.map((t, i) => (
            <p key={i} style={{ fontSize: '1rem', fontWeight: 600 }}>Round {i + 1}: {t}ms</p>
          ))}
          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#CEDC00', marginTop: 8 }}>
            Avg: {avg}ms
          </p>
        </div>
        <button
          onClick={() => router.push('/leaderboard')}
          style={{
            padding: '12px 28px', borderRadius: 12, border: 'none',
            background: '#00594F', color: '#e8f0ee', fontSize: '1rem', fontWeight: 600,
          }}
        >
          See leaderboard
        </button>
      </div>
    )
  }

  return null
}
