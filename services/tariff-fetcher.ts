import type { ZoneTariff, CarrierInfo } from '@/types/rate-generation'
import { DatabaseClient } from './database-client'

export class TariffFetcher {
  private readonly db: DatabaseClient

  constructor() {
    this.db = new DatabaseClient()
  }

  async connect(): Promise<void> {
    await this.db.connect()
  }

  async disconnect(): Promise<void> {
    await this.db.disconnect()
  }

  async fetchZoneTariffs(carrierId: number): Promise<Map<string, ZoneTariff[]>> {
    const prisma = this.db.getClient()
    const tariffs = await prisma.zone_tariffs.findMany({
      where: {
        carrier_id: carrierId
      },
      orderBy: [{ zone_name: 'asc' }, { weight_kg: 'asc' }]
    })
    
    const tariffsByZone = new Map<string, ZoneTariff[]>()
    
    tariffs.forEach(row => {
      const tariff: ZoneTariff = {
        zone_id: row.zone_name,
        zone_name: row.zone_name,
        weight_kg: Number(row.weight_kg),
        tariff_amount: Number(row.tariff_amount)
      }
      
      if (!tariffsByZone.has(tariff.zone_id)) {
        tariffsByZone.set(tariff.zone_id, [])
      }
      
      tariffsByZone.get(tariff.zone_id)!.push(tariff)
    })
    
    return tariffsByZone
  }

  async fetchCarrierInfo(carrierId: number): Promise<CarrierInfo> {
    const prisma = this.db.getClient()
    const carrier = await prisma.carriers.findFirst({ 
      where: { id: carrierId },
      select: { name: true, rate_title: true, delivery_description: true, margin_percentage: true }
    })
    
    if (!carrier) {
      throw new Error(`Carrier with ID ${carrierId} not found in database`)
    }
    
    if (carrier.margin_percentage === null || carrier.margin_percentage === undefined) {
      throw new Error(`Carrier '${carrier.name}' has missing margin_percentage - cannot calculate rates without margin data`)
    }

    return {
      name: carrier.name,
      rate_title: carrier.rate_title,
      delivery_description: carrier.delivery_description,
      margin_percentage: Number(carrier.margin_percentage)
    }
  }
}
