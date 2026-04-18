'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from '@/lib/i18n-client'
import LocaleSwitcher from './LocaleSwitcher'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useTranslations()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-dim bg-bg-primary/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-white font-bold text-sm shadow-glow-purple">
              IX
            </div>
            <span className="font-bold text-lg gradient-text tracking-tight">
              InfiniTriX
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/">{t.nav.games}</NavLink>
            <NavLink href="/about">{t.nav.about}</NavLink>
            <NavLink href="/dashboard">{t.nav.dashboard}</NavLink>
            <NavLink href="/dev-log">{t.nav.devlog}</NavLink>
            <NavLink href="/evolution">{t.nav.evolution}</NavLink>
            <a
              href="https://github.com/seungkyucha/infinitrix-games"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm flex items-center gap-1.5"
            >
              <GithubIcon />
              GitHub
            </a>
            <LocaleSwitcher />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <LocaleSwitcher />
            <button
              className="text-text-secondary hover:text-text-primary p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t.nav.menu}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border-dim bg-bg-secondary px-4 py-4 space-y-3">
          <MobileNavLink href="/" onClick={() => setMenuOpen(false)}>🎮 {t.nav.games}</MobileNavLink>
          <MobileNavLink href="/about" onClick={() => setMenuOpen(false)}>ℹ️ {t.nav.about}</MobileNavLink>
          <MobileNavLink href="/dashboard" onClick={() => setMenuOpen(false)}>📡 {t.nav.dashboard}</MobileNavLink>
          <MobileNavLink href="/dev-log" onClick={() => setMenuOpen(false)}>📓 {t.nav.devlog}</MobileNavLink>
          <MobileNavLink href="/evolution" onClick={() => setMenuOpen(false)}>🧬 {t.nav.evolution}</MobileNavLink>
        </div>
      )}
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block text-text-secondary hover:text-text-primary transition-colors py-1">
      {children}
    </Link>
  )
}

function GithubIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
