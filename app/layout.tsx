import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'InfiniTriX — HTML5 Game Platform',
  description: '무한 성장하는 HTML5 게임 플랫폼. 매일 새로운 게임이 추가됩니다.',
  keywords: ['HTML5 games', '게임', 'browser games', 'free games'],
  openGraph: {
    title: 'InfiniTriX — HTML5 Game Platform',
    description: '무한 성장하는 HTML5 게임 플랫폼',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary min-h-screen font-sans antialiased">
        <div className="bg-grid min-h-screen">
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <footer className="border-t border-border-dim mt-20 py-8 text-center text-text-muted text-sm">
            <p>© 2025 InfiniTriX · AI-Powered Game Platform · 게임은 매일 자동으로 추가됩니다</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
