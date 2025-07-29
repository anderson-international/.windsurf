import { PrismaClient } from '@prisma/client'
import { ZoneRateProcessor } from './zone-rate-processor'
import { TariffCollectionService } from './tariff-collection-service'
import type { 
  BaseTariff, 
  GeneratedRate
} from '../types/rate-generation'

export class ZoneRateCollector {
  private readonly prisma: PrismaClient
  private readonly processor: ZoneRateProcessor
  private readonly tariffService: TariffCollectionService

  constructor() {
    this.prisma = new PrismaClient()
    this.processor = new ZoneRateProcessor()
    this.tariffService = new TariffCollectionService(this.prisma)
  }

  async buildInMemoryRatesCollection(zoneName: string): Promise<GeneratedRate[]> {
    const allRates: GeneratedRate[] = []
    const processedCarrierIds = new Set<number>()

    const zoneTariffs = await this.tariffService.fetchZoneSpecificTariffs(zoneName)
    
    for (const zoneTariff of zoneTariffs) {
      if (!processedCarrierIds.has(zoneTariff.carrier_id)) {
        const carrierRates = await this.generateRatesForCarrier(
          [zoneTariff], 
          zoneTariff.carrier_id, 
          zoneName
        )
        allRates.push(...carrierRates)
        processedCarrierIds.add(zoneTariff.carrier_id)
      }
    }

    const universalTariffs = await this.tariffService.fetchUniversalTariffs()
    
    for (const universalTariff of universalTariffs) {
      if (!processedCarrierIds.has(universalTariff.carrier_id)) {
        const carrierRates = await this.generateRatesForCarrier(
          [universalTariff], 
          universalTariff.carrier_id, 
          zoneName
        )
        allRates.push(...carrierRates)
        processedCarrierIds.add(universalTariff.carrier_id)
      }
    }

    return allRates
  }

  private async generateRatesForCarrier(
    tariffs: BaseTariff[], 
    carrierId: number, 
    zoneName: string
  ): Promise<GeneratedRate[]> {
    const carrierInfo = await this.tariffService.fetchCarrierInfo(carrierId)
    return this.processor.generateRatesForZone(tariffs, carrierInfo, carrierId, zoneName)
  }
}
