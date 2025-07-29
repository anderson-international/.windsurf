import { PrismaClient } from '@prisma/client'
import {
  type BaseTariff,
  type ZoneTariff,
  type CarrierInfo,
  convertPrismaToZoneTariff,
  convertPrismaToBaseTariff
} from '../types/rate-generation'

export class TariffCollectionService {
  private readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async fetchZoneSpecificTariffs(zoneName: string): Promise<ZoneTariff[]> {
    const zoneRecords = await this.prisma.zone_tariffs.findMany({
      where: {
        zone_name: zoneName
      },
      orderBy: {
        weight_kg: 'asc'
      }
    })

    return zoneRecords.map(record => convertPrismaToZoneTariff(record, zoneName))
  }

  async fetchUniversalTariffs(): Promise<BaseTariff[]> {
    const universalRecords = await this.prisma.universal_tariffs.findMany({
      orderBy: {
        weight_kg: 'asc'
      }
    })

    return universalRecords.map(record => convertPrismaToBaseTariff(record))
  }

  async fetchCarrierInfo(carrierId: number): Promise<CarrierInfo> {
    const carrierService = await this.prisma.carrier_services.findUnique({
      where: {
        id: carrierId
      },
      include: {
        carriers: {
          select: {
            name: true
          }
        }
      }
    })

    if (!carrierService) {
      throw new Error(`Carrier service not found: ${carrierId}`)
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
