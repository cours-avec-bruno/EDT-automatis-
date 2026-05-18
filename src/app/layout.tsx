import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EDT — Bruno RICCI',
  description: 'Emploi du temps préparation aux oraux',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
