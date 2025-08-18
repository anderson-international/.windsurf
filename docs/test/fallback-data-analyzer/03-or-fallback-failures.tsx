'use client'

// TEST FILE: Logical OR fallback patterns that SHOULD be detected
// All patterns in this file should trigger FALLBACK DATA VIOLATIONS

import React from 'react'

// Pattern 1: String fallbacks
function Component1({ user }: { user?: any }) {
  const name = user?.name || 'Unknown User'; // SHOULD BE DETECTED
  return <div>{name}</div>
}

// Pattern 2: Array fallbacks
function Component2({ items }: { items?: any[] }) {
  const list = items || []; // SHOULD BE DETECTED
  return <ul>{list.map(i => <li key={i}>{i}</li>)}</ul>
}

// Pattern 3: Object fallbacks
function Component3({ config }: { config?: any }) {
  const settings = config || {}; // SHOULD BE DETECTED
  return <div>{settings.theme}</div>
}

// Pattern 4: Number fallbacks
function Component4({ count }: { count?: number }) {
  const total = count || 0; // SHOULD BE DETECTED
  return <span>Total: {total}</span>
}

// Pattern 5: Boolean fallbacks
function Component5({ isEnabled }: { isEnabled?: boolean }) {
  const enabled = isEnabled || false; // SHOULD BE DETECTED
  return <button disabled={!enabled}>Click me</button>
}

// Pattern 6: Complex object fallbacks
function Component6({ data }: { data?: any }) {
  const result = data?.response || { error: 'No data' }; // SHOULD BE DETECTED
  return <div>{JSON.stringify(result)}</div>
}

// Pattern 7: Nested property with fallback
function Component7({ product }: { product?: any }) {
  const title = product?.details?.title || 'No Title'; // SHOULD BE DETECTED
  return <h1>{title}</h1>
}

// Pattern 8: Function call with fallback
function Component8({ api }: { api?: any }) {
  const getData = () => {
    return api?.fetch() || 'No data available'; // SHOULD BE DETECTED
  }
  return <div>{getData()}</div>
}

// Pattern 9: Multi-line assignment with fallback
function Component9({ user }: { user?: any }) {
  const profile = user?.profile ||
    { name: 'Anonymous', age: 0 }; // SHOULD BE DETECTED
  return <div>{profile.name}</div>
}

// Pattern 10: Variable assignment in different contexts
function processUser(userData?: any) {
  const email = userData?.email || 'noemail@example.com'; // SHOULD BE DETECTED
  const phone = userData?.phone || 'No phone'; // SHOULD BE DETECTED
  return { email, phone }
}

export { Component1, Component2, Component3, Component4, Component5, Component6, Component7, Component8, Component9, processUser }
