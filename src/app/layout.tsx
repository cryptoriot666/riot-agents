import type { Metadata } from 'next'
import { Bebas_Neue, IBM_Plex_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap'
})

const plex = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-plex',
  display: 'swap'
})

export const metadata: Metadata = {
  title: '$RIOT — A Resurrection Machine for Dead NFTs',
  description: 'Living AI agents on Sui Mainnet. Every NFT gets a soul. Every conversation is immortalized on Walrus.',
  icons: { icon: '/logo.jpg', apple: '/logo.jpg' },
  openGraph: {
    images: ['/logo.jpg'],
  },
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bebas.variable} ${plex.variable}`}>
      <body className="min-h-screen bg-cream text-ink font-mono antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
