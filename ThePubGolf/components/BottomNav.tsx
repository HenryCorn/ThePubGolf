'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function RouteIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l6-3 6 3 6-3v14l-6 3-6-3-6 3V7z" />
      <path d="M9 4v14M15 7v14" />
    </svg>
  )
}

function TrophyIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M6 5v6a6 6 0 0012 0V5H6z" />
      <path d="M12 17v4M9 21h6" />
    </svg>
  )
}

function ChartIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
      <path d="M3 20h18" />
    </svg>
  )
}

function TeamIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-1a6 6 0 0112 0v1" />
      <circle cx="18" cy="8" r="2.5" />
      <path d="M15.5 21v-.5a4.5 4.5 0 014.5-4.5" />
    </svg>
  )
}

const tabs = [
  { href: '/itinerary', label: 'Route', Icon: RouteIcon },
  { href: '/leaderboard', label: 'Board', Icon: TrophyIcon },
  { href: '/stats', label: 'Stats', Icon: ChartIcon },
  { href: '/team', label: 'Team', Icon: TeamIcon },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex"
      style={{
        background: '#132B20',
        borderTop: '1px solid rgba(201,168,76,0.22)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        const color = active ? '#C9A84C' : '#5A8A6A'
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5"
            style={{ textDecoration: 'none', color, transition: 'color 0.15s' }}
          >
            <tab.Icon color={color} />
            <span style={{
              fontSize: '0.63rem',
              fontFamily: 'var(--font-caveat, cursive)',
              fontWeight: active ? 700 : 400,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
