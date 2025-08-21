import type { ProgressSnapshot, DeployAllZonesResponse, TargetsResponse } from '../../types/rates'
export type { ProgressSnapshot, DeployAllZonesResponse, TargetsResponse } from '../../types/rates'

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
