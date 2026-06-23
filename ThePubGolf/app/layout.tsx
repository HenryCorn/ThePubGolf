import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Caveat } from 'next/font/google'
import SceneBG from '@/components/SceneBG'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
})

const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Pub Golf',
  description: 'Team pub golf — lowest score wins',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${caveat.variable}`}>
      <body>
        <SceneBG />
        {children}
      </body>
    </html>
  )
}
