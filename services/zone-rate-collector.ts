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

    // Group zone-specific tariffs by carrier ID
    const zoneTariffs = await this.tariffService.fetchZoneSpecificTariffs(zoneName)
    const zoneTariffsByCarrier = new Map<number, BaseTariff[]>()
    
    for (const zoneTariff of zoneTariffs) {
      if (!zoneTariffsByCarrier.has(zoneTariff.carrier_id)) {
        zoneTariffsByCarrier.set(zoneTariff.carrier_id, [])
      }
      zoneTariffsByCarrier.get(zoneTariff.carrier_id)!.push(zoneTariff)
    }
    
    // Process each carrier with ALL its zone-specific tariffs
    for (const [carrierId, carrierTariffs] of zoneTariffsByCarrier) {
      const carrierRates = await this.generateRatesForCarrier(
        carrierTariffs,  // Pass ALL tariffs for this carrier
        carrierId, 
        zoneName
      )
      allRates.push(...carrierRates)
      processedCarrierIds.add(carrierId)
    }

    // Group universal tariffs by carrier ID
    const universalTariffs = await this.tariffService.fetchUniversalTariffs()
    const universalTariffsByCarrier = new Map<number, BaseTariff[]>()
    
    for (const universalTariff of universalTariffs) {
      if (!processedCarrierIds.has(universalTariff.carrier_id)) {
        if (!universalTariffsByCarrier.has(universalTariff.carrier_id)) {
          universalTariffsByCarrier.set(universalTariff.carrier_id, [])
        }
        universalTariffsByCarrier.get(universalTariff.carrier_id)!.push(universalTariff)
      }
    }
    
    // Process each carrier with ALL its universal tariffs
    for (const [carrierId, carrierTariffs] of universalTariffsByCarrier) {
      const carrierRates = await this.generateRatesForCarrier(
        carrierTariffs,  // Pass ALL tariffs for this carrier
        carrierId, 
        zoneName
      )
      allRates.push(...carrierRates)
      processedCarrierIds.add(carrierId)
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
