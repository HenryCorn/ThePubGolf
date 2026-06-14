import BottomNav from '@/components/BottomNav'

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
