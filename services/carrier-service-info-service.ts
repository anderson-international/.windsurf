import type { CarrierInfo } from '../types/rate-generation'
import { DatabaseClient } from './database-client'

export class CarrierServiceInfoService {
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

  async fetchCarrierServiceInfo(carrierServiceId: number): Promise<CarrierInfo> {
    const prisma = this.db.getClient()
    const carrierService = await prisma.carrier_services.findFirst({ 
      where: { id: carrierServiceId },
      include: {
        carriers: {
          select: { name: true }
        }
      }
    })
    
    if (!carrierService) {
      throw new Error(`Carrier service with ID ${carrierServiceId} not found in database`)
    }
    
    if (carrierService.margin_percentage === null || carrierService.margin_percentage === undefined) {
      throw new Error(`Carrier service '${carrierService.carriers.name} ${carrierService.service_name}' has missing margin_percentage - cannot calculate rates without margin data`)
    }
    
    return {
      carrier_name: carrierService.carriers.name,
      service_name: carrierService.service_name,
      delivery_description: carrierService.delivery_description,
      margin_percentage: Number(carrierService.margin_percentage),
      zone_scope: carrierService.zone_scope as 'ZONE_SPECIFIC' | 'UNIVERSAL',
      max_parcel_weight: Number(carrierService.max_parcel_weight),
      max_total_weight: Number(carrierService.max_total_weight)
    }
  }
}
