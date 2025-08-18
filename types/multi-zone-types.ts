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
  duration_ms?: number
  
  preview?: {
    rates: Array<{
      title: string
      price: number
      weightMin: number
      weightMax: number
    }>
    graphql?: {
      mutation: string
      variables: unknown
      ratesCount: number
    }
  }
}

export interface OrchestrationResult {
  total_zones_processed: number
  successful_deployments: number
  failed_deployments: number
  results: ZoneProcessingResult[]
  systematic_error?: {
    systematic_issue_detected: boolean
    failed_zone: string
    error_details?: string
    diagnostic_message: string
    total_zones_available: number
    recommendation: string
  }
}
