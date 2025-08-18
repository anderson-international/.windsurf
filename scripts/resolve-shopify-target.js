function resolveShopifyTargetForScripts() {
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

  const storeUrl = process.env[storeUrlKey]
  const adminAccessToken = process.env[accessKey]
  const apiVersion = process.env[apiVersionKey] || process.env['SHOPIFY_API_VERSION'] || '2025-07'

  const missing = []
  if (!storeUrl) missing.push(storeUrlKey)
  if (!adminAccessToken) missing.push(accessKey)

  if (missing.length) {
    throw new Error(
      `Missing required environment variables for target ${target}: ${missing.join(', ')}. ` +
      `Ensure ${storeUrlKey} and ${accessKey} are set. Optionally set ${apiVersionKey} or SHOPIFY_API_VERSION.`
    )
  }

  return { target, storeUrl, apiVersion }
}

module.exports = { resolveShopifyTargetForScripts }
