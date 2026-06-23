import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySignedCookie, PLAYER_COOKIE } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/BottomNav'

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PLAYER_COOKIE)?.value
  let showNav = false

  if (raw) {
    const payload = await verifySignedCookie<{ player_id: string }>(raw)
    if (payload?.player_id) {
      const supabase = await createClient()
      const { data } = await supabase
        .from('players').select('id').eq('id', payload.player_id).single()

      if (data) {
        showNav = true
      } else {
        // Cookie is cryptographically valid but the player no longer exists
        // (e.g. admin reset the event). Clear via a Route Handler — cookies
        // cannot be modified in a Server Component.
        redirect('/api/players/clear-session')
      }
    }
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <main className={`flex-1 ${showNav ? 'pb-20' : ''}`}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  )
}
