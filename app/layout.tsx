import type { Metadata } from 'next'
import { Inter, Red_Hat_Display, Gasoek_One } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const redHatDisplay = Red_Hat_Display({ subsets: ['latin'], variable: '--font-red-hat-display' })
const gasoekOne = Gasoek_One({ subsets: ['latin'], weight: '400', variable: '--font-gasoek-one' })

export const metadata: Metadata = {
  title: 'Maahir Links',
  description: 'Personal link sharing page',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${redHatDisplay.variable} ${gasoekOne.variable}`} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}
