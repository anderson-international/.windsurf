export interface ShopifyZone {
  id: string
  name: string
}

export interface ZoneProcessingResult {
  zone_name: string
  zone_id: string
  success: boolean
  rates_deployed: number
  total_rates_generated: number
  message: string
  error?: string
}

export interface OrchestrationResult {
  total_zones_processed: number
  successful_deployments: number
  failed_deployments: number
  results: ZoneProcessingResult[]
}
