import Link from 'next/link'
import { getTranslations } from '@/lib/i18n'

export async function generateMetadata() {
  const { t } = await getTranslations()
  return { title: `${t.nav.about} — InfiniTriX`, description: t.about.desc }
}

export default async function AboutPage() {
  const { t } = await getTranslations()
  const steps = [
    { ...t.about.steps.analysis,   agent: 'analyst'    },
    { ...t.about.steps.planning,   agent: 'planner'    },
    { ...t.about.steps.design,     agent: 'designer'   },
    { ...t.about.steps.coding,     agent: 'coder'      },
    { ...t.about.steps.review,     agent: 'reviewer'   },
    { ...t.about.steps.postmortem, agent: 'postmortem' },
    { ...t.about.steps.deploy,     agent: 'deployer'   },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-10 text-sm">
        {t.about.backToList}
      </Link>

      <div className="mb-10">
        <p className="text-text-muted text-xs font-mono tracking-[0.3em] uppercase mb-3">About</p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          <span className="gradient-text">{t.about.whatIs}</span>
        </h1>
        <p className="text-text-secondary text-base leading-relaxed">{t.about.desc}</p>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-3">
          <span className="w-6 h-px bg-accent-purple inline-block" />
          {t.about.cycle}
        </h2>
        <div className="space-y-3">
          {steps.map((step, i) => (
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

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-3">
          <span className="w-6 h-px bg-accent-cyan inline-block" />
          {t.about.techStack}
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

      <div className="flex flex-wrap gap-3">
        <a href="https://github.com/seungkyucha/infinitrix-games" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border-dim rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent-purple/40 transition-all">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          {t.about.github}
        </a>
        <Link href="/dev-log" className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border-dim rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent-purple/40 transition-all">
          📓 {t.about.devlog}
        </Link>
        <Link href="/" className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border-dim rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent-cyan/40 transition-all">
          🎮 {t.about.playGames}
        </Link>
      </div>
    </div>
  )
}

const TECH_STACK = [
  { category: 'Platform',  name: 'Next.js 14 (App Router)' },
  { category: 'Language',  name: 'TypeScript' },
  { category: 'Styling',   name: 'Tailwind CSS' },
  { category: 'Deploy',    name: 'Vercel (auto-deploy)' },
  { category: 'AI Agents', name: 'Claude Agent SDK' },
  { category: 'Games',     name: 'HTML5 / Canvas API' },
]
