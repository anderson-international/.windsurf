import { ZoneProcessingResult } from '../types/multi-zone-types'

export interface ProgressSnapshot {
  started: boolean
  start_time?: string
  last_update?: string
  total_zones: number
  completed: Array<{
    zone_name: string
    zone_id: string
    success: boolean
    duration_ms?: number
    rates_deployed?: number
    error?: string
    preview?: ZoneProcessingResult['preview']
  }>
  done: boolean
  aborted?: boolean
  abort_reason?: string
}

const initialSnapshot: ProgressSnapshot = {
  started: false,
  start_time: undefined,
  last_update: undefined,
  total_zones: 0,
  completed: [],
  done: false
}

type GlobalWithProgress = typeof globalThis & {
  __SHOPIFY_RATES_PROGRESS__?: ProgressSnapshot
}

const g = globalThis as GlobalWithProgress

function ensureSnapshot(): ProgressSnapshot {
  if (!g.__SHOPIFY_RATES_PROGRESS__) {
    g.__SHOPIFY_RATES_PROGRESS__ = { ...initialSnapshot }
  }
  return g.__SHOPIFY_RATES_PROGRESS__
}

function nowIso() {
  return new Date().toISOString()
}

function markStart(total: number) {
  g.__SHOPIFY_RATES_PROGRESS__ = {
    started: true,
    start_time: nowIso(),
    last_update: nowIso(),
    total_zones: total,
    completed: [],
    done: false
  }
}

function reportZone(result: ZoneProcessingResult) {
  const s = ensureSnapshot()
  s.completed.push({
    zone_name: result.zone_name,
    zone_id: result.zone_id,
    success: result.success,
    duration_ms: result.duration_ms,
    rates_deployed: result.rates_deployed,
    error: result.error,
    preview: result.preview
  })
  s.last_update = nowIso()
}

function markDone() {
  const s = ensureSnapshot()
  s.done = true
  s.last_update = nowIso()
}

function markAborted(reason: string) {
  const s = ensureSnapshot()
  s.aborted = true
  s.abort_reason = reason
  s.done = true
  s.last_update = nowIso()
}

function reset() {
  g.__SHOPIFY_RATES_PROGRESS__ = { ...initialSnapshot }
}

function getSnapshot(): ProgressSnapshot {
  // Return a deep copy to avoid accidental mutation by callers
  const s = ensureSnapshot()
  return JSON.parse(JSON.stringify(s))
}

export const ProgressReporter = {
  markStart,
  reportZone,
  markDone,
  markAborted,
  reset,
  getSnapshot
}
