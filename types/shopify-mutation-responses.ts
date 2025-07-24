export interface DeliveryRateCreateResponse {
  deliveryRateDefinitionCreate: {
    userErrors: Array<{
      message: string
    }>
  }
}

export interface DeliveryProfileUpdateResponse {
  deliveryProfileUpdate: {
    profile: {
      id: string
      name: string
    } | null
    userErrors: Array<{
      field: string[]
      message: string
    }>
  }
}
