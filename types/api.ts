export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string
  meta?: {
    total?: number
    timestamp?: string
    page?: number
    limit?: number
  }
}

export interface ShippingRate {
  id: string
  title: string
  profileName: string
  zoneId: string
  zoneName: string
  currency: string
  price: number
}

export interface ShippingZone {
  id: string
  name: string
  profileName: string
  rateCount: number
}

export interface DeliveryProfile {
  id: string
  name: string
  default: boolean
}

export interface CsvRateRow {
  zone_id: string
  zone_name?: string
  rate_name: string
  price: string
  weight_min?: number
  weight_max?: number
  price_min?: number
  price_max?: number
}

export interface BulkOperationResult {
  success: boolean
  created: number
  updated: number
  deleted: number
  errors: string[]
}
