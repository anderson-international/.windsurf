'use client'

// TEST FILE: Optional chaining with fallback patterns that SHOULD be detected
// All patterns in this file should trigger FALLBACK DATA VIOLATIONS

import React from 'react'

// Pattern 1: Basic optional chaining with string fallback
function Component1({ user }: { user?: any }) {
  const name = user?.profile?.name || 'Anonymous'; // SHOULD BE DETECTED
  return <div>{name}</div>
}

// Pattern 2: Optional chaining with array fallback
function Component2({ data }: { data?: any }) {
  const items = data?.results?.items || []; // SHOULD BE DETECTED
  return <ul>{items.map((i: any) => <li key={i.id}>{i.name}</li>)}</ul>
}

// Pattern 3: Deep optional chaining with object fallback
function Component3({ config }: { config?: any }) {
  const settings = config?.app?.ui?.theme || { mode: 'light', color: 'blue' }; // SHOULD BE DETECTED
  return <div className={settings.mode}>{settings.color}</div>
}

// Pattern 4: Optional chaining with number fallback
function Component4({ stats }: { stats?: any }) {
  const count = stats?.metrics?.total || 0; // SHOULD BE DETECTED
  return <span>Total: {count}</span>
}

// Pattern 5: Multiple levels with function call
function Component5({ api }: { api?: any }) {
  const result = api?.client?.getData()?.value || 'No data'; // SHOULD BE DETECTED
  return <div>{result}</div>
}

// Pattern 6: Optional chaining in computed property
function Component6({ product }: { product?: any }) {
  const price = product?.pricing?.['current-price'] || '$0.00'; // SHOULD BE DETECTED
  return <span>{price}</span>
}

// Pattern 7: Optional chaining with boolean fallback
function Component7({ feature }: { feature?: any }) {
  const enabled = feature?.flags?.newUI || false; // SHOULD BE DETECTED
  return <button disabled={!enabled}>New UI</button>
}

// Pattern 8: Complex expression with optional chaining
function Component8({ order }: { order?: any }) {
  const shipping = order?.details?.shipping?.address?.country || 'Unknown'; // SHOULD BE DETECTED
  return <div>Ship to: {shipping}</div>
}

// Pattern 9: Optional chaining with method call and fallback
function Component9({ service }: { service?: any }) {
  const status = service?.healthCheck?.()?.status || 'offline'; // SHOULD BE DETECTED
  return <div>Status: {status}</div>
}

// Pattern 10: Multiple optional chaining patterns in one component
function Component10({ user }: { user?: any }) {
  const name = user?.personal?.fullName || 'No name'; // SHOULD BE DETECTED
  const email = user?.contact?.email || 'no-email@example.com'; // SHOULD BE DETECTED
  const age = user?.personal?.age || 0; // SHOULD BE DETECTED
  
  return (
    <div>
      <h1>{name}</h1>
      <p>{email}</p>
      <span>Age: {age}</span>
    </div>
  )
}

export { Component1, Component2, Component3, Component4, Component5, Component6, Component7, Component8, Component9, Component10 }
