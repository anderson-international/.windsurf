import type { ZoneTariff, CarrierInfo } from '../types/rate-generation'
import { DatabaseClient } from './database-client'
import { UniversalTariffService } from './universal-tariff-service'
import { CarrierServiceInfoService } from './carrier-service-info-service'

export class TariffFetcher {
  private readonly db: DatabaseClient
  private readonly universalTariffService: UniversalTariffService
  private readonly carrierServiceInfoService: CarrierServiceInfoService

  constructor() {
    this.db = new DatabaseClient()
    this.universalTariffService = new UniversalTariffService()
    this.carrierServiceInfoService = new CarrierServiceInfoService()
  }

  async connect(): Promise<void> {
    await this.db.connect()
    await this.universalTariffService.connect()
    await this.carrierServiceInfoService.connect()
  }

  async disconnect(): Promise<void> {
    await this.db.disconnect()
    await this.universalTariffService.disconnect()
    await this.carrierServiceInfoService.disconnect()
  }

  async fetchZoneTariffs(carrierServiceId: number): Promise<Map<string, ZoneTariff[]>> {
    const prisma = this.db.getClient()
    

    const carrierService = await prisma.carrier_services.findFirst({
      where: { id: carrierServiceId },
      select: { zone_scope: true }
    })
    
    if (!carrierService) {
      throw new Error(`Carrier service with ID ${carrierServiceId} not found in database`)
    }
    
    const tariffsByZone = new Map<string, ZoneTariff[]>()
    
    if (carrierService.zone_scope === 'ZONE_SPECIFIC') {

      const tariffs = await prisma.zone_tariffs.findMany({
        where: { carrier_service_id: carrierServiceId },
        orderBy: [{ zone_name: 'asc' }, { weight_kg: 'asc' }]
      })
      
      tariffs.forEach(row => {
        const tariff: ZoneTariff = {
          zone_name: row.zone_name,
          weight_kg: Number(row.weight_kg),
          tariff_amount: Number(row.tariff_amount),
          carrier_id: row.carrier_service_id
        }
        
        if (!tariffsByZone.has(tariff.zone_name)) {
          tariffsByZone.set(tariff.zone_name, [])
        }
        
        tariffsByZone.get(tariff.zone_name)!.push(tariff)
      })
    } else {
      const universalTariffs = await this.universalTariffService.replicateUniversalTariffsAcrossZones(carrierServiceId)
      universalTariffs.forEach((tariffs, zoneId) => {
        tariffsByZone.set(zoneId, tariffs)
      })
    }
    
    return tariffsByZone
  }

  async fetchCarrierServiceInfo(carrierServiceId: number): Promise<CarrierInfo> {
    return await this.carrierServiceInfoService.fetchCarrierServiceInfo(carrierServiceId)
  }
}
