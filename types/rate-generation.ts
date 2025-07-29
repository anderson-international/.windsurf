export interface BaseTariff {
  readonly weight_kg: number
  readonly tariff_amount: number
  readonly carrier_id: number
}

export interface ZoneTariff extends BaseTariff {
  readonly zone_name: string
}

export interface GeneratedRate {
  weight_min: number
  weight_max: number
  calculated_price: number
  tariff: number
  rate_title: string
  delivery_description: string
  carrier_id: number
}

export interface CarrierInfo {
  readonly carrier_name: string
  readonly service_name: string
  readonly delivery_description: string
  readonly margin_percentage: number
  readonly zone_scope: 'ZONE_SPECIFIC' | 'UNIVERSAL'
  readonly max_parcel_weight: number
  readonly max_total_weight: number
}

export interface WeightRange {
  readonly min: number
  readonly max: number
}

export interface GenerationResult {
  readonly success: boolean
  readonly zones_processed: number
  readonly rates_generated: number
  readonly errors?: string[]
  readonly carrier_id?: number
  readonly carrier_name?: string
}

export interface GenerationStats {
  readonly total_zones: number
  readonly total_rates: number
  readonly generation_time_ms: number
  readonly rates_per_zone: number
}

export function convertPrismaToZoneTariff(prismaData: { weight_kg: number | { toString(): string }; tariff_amount: number | { toString(): string }; carrier_service_id: number }, zoneName: string): ZoneTariff {
  return {
    zone_name: zoneName,
    weight_kg: Number(prismaData.weight_kg),
    tariff_amount: Number(prismaData.tariff_amount),
    carrier_id: prismaData.carrier_service_id
  }
}

export function convertPrismaToBaseTariff(prismaData: { weight_kg: number | { toString(): string }; tariff_amount: number | { toString(): string }; carrier_service_id: number }): BaseTariff {
  return {
    weight_kg: Number(prismaData.weight_kg),
    tariff_amount: Number(prismaData.tariff_amount),
    carrier_id: prismaData.carrier_service_id
  }
}

export interface RateGenerationConfig {
  readonly MAX_PARCEL_WEIGHT: number
  readonly MAX_TOTAL_WEIGHT: number
  readonly MAX_PARCELS: number
}
