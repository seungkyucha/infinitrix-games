import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

const STATUS_FILE = join(process.cwd(), 'logs', 'agent-status.json')

const BLANK_AGENT = { status: 'idle', currentAction: '', startedAt: null, completedAt: null, toolCalls: 0, logs: [] }

const IDLE_STATE = {
  lastUpdated: new Date().toISOString(),
  cycleNumber: 0,
  cycleStatus: 'idle',
  currentStep: 0,
  totalSteps:  6,
  stepName:    '',
  gameTitle:   '',
  gameId:      '',
  gameGenre:   [],
  agents: {
    analyst:    BLANK_AGENT,
    planner:    BLANK_AGENT,
    coder:      BLANK_AGENT,
    reviewer:   BLANK_AGENT,
    postmortem: BLANK_AGENT,
    deployer:   BLANK_AGENT,
  },
  recentLogs: [],
}

export async function GET() {
  try {
    if (!existsSync(STATUS_FILE)) {
      return NextResponse.json(IDLE_STATE)
    }
    const data = JSON.parse(readFileSync(STATUS_FILE, 'utf-8'))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(IDLE_STATE)
  }
}
