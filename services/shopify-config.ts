export interface ShopifyConfig {
  readonly storeUrl: string
  readonly adminAccessToken: string
  readonly apiVersion: string
}

export interface ShopifyContext {
  zoneId: string
  zoneName: string
  profileId: string
  locationGroupId: string
  existingMethodDefinitionIds: string[]
}
