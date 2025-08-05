import { ShopifyZone, ZoneProcessingResult } from '../types/multi-zone-types'

export class ZoneProcessor {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async processZone(zone: ShopifyZone, dryRun: boolean = false): Promise<ZoneProcessingResult> {
    try {
      const result = await this.callZoneGenerationEndpoint(zone.name, zone.id, dryRun)
      
      if (dryRun) {
        console.log(`⏳ Dry-run rate limiting: waiting 2000ms after processing ${zone.name}...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        zone_name: zone.name,
        zone_id: zone.id,
        success: false,
        rates_deployed: 0,
        total_rates_generated: 0,
        message: 'Zone processing failed',
        error: errorMessage
      }
    }
  }

  async processAllZones(zones: ShopifyZone[], dryRun: boolean = false): Promise<ZoneProcessingResult[]> {
    const results: ZoneProcessingResult[] = []
    const DRY_RUN_DELAY_MS = 2000

    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i]
      
      try {
        const result = await this.callZoneGenerationEndpoint(zone.name, zone.id, dryRun)
        results.push(result)
        
        if (dryRun && i < zones.length - 1) {
          console.log(`⏳ Dry-run rate limiting: waiting ${DRY_RUN_DELAY_MS}ms before next zone...`)
          await new Promise(resolve => setTimeout(resolve, DRY_RUN_DELAY_MS))
        }
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
    zoneId: string,
    dryRun: boolean = false
  ): Promise<ZoneProcessingResult> {
    const response = await fetch(
      `${this.baseUrl}/api/rates/generate/${encodeURIComponent(zoneName)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dry_run: dryRun })
      }
    )

    if (!response.ok) {
      // Try to get detailed error information from response body
      let errorDetails = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorDetails = errorData.error
        }
        if (errorData.error_details) {
          errorDetails += ` | Details: ${JSON.stringify(errorData.error_details, null, 2)}`
        }
      } catch (jsonError) {
        // If JSON parsing fails, stick with basic error
        console.warn('Failed to parse error response:', jsonError)
      }
      
      throw new Error(errorDetails)
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
