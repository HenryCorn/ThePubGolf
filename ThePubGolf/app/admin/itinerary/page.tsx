import { createClient } from '@/lib/supabase/server'
import ItineraryClient from './ItineraryClient'

export const revalidate = 0

export default async function AdminItineraryPage() {
  const supabase = await createClient()
  const { data: stops } = await supabase
    .from('stops')
    .select('*')
    .order('position')

  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '1rem', color: '#F4C430' }}>
        📍 Itinerary
      </h1>
      <ItineraryClient stops={stops ?? []} />
    </div>
  )
}
