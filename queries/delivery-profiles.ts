export const GET_DELIVERY_PROFILES_QUERY = `
  query {
    deliveryProfiles(first: 10) {
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
                  zone {
                    id
                    name
                  }
                  methodDefinitions(first: 150) {
                    edges {
                      node {
                        id
                        name
                        rateProvider {
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
