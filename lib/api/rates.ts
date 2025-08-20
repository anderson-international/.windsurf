export type ProgressSnapshot = {
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
    preview?: {
      rates: Array<{ title: string; price: number; weightMin: number; weightMax: number }>
      graphql?: { mutation: string; variables: unknown; ratesCount: number }
    }
  }>
  done: boolean
  aborted?: boolean
  abort_reason?: string
}

export type DeployAllZonesResponse = {
  success: boolean
  total_zones_processed: number
  successful_deployments: number
  failed_deployments: number
  results: Array<{
    zone_name: string
    zone_id: string
    success: boolean
    rates_deployed: number
    total_rates_generated: number
    message: string
    error?: string
    duration_ms?: number
  }>
  timestamp: string
  error?: string
}

export type TargetsResponse = {
  currentTarget: string
  targets: Array<{ key: string; storeUrl: string }>
}

export async function postDeployAllZones(dryRun: boolean, target?: string): Promise<DeployAllZonesResponse> {
  const res = await fetch('/api/rates/deploy-all-zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dry_run: dryRun, target })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

export async function getProgressSnapshot(signal?: AbortSignal): Promise<ProgressSnapshot> {
  const res = await fetch('/api/rates/progress', { signal })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

export async function getTargets(): Promise<TargetsResponse> {
  const res = await fetch('/api/rates/targets')
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

export async function postAbort(reason?: string): Promise<{ ok: boolean }> {
  const res = await fetch('/api/rates/abort', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}
