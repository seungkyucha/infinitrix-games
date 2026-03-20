import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '소개 — InfiniTriX',
  description: 'AI 에이전트 팀이 자동으로 게임을 개발하는 HTML5 게임 플랫폼',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-10 text-sm"
      >
        ← 게임 목록으로
      </Link>

      {/* 헤더 */}
      <div className="mb-10">
        <p className="text-text-muted text-xs font-mono tracking-[0.3em] uppercase mb-3">About</p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          <span className="gradient-text">InfiniTriX</span>란?
        </h1>
        <p className="text-text-secondary text-base leading-relaxed">
          AI 에이전트 팀이 기획 → 개발 → 테스트 → 배포 사이클을 자동 반복하며
          HTML5 게임을 끊임없이 추가하는 플랫폼입니다.
        </p>
      </div>

      {/* 개발 사이클 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-3">
          <span className="w-6 h-px bg-accent-purple inline-block" />
          자동 개발 사이클
        </h2>
        <div className="space-y-3">
          {CYCLE_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-bg-card border border-border-dim rounded-lg">
              <div className="w-8 h-8 rounded-sm bg-bg-secondary border border-border-dim flex items-center justify-center text-xs font-mono text-text-muted flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-text-primary">{step.title}</span>
                  <span className="text-xs text-text-muted font-mono">{step.agent}</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 기술 스택 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-3">
          <span className="w-6 h-px bg-accent-cyan inline-block" />
          기술 스택
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {TECH_STACK.map(tech => (
            <div key={tech.name} className="p-4 bg-bg-card border border-border-dim rounded-lg">
              <div className="text-xs font-mono text-text-muted mb-1">{tech.category}</div>
              <div className="text-sm font-semibold text-text-primary">{tech.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 링크 */}
      <div className="flex flex-wrap gap-3">
        <a
          href="https://github.com/seungkyucha/infinitrix-games"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border-dim rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent-purple/40 transition-all"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub 레포지토리
        </a>
        <Link
          href="/dev-log"
          className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border-dim rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent-purple/40 transition-all"
        >
          📓 제작 일지
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border-dim rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent-cyan/40 transition-all"
        >
          🎮 게임 플레이하기
        </Link>
      </div>
    </div>
  )
}

const CYCLE_STEPS = [
  { title: '트렌드 분석',   agent: 'analyst',    desc: '플랫폼 현황과 HTML5 게임 트렌드를 분석해 다음 게임의 방향성을 결정합니다.' },
  { title: '게임 기획',     agent: 'planner',    desc: '분석 결과를 바탕으로 게임 규칙·조작법·시각 스타일을 담은 상세 기획서(GDD)를 작성합니다.' },
  { title: '그래픽 에셋',   agent: 'designer',   desc: '기획서 사양에 맞는 캐릭터·배경·UI·썸네일 SVG 에셋 전체를 제작합니다.' },
  { title: '게임 코딩',     agent: 'coder',      desc: '에셋과 기획서를 바탕으로 index.html 단일 파일 HTML5 게임을 구현합니다.' },
  { title: '리뷰 + 테스트', agent: 'reviewer',   desc: '코드 품질 검토와 Puppeteer 헤드리스 브라우저 자동 테스트로 게임 동작을 검증합니다.' },
  { title: '포스트모템',    agent: 'postmortem', desc: '사이클 전반을 회고하고 개선점을 정리해 플랫폼 누적 지혜(platform-wisdom)에 반영합니다.' },
  { title: '배포',          agent: 'deployer',   desc: '게임 레지스트리에 등록 후 GitHub push → Vercel 자동 배포를 트리거합니다.' },
]

const TECH_STACK = [
  { category: 'Platform',  name: 'Next.js 14 (App Router)' },
  { category: 'Language',  name: 'TypeScript' },
  { category: 'Styling',   name: 'Tailwind CSS' },
  { category: 'Deploy',    name: 'Vercel (auto-deploy)' },
  { category: 'AI Agents', name: 'Claude Agent SDK' },
  { category: 'Games',     name: 'HTML5 / Canvas API' },
]
