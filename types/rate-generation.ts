export interface ZoneTariff {
  readonly zone_id: string
  readonly zone_name: string
  readonly weight_kg: number
  readonly tariff_amount: number
}

export interface GeneratedRate {
  readonly zone_id: string
  readonly zone_name: string
  readonly weight_min: number
  readonly weight_max: number
  readonly tariff: number
  readonly calculated_price: number
  readonly rate_title: string
  readonly delivery_description: string
}

export interface WeightRange {
  readonly min: number
  readonly max: number
}

export interface CarrierInfo {
  readonly name: string
  readonly rate_title: string
  readonly delivery_description: string
  readonly margin_percentage: number
}

export interface GenerationResult {
  readonly success: boolean
  readonly zones_processed: number
  readonly rates_generated: number
  readonly errors?: string[]
}

export interface GenerationStats {
  readonly total_zones: number
  readonly total_rates: number
  readonly generation_time_ms: number
  readonly rates_per_zone: number
}

export interface RateGenerationConfig {
  readonly MAX_PARCEL_WEIGHT: number
  readonly MAX_TOTAL_WEIGHT: number
  readonly MAX_PARCELS: number
}
