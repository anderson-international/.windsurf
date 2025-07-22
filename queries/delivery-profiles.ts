export const GET_DELIVERY_PROFILES_QUERY = `
  query {
    deliveryProfiles(first: 50) {
      edges {
        node {
          id
          name
          default
          profileLocationGroups {
            locationGroup {
              id
            }
            locationGroupZones(first: 50) {
              edges {
                node {
                  id
                  zone {
                    id
                    name
                  }
                  methodDefinitions(first: 50) {
                    edges {
                      node {
                        id
                        name
                        rateDefinition {
                          ... on DeliveryRateDefinition {
                            id
                            price {
                              amount
                              currencyCode
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
