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
              node: {
                id: string
                zone: {
                  id: string
                  name: string
                }
                methodDefinitions: {
                  edges: Array<{
                    node: {
                      id: string
                      name: string
                      rateDefinition: {
                        id: string
                        price: {
                          amount: string
                          currencyCode: string
                        }
                      }
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
