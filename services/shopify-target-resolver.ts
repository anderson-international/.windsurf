import { ShopifyConfig } from './shopify-config'

export interface ResolvedShopifyTarget {
  target: string
  config: ShopifyConfig
}

function getEnv(name: string): string | undefined {
  return process.env[name]
}

export function resolveShopifyTarget(): ResolvedShopifyTarget {
  const rawTarget = (process.env.SHOPIFY_TARGET || '').trim()
  if (!rawTarget) {
    throw new Error(
      'SHOPIFY_TARGET is not set. Set SHOPIFY_TARGET to one of: STAGING, MRSNUFF, WHITEFOX and provide SHOPIFY_STORE_URL_<TARGET> and SHOPIFY_ACCESS_TOKEN_<TARGET>.'
    )
  }

  const target = rawTarget.toUpperCase()
  const storeUrlKey = `SHOPIFY_STORE_URL_${target}`
  const accessKey = `SHOPIFY_ACCESS_TOKEN_${target}`
  const apiVersionKey = `SHOPIFY_API_VERSION_${target}`

  const storeUrl = getEnv(storeUrlKey)
  const adminAccessToken = getEnv(accessKey)
  const apiVersion = getEnv(apiVersionKey) || getEnv('SHOPIFY_API_VERSION') || '2025-07'

  const missing: string[] = []
  if (!storeUrl) missing.push(storeUrlKey)
  if (!adminAccessToken) missing.push(accessKey)

  if (missing.length) {
    throw new Error(
      `Missing required environment variables for target ${target}: ${missing.join(', ')}. ` +
      `Ensure SHOPIFY_STORE_URL_${target} and SHOPIFY_ACCESS_TOKEN_${target} are set. Optionally set ${apiVersionKey} or SHOPIFY_API_VERSION.`
    )
  }

  return {
    target,
    config: {
      storeUrl: storeUrl!,
      adminAccessToken: adminAccessToken!,
      apiVersion: apiVersion!
    }
  }
}
