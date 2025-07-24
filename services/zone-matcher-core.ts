import { GeneratedRate } from '../types/rate-generation'
import { ShopifyConfig } from './shopify-config'
import { ShopifyZone, DatabaseZone, ZoneMatch, ZoneMatchingResult } from './zone-matcher-types'
import { ZoneMatcherGraphQL } from './zone-matcher-graphql'

export class ZoneMatcher {
  private readonly graphqlService: ZoneMatcherGraphQL

  constructor(config: ShopifyConfig) {
    this.graphqlService = new ZoneMatcherGraphQL(config)
  }

  async fetchShopifyZones(): Promise<ShopifyZone[]> {
    return this.graphqlService.fetchShopifyZones()
  }

  extractDatabaseZones(rates: GeneratedRate[]): DatabaseZone[] {
    const zoneMap = new Map<string, DatabaseZone>()

    rates.forEach(rate => {
      const existing = zoneMap.get(rate.zone_id)
      if (existing) {
        zoneMap.set(rate.zone_id, {
          ...existing,
          rate_count: existing.rate_count + 1
        })
      } else {
        zoneMap.set(rate.zone_id, {
          zone_id: rate.zone_id,
          zone_name: rate.zone_name,
          rate_count: 1
        })
      }
    })

    return Array.from(zoneMap.values())
  }

  matchZones(shopifyZones: ShopifyZone[], databaseZones: DatabaseZone[], generatedRates: GeneratedRate[]): ZoneMatchingResult {
    const matches: ZoneMatch[] = []
    const shopifyOnlyZones: ShopifyZone[] = []
    const databaseOnlyZones: DatabaseZone[] = []

    const shopifyByName = new Map(shopifyZones.map(zone => [zone.name, zone]))
    const databaseByName = new Map(databaseZones.map(zone => [zone.zone_name, zone]))

    for (const dbZone of databaseZones) {
      const shopifyZone = shopifyByName.get(dbZone.zone_name)
      
      if (shopifyZone) {
        const zoneRates = generatedRates.filter(rate => rate.zone_id === dbZone.zone_id)
        
        matches.push({
          shopify_zone: shopifyZone,
          database_zone: dbZone,
          generated_rates: zoneRates
        })
      } else {
        databaseOnlyZones.push(dbZone)
      }
    }

    for (const shopifyZone of shopifyZones) {
      if (!databaseByName.has(shopifyZone.name)) {
        shopifyOnlyZones.push(shopifyZone)
      }
    }

    const totalRatesToDeploy = matches.reduce((sum, match) => sum + match.generated_rates.length, 0)

    return {
      matches,
      shopify_only_zones: shopifyOnlyZones,
      database_only_zones: databaseOnlyZones,
      total_rates_to_deploy: totalRatesToDeploy
    }
  }
}
