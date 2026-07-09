'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Refreshes the itinerary when stops change (e.g. admin moves the party to a
// new pub) so the "You are here" highlight updates without a manual reload.
export default function ItineraryRealtime() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('itinerary-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stops' }, () => router.refresh())
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') console.error('[Realtime] itinerary channel error')
      })
    return () => { supabase.removeChannel(channel) }
  }, [router])

  return null
}
