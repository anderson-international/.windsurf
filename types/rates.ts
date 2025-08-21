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
