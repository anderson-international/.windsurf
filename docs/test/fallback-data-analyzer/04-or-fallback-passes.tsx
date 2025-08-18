'use client'

// TEST FILE: Logical OR fallback patterns that should NOT be detected
// All patterns in this file should PASS (no violations)

import React from 'react'

// Pattern 1: Proper error throwing instead of fallbacks
function Component1({ user }: { user?: any }) {
  if (!user?.name) throw new Error('Component1: User name is required')
  const name = user.name // NO FALLBACK - properly validated
  return <div>{name}</div>
}

// Pattern 2: Logical OR for boolean operations (not fallback data)
function Component2({ isVisible, isEnabled }: { isVisible: boolean, isEnabled: boolean }) {
  const shouldShow = isVisible || isEnabled // NOT A VIOLATION - boolean logic
  return shouldShow ? <div>Visible</div> : <div>Hidden</div>
}

// Pattern 3: Conditional assignment without literals
function Component3({ mode }: { mode: 'light' | 'dark' }) {
  const theme = mode || 'light' // NOT A VIOLATION - both are valid enum values
  return <div className={theme}>Content</div>
}

// Pattern 4: Mathematical operations
function Component4({ a, b }: { a: number, b: number }) {
  const result = a || b // NOT A VIOLATION - mathematical operation with numbers
  return <span>Result: {result}</span>
}

// Pattern 5: Proper validation with explicit throws
function Component5({ items }: { items?: any[] }) {
  if (!items) throw new Error('Component5: Items array is required')
  const list = items // NO FALLBACK - properly validated
  return <ul>{list.map(i => <li key={i}>{i}</li>)}</ul>
}

// Pattern 6: Using ?? (nullish coalescing) is still valid logic operation
function Component6({ count }: { count?: number }) {
  const value = count ?? 0 // NOT DETECTED BY OUR PATTERN - uses ?? not ||
  return <span>Count: {value}</span>
}

// Pattern 7: Proper error handling instead of object fallbacks
function Component7({ data }: { data?: any }) {
  if (!data?.response) throw new Error('Component7: Invalid response data')
  const result = data.response // NO FALLBACK - properly validated
  return <div>{JSON.stringify(result)}</div>
}

// Pattern 8: Comments containing || should not trigger
function Component8() {
  // This used to use: const name = user?.name || 'default'
  // But now we properly validate instead
  return <div>Fixed component</div>
}

// Pattern 9: String concatenation with ||
function Component9({ prefix, suffix }: { prefix?: string, suffix?: string }) {
  // This is boolean logic, not fallback data
  const hasContent = prefix || suffix // NOT A VIOLATION - boolean check
  if (!hasContent) throw new Error('Component9: Either prefix or suffix required')
  return <div>{prefix}{suffix}</div>
}

// Pattern 10: Proper function with validation
function processUser(userData?: any) {
  if (!userData?.email) throw new Error('processUser: Email is required')
  if (!userData?.phone) throw new Error('processUser: Phone is required')
  return { email: userData.email, phone: userData.phone } // NO FALLBACKS
}

export { Component1, Component2, Component3, Component4, Component5, Component6, Component7, Component8, Component9, processUser }
