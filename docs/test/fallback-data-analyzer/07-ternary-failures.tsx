'use client'

// TEST FILE: Ternary fallback patterns that SHOULD be detected
// All patterns in this file should trigger FALLBACK DATA VIOLATIONS

import React from 'react'

// Pattern 1: Classic ternary with string fallback
function Component1({ user }: { user?: any }) {
  const name = user?.name ? user.name : 'Anonymous'; // SHOULD BE DETECTED
  return <div>{name}</div>
}

// Pattern 2: Ternary with array fallback
function Component2({ items }: { items?: any[] }) {
  const list = items ? items : []; // SHOULD BE DETECTED
  return <ul>{list.map(i => <li key={i}>{i}</li>)}</ul>
}

// Pattern 3: Ternary with object fallback
function Component3({ config }: { config?: any }) {
  const settings = config ? config : { theme: 'light' }; // SHOULD BE DETECTED
  return <div>{settings.theme}</div>
}

// Pattern 4: Ternary with number fallback
function Component4({ count }: { count?: number }) {
  const total = count ? count : 0; // SHOULD BE DETECTED
  return <span>Total: {total}</span>
}

// Pattern 5: Ternary with boolean fallback
function Component5({ isEnabled }: { isEnabled?: boolean }) {
  const enabled = isEnabled ? isEnabled : false; // SHOULD BE DETECTED
  return <button disabled={!enabled}>Click me</button>
}

// Pattern 6: Complex condition with fallback
function Component6({ data }: { data?: any }) {
  const result = data && data.valid ? data.result : 'No result'; // SHOULD BE DETECTED
  return <div>{result}</div>
}

// Pattern 7: Nested ternary with fallback
function Component7({ user }: { user?: any }) {
  const status = user ? (user.active ? 'active' : 'inactive') : 'unknown'; // SHOULD BE DETECTED
  return <span>Status: {status}</span>
}

// Pattern 8: Property access with ternary fallback
function Component8({ product }: { product?: any }) {
  const price = product?.price ? product.price : '$0.00'; // SHOULD BE DETECTED
  return <span>{price}</span>
}

// Pattern 9: Method call with ternary fallback
function Component9({ api }: { api?: any }) {
  const getData = () => {
    return api?.fetch ? api.fetch() : 'No data'; // SHOULD BE DETECTED
  }
  return <div>{getData()}</div>
}

// Pattern 10: Multiple ternary fallbacks
function Component10({ user }: { user?: any }) {
  const name = user?.name ? user.name : 'No name'; // SHOULD BE DETECTED
  const email = user?.email ? user.email : 'no-email@example.com'; // SHOULD BE DETECTED
  const age = user?.age ? user.age : 0; // SHOULD BE DETECTED
  
  return (
    <div>
      <h1>{name}</h1>
      <p>{email}</p>
      <span>Age: {age}</span>
    </div>
  )
}

export { Component1, Component2, Component3, Component4, Component5, Component6, Component7, Component8, Component9, Component10 }
