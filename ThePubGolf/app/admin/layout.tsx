import Link from 'next/link'

const navLinks = [
  { href: '/admin', label: '🏠 Overview' },
  { href: '/admin/teams', label: '👥 Teams' },
  { href: '/admin/scores', label: '⛳ Scores' },
  { href: '/admin/itinerary', label: '📍 Itinerary' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#070F1B' }}>
      <header style={{
        background: '#0C1728', borderBottom: '1px solid #1A3055',
        padding: '0.75rem 1rem',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 700, color: '#F4C430', marginRight: '0.5rem' }}>⛳ Admin</span>
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href} style={{ color: '#5879A0', fontSize: '0.85rem', textDecoration: 'none' }}>
            {l.label}
          </Link>
        ))}
        <Link href="/api/admin/logout" style={{ marginLeft: 'auto', color: '#e55', fontSize: '0.8rem', textDecoration: 'none' }}>
          Sign out
        </Link>
      </header>
      <main style={{ padding: '1.25rem', maxWidth: 700, margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
