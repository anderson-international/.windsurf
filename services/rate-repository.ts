import type { GeneratedRate } from '@/types/rate-generation'
import { DatabaseClient } from './database-client'

export class RateRepository {
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

  async storeGeneratedRates(rates: GeneratedRate[]): Promise<void> {
    const prisma = this.db.getClient()
    
    await prisma.generated_rates.deleteMany()
    
    const batchSize = 100
    
    for (let i = 0; i < rates.length; i += batchSize) {
      const batch = rates.slice(i, i + batchSize)
      
      await prisma.generated_rates.createMany({
        data: batch.map(rate => ({
          zone_id: rate.zone_id,
          zone_name: rate.zone_name,
          weight_min: rate.weight_min,
          weight_max: rate.weight_max,
          calculated_price: rate.calculated_price,
          rate_title: rate.rate_title,
          delivery_description: rate.delivery_description
        }))
      })
    }
  }
}
