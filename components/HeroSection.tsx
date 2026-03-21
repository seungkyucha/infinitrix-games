'use client'

import type { ReactNode } from 'react'
import { useTranslations } from '@/lib/i18n-client'

interface Props {
  totalGames: number
  rightSlot?: ReactNode
}

export default function HeroSection({ totalGames, rightSlot }: Props) {
  const { t } = useTranslations()

  return (
    <section className="relative pt-12 pb-14 mb-8 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(108,60,247,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(108,60,247,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute -left-32 top-0 w-64 h-64 rounded-full bg-accent-purple/10 blur-[80px] pointer-events-none" />
      <div className="absolute -right-32 bottom-0 w-64 h-64 rounded-full bg-accent-cyan/8 blur-[80px] pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-accent-green/10 border border-accent-green/25 text-accent-green text-xs font-mono tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow inline-block" />
            {t.home.badge}
          </div>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-accent-green/20 to-transparent" />
        </div>

        <div className="mb-6">
          <p className="text-text-muted text-xs font-mono tracking-[0.3em] uppercase mb-2">
            InfiniTriX Platform
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            <span className="text-text-primary">{t.home.hero1}</span>
            <br />
            <span className="gradient-text">{t.home.hero2}</span>
          </h1>
        </div>

        <p className="text-text-secondary text-sm sm:text-base max-w-md leading-relaxed mb-8">
          {t.home.heroDesc1}
          <br />
          {t.home.heroDesc2}
        </p>

        <div className="flex items-stretch gap-0 w-fit border border-border-dim rounded-sm overflow-hidden">
          <StatBlock value={totalGames} label="Games"   accent="text-accent-cyan" />
          <div className="w-px bg-border-dim" />
          <StatBlock value="Free"       label="Always"  accent="text-accent-green" />
        </div>
      </div>

      {rightSlot && (
        <div className="relative mt-8">
          {rightSlot}
        </div>
      )}
    </section>
  )
}

function StatBlock({ value, label, accent }: { value: string | number; label: string; accent: string }) {
  return (
    <div className="px-5 py-3 text-center bg-bg-card/50">
      <div className={`text-xl font-bold font-mono ${accent}`}>{value}</div>
      <div className="text-text-muted text-[10px] tracking-widest uppercase mt-0.5">{label}</div>
    </div>
  )
}
