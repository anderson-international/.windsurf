import { ShopifyConfig } from './shopify-config'

export interface ResolvedShopifyTarget {
  target: string
  config: ShopifyConfig
}

function getEnv(name: string): string | undefined {
  return process.env[name]
}

function parseTargetsFromEnv(): string[] {
  const raw = (process.env.SHOPIFY_TARGETS || '').trim()
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.toUpperCase())
}

function isTargetConfigured(target: string): boolean {
  const storeUrlKey = `SHOPIFY_STORE_URL_${target}`
  const accessKey = `SHOPIFY_ACCESS_TOKEN_${target}`
  return Boolean(getEnv(storeUrlKey) && getEnv(accessKey))
}

export function getSelectableTargets(): Array<{ key: string; storeUrl: string }> {
  const keys = parseTargetsFromEnv()
  const out: Array<{ key: string; storeUrl: string }> = []
  for (const key of keys) {
    if (!isTargetConfigured(key)) continue
    const url = getEnv(`SHOPIFY_STORE_URL_${key}`)!
    out.push({ key, storeUrl: url })
  }
  return out
}

export function resolveShopifyTarget(overrideTarget?: string): ResolvedShopifyTarget {
  const envDefault = (process.env.SHOPIFY_TARGET || '').trim()
  const requested = (overrideTarget || envDefault || '').trim()
  if (!requested) {
    throw new Error(
      'SHOPIFY_TARGET is not set. Set SHOPIFY_TARGET and provide SHOPIFY_STORE_URL_<TARGET> and SHOPIFY_ACCESS_TOKEN_<TARGET>.'
    )
  }

  const target = requested.toUpperCase()
  // if SHOPIFY_TARGETS is provided, validate against it
  const allowed = parseTargetsFromEnv()
  if (allowed.length > 0 && !allowed.includes(target)) {
    throw new Error(`Requested target '${target}' is not in SHOPIFY_TARGETS`)
  }

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
