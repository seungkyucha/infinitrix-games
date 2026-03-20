interface Props {
  totalGames: number
}

export default function HeroSection({ totalGames }: Props) {
  return (
    <section className="text-center py-14 mb-10">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-xs font-medium mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow inline-block" />
        AI 에이전트가 지금도 새 게임을 개발 중
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
        <span className="gradient-text">무한 성장</span>하는{' '}
        <br className="sm:hidden" />
        HTML5 게임 플랫폼
      </h1>

      <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
        AI 에이전트 팀이 기획·개발·테스트·배포 사이클을 자동 반복하여
        <br className="hidden sm:block" />
        게임이 끊임없이 추가됩니다. 브라우저에서 바로 플레이!
      </p>

      <div className="flex items-center justify-center gap-8 text-sm">
        <Stat value={totalGames} label="개 게임" color="text-accent-cyan" />
        <div className="w-px h-8 bg-border-dim" />
        <Stat value="100" label="% 무료" color="text-accent-green" />
        <div className="w-px h-8 bg-border-dim" />
        <Stat value="0" label="설치 불필요" color="text-accent-purple" />
      </div>
    </section>
  )
}

function Stat({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-text-muted text-xs mt-0.5">{label}</div>
    </div>
  )
}
