// src/app/layout.tsx
import './globals.css'
import Header from '@/componets/Header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manda Shop!',
  description: 'O lugar onde pokémons se tornam tudo!',
  icons: {
    icon: '/img/MandaShopIcone.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=VT323&display=swap" 
        />
      </head>
      <body>
        <Header />
        <div id="ConteudoPrincipal">
          {children}
        </div>
      </body>
    </html>
  )
}