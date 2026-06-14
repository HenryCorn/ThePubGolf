import { createClient } from '@/lib/supabase/server'
import TeamsClient from './TeamsClient'

export const revalidate = 0

export default async function TeamsPage() {
  const supabase = await createClient()
  const [{ data: teams }, { data: players }] = await Promise.all([
    supabase.from('teams').select('*, players(*)').order('name'),
    supabase.from('players').select('*').order('name'),
  ])

  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '1rem', color: '#CEDC00' }}>
        👥 Teams
      </h1>
      <TeamsClient teams={(teams as any) ?? []} players={players ?? []} />
    </div>
  )
}
