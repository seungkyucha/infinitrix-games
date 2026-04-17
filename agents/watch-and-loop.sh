#!/usr/bin/env bash
# InfiniTriX 사이클 자동 연속 실행 감시 스크립트
# 현재 진행 중인 사이클이 끝나면 무한 사이클 모드로 자동 전환

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATUS_FILE="$PROJECT_ROOT/logs/agent-status.json"
COUNTER_FILE="$PROJECT_ROOT/logs/cycle-counter.json"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

show_status() {
  if [ -f "$STATUS_FILE" ]; then
    python3 -c "
import json, sys
try:
  d = json.load(open('$STATUS_FILE'))
  step = d.get('currentStep', 0)
  total = d.get('totalSteps', 7)
  name = d.get('stepName', '')
  status = d.get('cycleStatus', '')
  cycle = d.get('cycleNumber', '?')
  bar = '█' * step + '░' * (total - step)
  print(f'  사이클 #{cycle} [{status}] {bar} {step}/{total} — {name}')
  for k, v in d.get('agents', {}).items():
    s = v.get('status', '')
    if s not in ('idle', ''):
      logs = v.get('logs', [])
      last = logs[-1] if logs else ''
      sym = '✅' if s == 'completed' else ('⚙️ ' if s == 'running' else '💤')
      print(f'    {sym} {k:12s} {last[:60]}')
except Exception as e:
  print(f'  (상태 읽기 실패: {e})')
" 2>/dev/null
  fi
}

get_cycle_status() {
  if [ -f "$STATUS_FILE" ]; then
    python3 -c "
import json
try:
  d = json.load(open('$STATUS_FILE'))
  print(d.get('cycleStatus', 'unknown'))
except:
  print('unknown')
" 2>/dev/null
  else
    echo "unknown"
  fi
}

log "🔍 InfiniTriX 사이클 모니터링 시작"
log "   현재 싸이클 진행 중 — 완료 시 무한 모드로 자동 전환"
echo ""

# 현재 사이클이 끝날 때까지 대기
LAST_STEP=0
while true; do
  STATUS=$(get_cycle_status)

  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ]; then
    echo ""
    log "✅ 현재 사이클 종료 (${STATUS})"
    break
  fi

  # 30초마다 상태 출력
  CURRENT_STEP=$(python3 -c "
import json
try:
  d = json.load(open('$STATUS_FILE'))
  print(d.get('currentStep', 0))
except:
  print(0)
" 2>/dev/null)

  if [ "$CURRENT_STEP" != "$LAST_STEP" ]; then
    echo ""
    show_status
    LAST_STEP="$CURRENT_STEP"
  fi

  sleep 30
done

# 무한 사이클 모드 시작
echo ""
log "🚀 무한 사이클 모드 시작 (30분 간격 자동 반복)"
log "   중단하려면 Ctrl+C"
echo ""

cd "$PROJECT_ROOT/agents" && npm run start
