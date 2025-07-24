import { NextResponse } from 'next/server'
import { ShopifyService } from '@/services/shopify'
import type { ShopifyDeliveryProfilesResponse } from '@/types/shopify-query-responses'
import type { ShippingZone } from '@/types/api'

export async function GET(): Promise<NextResponse> {
  try {
    const shopifyService = new ShopifyService()
    const data = await shopifyService.getDeliveryProfiles()
    
    const zones = extractZonesFromShopifyData(data)
    
    return NextResponse.json({
      success: true,
      data: zones,
      meta: {
        total: zones.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch zones',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function extractZonesFromShopifyData(shopifyResponse: ShopifyDeliveryProfilesResponse): ShippingZone[] {
  const zones: ShippingZone[] = []
  const seenZoneIds = new Set<string>()
  
  if (!shopifyResponse?.deliveryProfiles?.edges) {
    return zones
  }
  
  for (const profileEdge of shopifyResponse.deliveryProfiles.edges) {
    const profile = profileEdge.node
    
    if (profile.name !== 'General Profile') {
      continue
    }
    
    profile.profileLocationGroups?.forEach(locationGroup => {
      locationGroup.locationGroupZones?.edges?.forEach(zoneEdge => {
        const zoneNode = zoneEdge.node
        const zoneId = zoneNode.zone.id
        
        if (!seenZoneIds.has(zoneId)) {
          seenZoneIds.add(zoneId)
          
          zones.push({
            id: zoneId,
            name: zoneNode.zone.name,
            profileName: profile.name,
            rateCount: zoneNode.methodDefinitions?.edges?.length || 0
          })
        }
      })
    })
  }
  
  return zones
}
