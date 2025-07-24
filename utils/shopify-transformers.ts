import { ShopifyDeliveryProfilesResponse } from '../types/shopify-responses'
import { ShippingRate } from '../types/api'

export function transformShopifyData(shopifyResponse: ShopifyDeliveryProfilesResponse): ShippingRate[] {
  const rates: ShippingRate[] = []
  
  shopifyResponse.deliveryProfiles.edges.forEach(profileEdge => {
    const profile = profileEdge.node
    
    profile.profileLocationGroups?.forEach(locationGroup => {
      locationGroup.locationGroupZones?.edges?.forEach(zoneEdge => {
        const zoneNode = zoneEdge.node
        const zone = zoneNode.zone
        
        zoneNode.methodDefinitions?.edges?.forEach(methodEdge => {
          const method = methodEdge.node
          if (method.rateProvider?.price) {
            rates.push({
              id: method.id,
              title: method.name,
              profileName: profile.name,
              zoneId: zone.id,
              zoneName: zone.name,
              currency: method.rateProvider.price.currencyCode,
              price: parseFloat(method.rateProvider.price.amount)
            })
          }
        })
      })
    })
  })
  
  return rates
}
