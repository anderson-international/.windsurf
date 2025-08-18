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

    // Get deployment exclusions for this zone
    const excludedCarrierIds = await this.getDeploymentExclusions(zoneName)
    // Get carriers explicitly disabled for this zone
    const disabledCarrierIds = await this.getDisabledCarriers(zoneName)
    // Union both lists into a set for fast lookup
    const blockedCarrierIds = new Set<number>([...excludedCarrierIds, ...disabledCarrierIds])

    // Group zone-specific tariffs by carrier ID
    const zoneTariffs = await this.tariffService.fetchZoneSpecificTariffs(zoneName)
    const zoneTariffsByCarrier = new Map<number, BaseTariff[]>()
    
    for (const zoneTariff of zoneTariffs) {
      // Skip if this carrier is excluded or disabled for this zone
      if (blockedCarrierIds.has(zoneTariff.carrier_id)) {
        continue
      }
      
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
        // Skip if this carrier is excluded or disabled for this zone
        if (blockedCarrierIds.has(universalTariff.carrier_id)) {
          continue
        }
        
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

  private async getDeploymentExclusions(zoneName: string): Promise<number[]> {
    // Return carrier_service_ids excluded for this zone
    const exclusions = await this.prisma.carrier_service_deployment_exclusions.findMany({
      where: {
        excluded_zone_name: { equals: zoneName, mode: 'insensitive' }
      },
      select: {
        carrier_service_id: true
      }
    })
    return exclusions.map(e => e.carrier_service_id)
  }

  private async getDisabledCarriers(zoneName: string): Promise<number[]> {
    // Return carrier_service_ids with enabled=false for this zone
    const rows = await this.prisma.carrier_service_zones.findMany({
      where: {
        zone_name: { equals: zoneName, mode: 'insensitive' },
        enabled: false
      },
      select: {
        carrier_service_id: true
      }
    })
    return rows.map(r => r.carrier_service_id)
  }
}
