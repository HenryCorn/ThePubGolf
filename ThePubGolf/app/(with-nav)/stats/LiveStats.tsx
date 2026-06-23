'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatsCharts from './StatsCharts'
import type { LeaderboardEntry, Score } from '@/lib/supabase/types'

interface Props {
  initialEntries: LeaderboardEntry[]
  initialStops: { id: string; position: number; pub_name: string }[]
  initialScores: Score[]
  initialMinigames: any[]
}

export default function LiveStats({ initialEntries, initialStops, initialScores, initialMinigames }: Props) {
  const [entries, setEntries] = useState(initialEntries)
  const [scores, setScores] = useState(initialScores)
  const [minigames, setMinigames] = useState(initialMinigames)

  const refetch = useCallback(async () => {
    const res = await fetch('/api/stats')
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
      setScores(data.scores)
      setMinigames(data.minigames)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'minigame_results' }, refetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [refetch])

  return (
    <StatsCharts
      entries={entries}
      stops={initialStops}
      scores={scores}
      minigames={minigames}
    />
  )
}
