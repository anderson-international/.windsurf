'use client'

// TEST FILE: Return null/undefined patterns that should NOT be detected
// All patterns in this file should PASS (no violations)

import React from 'react'

// Pattern 1: Throw error instead of return null (CORRECT)
function Component1({ data }: { data?: any }) {
  if (!data) throw new Error('Component1: Missing required data parameter')
  return <div>{data.value}</div>
}

// Pattern 2: Early return with actual JSX
function Component2({ user }: { user?: any }) {
  if (!user.id) return <div>Loading user...</div> // NOT A VIOLATION - returning JSX
  return <span>{user.name}</span>
}

// Pattern 3: Return boolean/number values (not null/undefined)
function Component3({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return false // NOT A VIOLATION - returning boolean
  return true
}

// Pattern 4: Return empty JSX fragment (not null)
function Component4({ items }: { items?: any[] }) {
  if (!items?.length) return <></> // NOT A VIOLATION - returning JSX fragment
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}

// Pattern 5: Proper error throwing
function Component5({ config }: { config?: any }) {
  if (config.mode === 'hidden') {
    if (config.override) {
      throw new Error('Component5: Invalid configuration - hidden mode with override')
    }
  }
  return <div>Visible</div>
}

// Pattern 6: Hook throwing error instead of returning null
function useCustomHook(value?: string) {
  if (!value) throw new Error('useCustomHook: Value parameter is required')
  return { processed: value.toUpperCase() }
}

// Pattern 7: Arrow function with proper error handling
const Component6 = ({ data }: { data?: any }) => {
  if (!data) throw new Error('Component6: Data prop is required')
  return <div>{data.content}</div>
}

// Pattern 8: Function returning meaningful values
function processData(input?: any) {
  if (!input) throw new Error('processData: Input parameter is required')
  return input.transformed
}

// Pattern 9: Comments containing "return null" should not trigger
function Component9() {
  // This component used to return null but now throws
  // We changed "return null" to proper error handling
  return <div>Fixed component</div>
}

export { Component1, Component2, Component3, Component4, Component5, useCustomHook, Component6, processData, Component9 }
