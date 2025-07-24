export interface DeliveryProfileInput {
  methodDefinitionsToDelete?: string[]
  locationGroupsToUpdate?: DeliveryProfileLocationGroupInput[]
  locationGroupsToCreate?: DeliveryProfileLocationGroupInput[]
  locationGroupsToDelete?: string[]
  zonesToDelete?: string[]
  name?: string
}

export interface DeliveryProfileLocationGroupInput {
  id?: string
  locationIds?: string[]
  zonesToCreate?: DeliveryLocationGroupZoneInput[]
  zonesToUpdate?: DeliveryLocationGroupZoneInput[]
}

export interface DeliveryLocationGroupZoneInput {
  id?: string
  zoneId?: string
  methodDefinitionsToCreate?: DeliveryMethodDefinitionInput[]
}

export interface DeliveryMethodDefinitionInput {
  name: string
  rateDefinition: DeliveryRateDefinitionInput
}

export interface DeliveryRateDefinitionInput {
  price: MoneyInput
}

export interface MoneyInput {
  amount: string
  currencyCode: string
}
