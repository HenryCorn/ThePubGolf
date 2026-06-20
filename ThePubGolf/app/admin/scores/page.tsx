import { createClient } from '@/lib/supabase/server'
import ScoresClient from './ScoresClient'

export const revalidate = 0

export default async function ScoresPage() {
  const supabase = await createClient()
  const [{ data: teams }, { data: stops }, { data: scores }] = await Promise.all([
    supabase.from('teams').select('id, name').order('name'),
    supabase.from('stops').select('id, position, pub_name').order('position'),
    supabase.from('scores').select('*'),
  ])

  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '1rem', color: '#F4C430' }}>
        ⛳ Score Entry
      </h1>
      <ScoresClient teams={teams ?? []} stops={stops ?? []} scores={scores ?? []} />
    </div>
  )
}
