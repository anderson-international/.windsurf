import { ShopifyDeliveryProfilesResponse } from '../types/shopify-query-responses'
import { DeliveryProfile } from '../types/shopify-core'
import { DeliveryMethodDefinitionInput } from '../types/shopify-inputs'
import { ShippingRate } from '../types/api'

export function findProfileById(response: ShopifyDeliveryProfilesResponse, profileId: string): DeliveryProfile | undefined {
  return response.deliveryProfiles.edges
    .map(edge => edge.node)
    .find(profile => profile.id === profileId)
}

export function extractAllMethodDefinitionIds(profile: DeliveryProfile): string[] {
  const ids: string[] = []
  
  profile.profileLocationGroups.forEach(locationGroup => {
    locationGroup.locationGroupZones.edges.forEach(zoneEdge => {
      const zoneNode = zoneEdge.node
      zoneNode.methodDefinitions.edges.forEach(methodEdge => {
        ids.push(methodEdge.node.id)
      })
    })
  })
  
  return ids
}

export function createMethodDefinition(rate: ShippingRate): DeliveryMethodDefinitionInput {
  return {
    name: rate.title,
    rateDefinition: {
      price: {
        amount: rate.price.toString(),
        currencyCode: rate.currency
      }
    }
  }
}
