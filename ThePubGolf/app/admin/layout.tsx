import Link from 'next/link'

const navLinks = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/teams', label: 'Teams' },
  { href: '/admin/scores', label: 'Scores' },
  { href: '/admin/itinerary', label: 'Itinerary' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#0F2018' }}>
      <header style={{
        background: '#132B20', borderBottom: '1px solid rgba(201,168,76,0.2)',
        padding: '0.75rem 1rem',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontWeight: 700, color: '#C9A84C', marginRight: '0.5rem',
          fontStyle: 'italic',
        }}>
          ⛳ Admin
        </span>
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href} style={{
            color: '#7A9A85', fontSize: '0.85rem', textDecoration: 'none',
            fontFamily: 'var(--font-caveat, cursive)',
          }}>
            {l.label}
          </Link>
        ))}
        <form method="POST" action="/api/admin/logout" style={{ marginLeft: 'auto' }}>
          <button type="submit" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#8B1E1E', fontSize: '0.8rem', padding: 0,
            fontFamily: 'var(--font-caveat, cursive)',
          }}>
            Sign out
          </button>
        </form>
      </header>
      <main style={{ padding: '1.25rem', maxWidth: 700, margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
