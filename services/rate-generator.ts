import type { GenerationResult, GeneratedRate, RateGenerationConfig } from '@/types/rate-generation'
import { RateRepository } from './rate-repository'
import { TariffFetcher } from './tariff-fetcher'
import { ZoneRateProcessor } from './zone-rate-processor'

export class RateGeneratorService {
  private readonly config: RateGenerationConfig = {
    MAX_PARCEL_WEIGHT: 2.00,
    MAX_TOTAL_WEIGHT: 8.00,
    MAX_PARCELS: 4
  }
  
  private readonly repository: RateRepository
  private readonly tariffFetcher: TariffFetcher
  private readonly processor: ZoneRateProcessor

  constructor() {
    this.repository = new RateRepository()
    this.tariffFetcher = new TariffFetcher()
    this.processor = new ZoneRateProcessor(this.config)
  }

  async connect(): Promise<void> {
    await this.repository.connect()
    await this.tariffFetcher.connect()
  }

  async disconnect(): Promise<void> {
    await this.repository.disconnect()
    await this.tariffFetcher.disconnect()
  }

  async generateRates(): Promise<GenerationResult> {
    const errors: string[] = []
    
    try {
      const zoneTariffs = await this.tariffFetcher.fetchZoneTariffs()
      const carrierInfo = await this.tariffFetcher.fetchCarrierInfo()
      
      if (zoneTariffs.size === 0) {
        return {
          success: false,
          zones_processed: 0,
          rates_generated: 0,
          errors: ['No zone tariffs found in database']
        }
      }
      
      const allRates: GeneratedRate[] = []
      let zonesProcessed = 0
      
      for (const [zoneId, tariffs] of zoneTariffs) {
        try {
          const zoneRates = this.processor.generateRatesForZone(tariffs, carrierInfo)
          allRates.push(...zoneRates)
          zonesProcessed++
        } catch (error) {
          errors.push(`Zone ${zoneId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      if (allRates.length > 0) {
        await this.repository.storeGeneratedRates(allRates)
      }
      
      return {
        success: errors.length === 0,
        zones_processed: zonesProcessed,
        rates_generated: allRates.length,
        errors: errors.length > 0 ? errors : undefined
      }
      
    } catch (error) {
      return {
        success: false,
        zones_processed: 0,
        rates_generated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      }
    }
  }
}
