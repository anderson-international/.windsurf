import { ShopifyZone, ZoneProcessingResult } from '../types/multi-zone-types'

export class ZoneProcessor {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async processAllZones(zones: ShopifyZone[]): Promise<ZoneProcessingResult[]> {
    const results: ZoneProcessingResult[] = []

    for (const zone of zones) {
      try {
        const result = await this.callZoneGenerationEndpoint(zone.name, zone.id)
        results.push(result)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push({
          zone_name: zone.name,
          zone_id: zone.id,
          success: false,
          rates_deployed: 0,
          total_rates_generated: 0,
          message: 'Zone processing failed',
          error: errorMessage
        })
      }
    }

    return results
  }

  private async callZoneGenerationEndpoint(
    zoneName: string, 
    zoneId: string
  ): Promise<ZoneProcessingResult> {
    const response = await fetch(
      `${this.baseUrl}/api/rates/generate/${encodeURIComponent(zoneName)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      zone_name: zoneName,
      zone_id: zoneId,
      success: data.success,
      rates_deployed: data.rates_deployed,
      total_rates_generated: data.total_rates_generated,
      message: data.message,
      error: data.error
    }
  }
}
