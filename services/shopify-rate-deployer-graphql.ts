import { ShippingRate } from '../types/api'
import { ShopifyConfig } from './shopify-config'
import { DeliveryProfileUpdateResponse } from '../types/shopify-mutation-responses'
import { DeliveryProfileInput } from '../types/shopify-inputs'
import { createMethodDefinition } from './profile-utils'

export class ShopifyRateDeployerGraphQL {
  private readonly config: ShopifyConfig

  constructor(config: ShopifyConfig) {
    this.config = config
  }

  async updateProfileWithRates(
    profileId: string, 
    locationGroupId: string, 
    zoneId: string, 
    rates: ShippingRate[],
    existingMethodDefinitionIds: string[],
    dryRun: boolean = false
  ): Promise<{ mutation: string; variables: unknown; ratesCount: number } | void> {
    const mutation = `
      mutation deliveryProfileUpdate($id: ID!, $profile: DeliveryProfileInput!) {
        deliveryProfileUpdate(id: $id, profile: $profile) {
          profile {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const profileInput: DeliveryProfileInput = {
      methodDefinitionsToDelete: existingMethodDefinitionIds,
      locationGroupsToUpdate: [{
        id: locationGroupId,
        zonesToUpdate: [{
          id: zoneId,
          methodDefinitionsToCreate: rates.map(rate => createMethodDefinition(rate))
        }]
      }]
    }

    // Dry-run mode: concise logging by default; verbose behind env flag
    if (dryRun) {
      const variables = { id: profileId, profile: profileInput };
      const verbose = process.env.VERBOSE_GRAPHQL === '1'
      if (verbose) {
        const cap = 800
        const trunc = (s: string) => (s.length > cap ? s.slice(0, cap) + '…(truncated)' : s)
        console.log(`DRY RUN GraphQL: deliveryProfileUpdate | rates=${rates.length}`)
        console.log(`mutation: ${trunc(mutation.replace(/\s+/g, ' ').trim())}`)
        console.log(`variables: ${trunc(JSON.stringify(variables))}`)
      } else {
        console.log(`DRY RUN GraphQL: deliveryProfileUpdate | rates=${rates.length}`)
      }
      // Return preview object for callers to consume in reports
      return { mutation, variables, ratesCount: rates.length };
    }

    const response = await this.executeGraphQLQuery<DeliveryProfileUpdateResponse>(mutation, {
      id: profileId,
      profile: profileInput
    })
    
    if (response.deliveryProfileUpdate?.userErrors?.length > 0) {
      const errors = response.deliveryProfileUpdate.userErrors
      throw new Error(`Shopify API errors: ${errors.map((e: { message: string }) => e.message).join(', ')}`)
    }
  }

  private async executeGraphQLQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const url = `${this.config.storeUrl}/admin/api/${this.config.apiVersion}/graphql.json`
    const maxAttempts = 5
    const baseDelayMs = 500

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const started = Date.now()
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.config.adminAccessToken,
        },
        body: JSON.stringify({ query, variables }),
      })

      const duration = Date.now() - started

      if (!res.ok) {
        // Handle throttling / rate limit
        if (res.status === 429 || res.status === 503) {
          const retryAfterHeader = res.headers.get('Retry-After')
          const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 0
          const backoff = retryAfterMs || Math.min(8000, baseDelayMs * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 200)
          console.warn(`Shopify GraphQL throttled (HTTP ${res.status}). Attempt ${attempt}/${maxAttempts}. Backing off for ${backoff}ms`)
          await new Promise(r => setTimeout(r, backoff))
          continue
        }
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${res.statusText} — ${text}`)
      }

      const raw = await res.json()

      // Log cost information if available (compact)
      try {
        const cost = raw?.extensions?.cost
        if (cost?.throttleStatus) {
          const ts = cost.throttleStatus
          console.log(`GraphQL cost: req=${cost.requestedQueryCost} act=${cost.actualQueryCost} avail=${ts.currentlyAvailable} restore=${ts.restoreRate} max=${ts.maximumAvailable} dur=${duration}ms`)
          // If near the limit, gently pause to avoid tripping throttle for subsequent calls
          if (typeof ts.currentlyAvailable === 'number' && ts.currentlyAvailable < 50) {
            await new Promise(r => setTimeout(r, 300))
          }
        }
      } catch {}

      if (raw.errors) {
        const msg = raw.errors[0]?.message || 'Unknown GraphQL error'
        // Retry if specifically throttled
        if (/throttl/i.test(msg) && attempt < maxAttempts) {
          const backoff = Math.min(8000, baseDelayMs * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 200)
          console.warn(`GraphQL error indicates throttling. Attempt ${attempt}/${maxAttempts}. Backing off for ${backoff}ms`)
          await new Promise(r => setTimeout(r, backoff))
          continue
        }
        throw new Error(msg)
      }

      return raw.data as T
    }

    throw new Error('Exceeded maximum retry attempts for Shopify GraphQL request')
  }
}
