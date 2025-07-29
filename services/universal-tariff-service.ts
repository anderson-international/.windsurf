import type { ZoneTariff } from '../types/rate-generation'
import { DatabaseClient } from './database-client'

export class UniversalTariffService {
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

  async replicateUniversalTariffsAcrossZones(carrierServiceId: number): Promise<Map<string, ZoneTariff[]>> {
    const prisma = this.db.getClient()
    const tariffsByZone = new Map<string, ZoneTariff[]>()

    const universalTariffs = await prisma.universal_tariffs.findMany({
      where: { carrier_service_id: carrierServiceId },
      orderBy: { weight_kg: 'asc' }
    })

    if (universalTariffs.length === 0) {
      return tariffsByZone
    }

    const allZones = await prisma.zone_tariffs.findMany({
      select: { zone_name: true },
      distinct: ['zone_name']
    })

    const uniqueZoneNames = allZones.map(zone => zone.zone_name)

    universalTariffs.forEach(row => {
      uniqueZoneNames.forEach(zoneName => {
        const tariff: ZoneTariff = {
          zone_name: zoneName,
          weight_kg: Number(row.weight_kg),
          tariff_amount: Number(row.tariff_amount),
          carrier_id: row.carrier_service_id
        }

        if (!tariffsByZone.has(tariff.zone_name)) {
          tariffsByZone.set(tariff.zone_name, [])
        }

        tariffsByZone.get(tariff.zone_name)!.push(tariff)
      })
    })

    return tariffsByZone
  }
}
