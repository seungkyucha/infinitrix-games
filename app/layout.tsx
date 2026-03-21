import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { getLocale, getMessages } from '@/lib/i18n'
import { I18nProvider } from '@/lib/i18n-client'

export const metadata: Metadata = {
  title: 'InfiniTriX — HTML5 Game Platform',
  description: 'An ever-growing HTML5 game platform powered by AI agents.',
  keywords: ['HTML5 games', 'browser games', 'free games', 'AI games'],
  openGraph: {
    title: 'InfiniTriX — HTML5 Game Platform',
    description: 'An ever-growing HTML5 game platform powered by AI agents.',
    type: 'website',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const t = getMessages(locale)

  return (
    <html lang={locale} className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary min-h-screen font-sans antialiased">
        <I18nProvider value={{ t, locale }}>
          <div className="bg-grid min-h-screen">
            <Header />
            <main className="pt-16">
              {children}
            </main>
            <footer className="border-t border-border-dim mt-20 py-8 text-center text-text-muted text-sm">
              <p>© 2025 InfiniTriX · AI-Powered Game Platform · {t.footer.autoAdded}</p>
            </footer>
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}
