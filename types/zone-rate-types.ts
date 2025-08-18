export interface ZoneRateResponse {
  success: boolean
  zone_name: string
  rates_deployed: number
  total_rates_generated: number
  message: string
  error?: string
  
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
