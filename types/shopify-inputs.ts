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
  description?: string
  rateDefinition: DeliveryRateDefinitionInput
  weightConditionsToCreate?: DeliveryWeightConditionInput[]
}

export interface DeliveryRateDefinitionInput {
  price: {
    amount: string
    currencyCode: string
  }
}

export interface DeliveryWeightConditionInput {
  operator: string
  criteria: WeightInput
}

export interface WeightInput {
  unit: string
  value: number
}

export interface MoneyInput {
  amount: string
  currencyCode: string
}
