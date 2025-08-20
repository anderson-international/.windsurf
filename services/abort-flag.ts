type GlobalWithAbort = typeof globalThis & {
  __SHOPIFY_RATES_ABORT__?: { aborted: boolean; reason?: string; at?: string }
}

const g = globalThis as GlobalWithAbort

function ensure() {
  if (!g.__SHOPIFY_RATES_ABORT__) g.__SHOPIFY_RATES_ABORT__ = { aborted: false }
  return g.__SHOPIFY_RATES_ABORT__
}

export const AbortFlag = {
  abort(reason?: string) {
    const s = ensure()
    s.aborted = true
    s.reason = reason
    s.at = new Date().toISOString()
  },
  reset() {
    g.__SHOPIFY_RATES_ABORT__ = { aborted: false }
  },
  isAborted() {
    return ensure().aborted === true
  },
  getReason() {
    return ensure().reason
  }
}
