import { DeliveryLocationGroupZoneNode } from './shopify-core'

export interface ShopifyDeliveryProfilesResponse {
  deliveryProfiles: {
    edges: Array<{
      node: {
        id: string
        name: string
        default: boolean
        profileLocationGroups: Array<{
          locationGroup: {
            id: string
          }
          locationGroupZones: {
            edges: Array<{
              node: DeliveryLocationGroupZoneNode
            }>
          }
        }>
      }
    }>
  }
}

export interface ZoneContextResponse {
  deliveryProfiles: {
    edges: Array<{
      node: {
        id: string
        profileLocationGroups: Array<{
          locationGroup: {
            id: string
          }
          locationGroupZones: {
            edges: Array<{
              node: {
                zone: {
                  id: string
                  name: string
                }
                methodDefinitions: {
                  edges: Array<{
                    node: {
                      id: string
                    }
                  }>
                }
              }
            }>
          }
        }>
      }
    }>
  }
}
