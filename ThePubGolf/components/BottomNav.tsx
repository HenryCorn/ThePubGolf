'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/itinerary', label: 'Itinerary', icon: '🗺️' },
  { href: '/leaderboard', label: 'Board', icon: '🏆' },
  { href: '/stats', label: 'Stats', icon: '📊' },
  { href: '/team', label: 'Team', icon: '👥' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t flex"
      style={{
        background: '#0C1728',
        borderColor: '#1A3055',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-xs transition-colors"
            style={{
              color: active ? '#F4C430' : '#5879A0',
              fontWeight: active ? 600 : 400,
            }}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
