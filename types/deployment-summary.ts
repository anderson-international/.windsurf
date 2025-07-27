export interface DeploymentSummary {
  success: boolean
  zones_matched: number
  zones_deployed: number
  zones_failed: number
  total_rates_deployed: number
  shopify_only_zones: string[]
  database_only_zones: string[]
  failed_zones: string[]
  errors: string[]
}
