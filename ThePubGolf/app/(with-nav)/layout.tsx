import { cookies } from 'next/headers'
import { verifySignedCookie, PLAYER_COOKIE } from '@/lib/auth'
import BottomNav from '@/components/BottomNav'

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PLAYER_COOKIE)?.value
  let showNav = false
  if (raw) {
    const payload = await verifySignedCookie<{ player_id: string }>(raw)
    showNav = !!payload?.player_id
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <main className={`flex-1 ${showNav ? 'pb-20' : ''}`}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  )
}
