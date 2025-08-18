import { ShopifyZoneFetcher } from './shopify-zone-fetcher'
import { ZoneProcessor } from './zone-processor'
import { ShopifyConfig } from './shopify-config'
import { resolveShopifyTarget } from './shopify-target-resolver'
import { ShopifyZone, ZoneProcessingResult, OrchestrationResult } from '../types/multi-zone-types'
import { ProgressReporter } from './progress-reporter'

export class MultiZoneOrchestrator {
  private readonly shopifyConfig: ShopifyConfig
  private readonly zoneProcessor: ZoneProcessor

  constructor() {
    const resolved = resolveShopifyTarget()
    this.shopifyConfig = resolved.config
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    this.zoneProcessor = new ZoneProcessor(baseUrl)
    console.log(`🎯 Target: ${resolved.target} — ${this.shopifyConfig.storeUrl}`)
  }

  async orchestrateAllZones(dryRun: boolean = false): Promise<OrchestrationResult> {
    try {
      const zones = await this.fetchShopifyZones()
      
      if (zones.length === 0) {
        return {
          total_zones_processed: 0,
          successful_deployments: 0,
          failed_deployments: 0,
          results: []
        }
      }

      ProgressReporter.markStart(zones.length)
      console.log(`📋 Processing ${zones.length} zones with fail-fast on first error...`)
      console.log(`📦 Zone contexts will be fetched once and cached automatically`)
      
      // Process zones one by one with fail-fast on any error
      const results: ZoneProcessingResult[] = []
      
      for (const zone of zones) {
        console.log(`🔍 Processing zone: ${zone.name}`)
        const _start = Date.now()
        const result = await this.zoneProcessor.processZone(zone, dryRun)
        const _end = Date.now()
        // attach duration with minimal mutation
        result.duration_ms = _end - _start
        results.push(result)
        // publish progress snapshot for polling client
        ProgressReporter.reportZone(result)
        
        if (!result.success) {
          // Fail fast on first error
          const detailedError = {
            systematic_issue_detected: true,
            failed_zone: result.zone_name,
            error_details: result.error,
            diagnostic_message: result.message,
            zones_processed: results.length,
            total_zones_available: zones.length,
            recommendation: 'Fix the underlying issue before processing remaining zones'
          }
          
          console.error(`❌ Error detected in zone '${zone.name}' - stopping processing`)
          console.error('Error details:', JSON.stringify(detailedError, null, 2))
          
          ProgressReporter.markDone()
          return {
            total_zones_processed: results.length,
            successful_deployments: results.filter(r => r.success).length,
            failed_deployments: results.filter(r => !r.success).length,
            results,
            systematic_error: detailedError
          }
        }
        
        console.log(`✅ Zone '${zone.name}' processed successfully`)
      }
      const compiled = this.compileResults(results)
      ProgressReporter.markDone()
      return compiled

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      // ensure we flip done for clients
      try { ProgressReporter.markDone() } catch {}
      throw new Error(`Multi-zone orchestration failed: ${errorMessage}`)
    }
  }

  private async fetchShopifyZones(): Promise<ShopifyZone[]> {
    const zoneFetcher = new ShopifyZoneFetcher(this.shopifyConfig)
    return await zoneFetcher.fetchAllZones()
  }

  private compileResults(results: ZoneProcessingResult[]): OrchestrationResult {
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return {
      total_zones_processed: results.length,
      successful_deployments: successful,
      failed_deployments: failed,
      results
    }
  }
}
