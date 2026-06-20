import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySignedCookie, PLAYER_COOKIE } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Player, Team } from '@/lib/supabase/types'

export default async function TeamPage() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PLAYER_COOKIE)?.value
  const payload = raw ? await verifySignedCookie<{ player_id: string }>(raw) : null

  if (!payload?.player_id) redirect('/')

  const supabase = await createClient()

  const { data: meRaw } = await supabase
    .from('players')
    .select('*')
    .eq('id', payload.player_id)
    .single()

  if (!meRaw) redirect('/')
  const me = meRaw as Player

  const team: Team | null = me.team_id
    ? ((await supabase.from('teams').select('*').eq('id', me.team_id).single()).data as Team)
    : null

  const teammates = team
    ? ((await supabase.from('players').select('*').eq('team_id', team.id).order('name')).data as Player[] ?? [])
    : []

  const scoresRaw = team
    ? (await supabase
        .from('scores')
        .select('*, stops(position, pub_name)')
        .eq('team_id', team.id)).data
    : []

  const scores = (scoresRaw ?? []) as any[]
  const total = scores.reduce((sum: number, s: any) => sum + s.sips + s.penalties, 0)

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '1rem', color: '#F4C430' }}>
        👥 My Team
      </h1>

      <div style={{ background: '#0C1728', borderRadius: 14, padding: '1rem', border: '1px solid #1A3055', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: '#5879A0', marginBottom: 2 }}>You are</p>
        <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>{me.emoji} {me.name}</p>
      </div>

      {!team ? (
        <div style={{ background: '#0C1728', borderRadius: 14, padding: '1rem', border: '1px solid #1A3055' }}>
          <p style={{ color: '#5879A0' }}>You haven&apos;t been assigned to a team yet. Check back once the admin generates teams!</p>
        </div>
      ) : (
        <>
          <div style={{ background: '#0C1728', borderRadius: 14, padding: '1rem', border: '1px solid #1A3055', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#5879A0', marginBottom: 4 }}>Team</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>{team.name}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {teammates.map((p) => (
                <span key={p.id} style={{
                  background: p.id === me.id ? '#1666C4' : '#132040',
                  border: `1px solid ${p.id === me.id ? '#F4C430' : '#1A3055'}`,
                  borderRadius: 99, padding: '4px 10px', fontSize: '0.85rem',
                }}>
                  {p.emoji} {p.name}
                  {team.captain_id === p.id && <span style={{ marginLeft: 4, color: '#F4C430' }}>★</span>}
                </span>
              ))}
            </div>
          </div>

          <div style={{ background: '#0C1728', borderRadius: 14, padding: '1rem', border: '1px solid #1A3055' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <p style={{ fontWeight: 700 }}>Scorecard</p>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#F4C430' }}>{total} pts</span>
            </div>
            {scores.length === 0 ? (
              <p style={{ color: '#5879A0', fontSize: '0.85rem' }}>No scores yet</p>
            ) : (
              scores.map((s: any) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0', borderTop: '1px solid #1A3055' }}>
                  <span style={{ color: '#5879A0' }}>{s.stops?.position}. {s.stops?.pub_name}</span>
                  <span>{s.sips} sips{s.penalties > 0 ? ` +${s.penalties}⚠️` : ''}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
