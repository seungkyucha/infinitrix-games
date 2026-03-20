import type { ReactNode } from 'react'

interface Props {
  totalGames: number
  rightSlot?: ReactNode
}

export default function HeroSection({ totalGames, rightSlot }: Props) {
  return (
    <section className="relative pt-12 pb-14 mb-8 overflow-hidden">
      {/* 배경 그리드 */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(108,60,247,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(108,60,247,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* 좌측 네온 번짐 */}
      <div className="absolute -left-32 top-0 w-64 h-64 rounded-full bg-accent-purple/10 blur-[80px] pointer-events-none" />
      {/* 우측 네온 번짐 */}
      <div className="absolute -right-32 bottom-0 w-64 h-64 rounded-full bg-accent-cyan/8 blur-[80px] pointer-events-none" />

      {/* ── 2컬럼 레이아웃 (lg+에서 좌:텍스트 / 우:미니로그) ── */}
      <div className="relative lg:grid lg:grid-cols-[1fr_340px] lg:gap-10 lg:items-start xl:grid-cols-[1fr_360px]">

        {/* ── 좌측: 기존 콘텐츠 ────────────────────────────── */}
        <div>
          {/* 상태 태그 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-accent-green/10 border border-accent-green/25 text-accent-green text-xs font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow inline-block" />
              LIVE · AI 에이전트 개발 중
            </div>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-accent-green/20 to-transparent" />
          </div>

          {/* 헤드라인 */}
          <div className="mb-6">
            <p className="text-text-muted text-xs font-mono tracking-[0.3em] uppercase mb-2">
              InfiniTriX Platform
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              <span className="text-text-primary">AI가 매일</span>
              <br />
              <span className="gradient-text">게임을 만든다</span>
            </h1>
          </div>

          {/* 설명 */}
          <p className="text-text-secondary text-sm sm:text-base max-w-md leading-relaxed mb-8">
            기획 → 개발 → 테스트 → 배포 사이클을 에이전트 팀이 자동 반복.
            <br />
            설치 없이 브라우저에서 바로 플레이.
          </p>

          {/* 스탯 */}
          <div className="flex items-stretch gap-0 w-fit border border-border-dim rounded-sm overflow-hidden">
            <StatBlock value={totalGames} label="Games"   accent="text-accent-cyan" />
            <div className="w-px bg-border-dim" />
            <StatBlock value="Free"       label="Always"  accent="text-accent-green" />
            <div className="w-px bg-border-dim" />
            <StatBlock value="0"          label="Install" accent="text-accent-purple" />
          </div>
        </div>

        {/* ── 우측: 미니 에이전트 로그 (lg+ 에서만 표시) ────── */}
        {rightSlot && (
          <div className="hidden lg:block mt-1">
            {rightSlot}
          </div>
        )}
      </div>

      {/* ── 모바일: 미니 로그를 하단에 (md 이하에서만 표시) ── */}
      {rightSlot && (
        <div className="lg:hidden mt-8">
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
