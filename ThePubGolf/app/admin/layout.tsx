import Link from 'next/link'

const navLinks = [
  { href: '/admin', label: '🏠 Overview' },
  { href: '/admin/teams', label: '👥 Teams' },
  { href: '/admin/scores', label: '⛳ Scores' },
  { href: '/admin/itinerary', label: '📍 Itinerary' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#0B0F0E' }}>
      <header style={{
        background: '#151a19', borderBottom: '1px solid #2a3533',
        padding: '0.75rem 1rem',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 700, color: '#CEDC00', marginRight: '0.5rem' }}>⛳ Admin</span>
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href} style={{ color: '#7a9390', fontSize: '0.85rem', textDecoration: 'none' }}>
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
