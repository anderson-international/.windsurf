import { GeneratedRate } from '../types/rate-generation'

export interface ShopifyZone {
  readonly id: string
  readonly name: string
}

export interface DatabaseZone {
  readonly zone_name: string
  readonly rate_count: number
}

export interface ZoneMatch {
  readonly shopify_zone: ShopifyZone
  readonly database_zone: DatabaseZone
  readonly generated_rates: GeneratedRate[]
}

export interface ZoneMatchingResult {
  readonly matches: ZoneMatch[]
  readonly shopify_only_zones: ShopifyZone[]
  readonly database_only_zones: DatabaseZone[]
  readonly total_rates_to_deploy: number
}
