import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySignedCookie, PLAYER_COOKIE } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Player, Team } from '@/lib/supabase/types'

const cardStyle: React.CSSProperties = {
  background: '#F2E8C6',
  borderRadius: 3,
  padding: '1rem',
  border: '1px solid rgba(122,92,16,0.25)',
  marginBottom: '0.75rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem', color: '#6B5A3E',
  fontFamily: 'var(--font-caveat, cursive)',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  marginBottom: 4,
}

export default async function TeamPage() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PLAYER_COOKIE)?.value
  const payload = raw ? await verifySignedCookie<{ player_id: string }>(raw) : null
  if (!payload?.player_id) redirect('/')

  const supabase = await createClient()

  const { data: meRaw } = await supabase
    .from('players').select('*').eq('id', payload.player_id).single()
  if (!meRaw) redirect('/')
  const me = meRaw as Player

  const team: Team | null = me.team_id
    ? ((await supabase.from('teams').select('*').eq('id', me.team_id).single()).data as Team)
    : null

  const teammates = team
    ? ((await supabase.from('players').select('*').eq('team_id', team.id).order('name')).data as Player[] ?? [])
    : []

  const scoresRaw = team
    ? (await supabase.from('scores').select('*, stops(position, pub_name)').eq('team_id', team.id)).data
    : []
  const scores = (scoresRaw ?? []) as any[]
  const total = scores.reduce((sum: number, s: any) => sum + s.sips + s.penalties, 0)

  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: 480, margin: '0 auto' }}>

      <header style={{ textAlign: 'center', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(201,168,76,0.28)' }}>
        <p style={{
          fontFamily: 'var(--font-caveat, cursive)',
          fontSize: '0.88rem', color: '#7A9A85',
          letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 4,
        }}>
          — your —
        </p>
        <h1 style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: '2.4rem', fontWeight: 900, fontStyle: 'italic',
          color: '#F2E8C6', lineHeight: 1,
        }}>
          Team
        </h1>
        <div style={{ width: 48, height: 2, background: '#C9A84C', margin: '0.65rem auto 0' }} />
      </header>

      {/* Player identity */}
      <div style={{ ...cardStyle, borderLeft: '4px solid #C9A84C' }}>
        <p style={labelStyle}>You are</p>
        <p style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: '1.35rem', fontWeight: 700, color: '#1B3A2D',
        }}>
          {me.emoji} {me.name}
        </p>
      </div>

      {!team ? (
        <div style={cardStyle}>
          <p style={{
            color: '#6B5A3E', fontFamily: 'var(--font-caveat, cursive)', fontSize: '1rem', lineHeight: 1.5,
          }}>
            You haven&apos;t been assigned to a team yet. Check back once the admin generates teams!
          </p>
        </div>
      ) : (
        <>
          {/* Team roster */}
          <div style={cardStyle}>
            <p style={labelStyle}>Team</p>
            <p style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              fontSize: '1.2rem', fontWeight: 700, color: '#1B3A2D',
              marginBottom: '0.85rem',
            }}>
              {team.name}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {teammates.map((p) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 8px', borderRadius: 2,
                  background: p.id === me.id ? 'rgba(27,58,45,0.08)' : 'transparent',
                  border: p.id === me.id ? '1px solid rgba(122,92,16,0.25)' : '1px solid transparent',
                }}>
                  <span style={{
                    fontFamily: 'Georgia, serif', fontSize: '0.92rem', color: '#2C1810',
                  }}>
                    {p.emoji} {p.name}
                    {p.id === me.id && (
                      <span style={{
                        marginLeft: 6,
                        fontSize: '0.67rem', color: '#7A5C10',
                        fontFamily: 'var(--font-caveat, cursive)',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>
                        you
                      </span>
                    )}
                  </span>
                  {team.captain_id === p.id && (
                    <span style={{
                      fontSize: '0.67rem', color: '#7A5C10',
                      fontFamily: 'var(--font-caveat, cursive)',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      border: '1px solid rgba(122,92,16,0.45)',
                      padding: '1px 6px', borderRadius: 1,
                    }}>
                      Captain
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scorecard */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <p style={labelStyle}>Scorecard</p>
                <p style={{
                  fontFamily: 'var(--font-playfair, Georgia, serif)',
                  fontWeight: 700, color: '#1B3A2D', fontSize: '1rem',
                }}>
                  {team.name}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'var(--font-playfair, Georgia, serif)',
                  fontSize: '2rem', fontWeight: 900, color: '#C9A84C', lineHeight: 1,
                }}>
                  {total}
                </div>
                <div style={{
                  fontSize: '0.65rem', color: '#6B5A3E',
                  fontFamily: 'var(--font-caveat, cursive)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  strokes
                </div>
              </div>
            </div>

            {scores.length === 0 ? (
              <p style={{ color: '#6B5A3E', fontSize: '0.9rem', fontFamily: 'var(--font-caveat, cursive)' }}>
                No scores yet
              </p>
            ) : (
              scores.map((s: any) => (
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.83rem', padding: '5px 0',
                  borderTop: '1px solid rgba(122,92,16,0.15)',
                }}>
                  <span style={{ color: '#6B5A3E', fontFamily: 'var(--font-caveat, cursive)' }}>
                    {s.stops?.position}. {s.stops?.pub_name}
                  </span>
                  <span style={{ color: '#2C1810', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                    {s.sips}{s.penalties > 0 ? ` +${s.penalties}` : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
