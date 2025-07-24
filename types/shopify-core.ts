export interface DeliveryProfile {
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

export interface DeliveryLocationGroupZoneNode {
  zone: {
    id: string
    name: string
  }
  methodDefinitions: {
    edges: {
      node: {
        id: string
        name: string
        rateProvider: {
          id: string
          price: {
            amount: string
            currencyCode: string
          }
        } | null
      }
    }[]
  }
}
