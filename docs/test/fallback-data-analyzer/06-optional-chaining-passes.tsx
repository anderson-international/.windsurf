'use client'

// TEST FILE: Optional chaining patterns that should NOT be detected
// All patterns in this file should PASS (no violations)

import React from 'react'

// Pattern 1: Proper error throwing instead of optional chaining fallbacks
function Component1({ user }: { user?: any }) {
  if (!user?.profile?.name) throw new Error('Component1: User profile name is required')
  const name = user.profile.name // NO FALLBACK - properly validated
  return <div>{name}</div>
}

// Pattern 2: Optional chaining without fallback (just checking existence)
function Component2({ data }: { data?: any }) {
  const hasItems = data?.results?.items // NOT A VIOLATION - no || fallback
  if (!hasItems) throw new Error('Component2: No items found in results')
  return <ul>{hasItems.map((i: any) => <li key={i.id}>{i.name}</li>)}</ul>
}

// Pattern 3: Optional chaining for conditional rendering (no fallback literals)
function Component3({ config }: { config?: any }) {
  if (!config?.app?.ui?.theme) throw new Error('Component3: Theme configuration is required')
  const settings = config.app.ui.theme // NO FALLBACK - properly validated
  return <div className={settings.mode}>{settings.color}</div>
}

// Pattern 4: Using nullish coalescing ?? instead of ||
function Component4({ stats }: { stats?: any }) {
  const count = stats?.metrics?.total ?? 0 // NOT DETECTED BY OUR PATTERN - uses ?? not ||
  return <span>Total: {count}</span>
}

// Pattern 5: Optional chaining in conditional without fallback
function Component5({ api }: { api?: any }) {
  if (!api?.client?.getData) throw new Error('Component5: API client getData method is required')
  const result = api.client.getData().value // NO FALLBACK - properly validated
  return <div>{result}</div>
}

// Pattern 6: Comments containing optional chaining fallbacks should not trigger
function Component6() {
  // This used to use: const price = product?.pricing?.['current-price'] || '$0.00'
  // But now we properly validate the data instead
  return <span>Fixed component</span>
}

// Pattern 7: Optional chaining for existence check without fallback
function Component7({ feature }: { feature?: any }) {
  const hasNewUI = feature?.flags?.newUI // NOT A VIOLATION - no || fallback
  if (hasNewUI === undefined) throw new Error('Component7: NewUI flag is required')
  return <button disabled={!hasNewUI}>New UI</button>
}

// Pattern 8: Proper validation before accessing deep properties
function Component8({ order }: { order?: any }) {
  if (!order?.details?.shipping?.address?.country) {
    throw new Error('Component8: Complete shipping address is required')
  }
  const shipping = order.details.shipping.address.country // NO FALLBACK
  return <div>Ship to: {shipping}</div>
}

// Pattern 9: Optional chaining for method existence check
function Component9({ service }: { service?: any }) {
  if (!service?.healthCheck) throw new Error('Component9: Health check service is required')
  const status = service.healthCheck().status // NO FALLBACK - properly validated
  return <div>Status: {status}</div>
}

// Pattern 10: Multiple validations without fallbacks
function Component10({ user }: { user?: any }) {
  if (!user?.personal?.fullName) throw new Error('Component10: User full name is required')
  if (!user?.contact?.email) throw new Error('Component10: User email is required')
  if (user?.personal?.age === undefined) throw new Error('Component10: User age is required')
  
  const name = user.personal.fullName // NO FALLBACKS
  const email = user.contact.email     // NO FALLBACKS
  const age = user.personal.age        // NO FALLBACKS
  
  return (
    <div>
      <h1>{name}</h1>
      <p>{email}</p>
      <span>Age: {age}</span>
    </div>
  )
}

export { Component1, Component2, Component3, Component4, Component5, Component6, Component7, Component8, Component9, Component10 }
