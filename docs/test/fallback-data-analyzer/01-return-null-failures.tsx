'use client'

// TEST FILE: Return null/undefined patterns that SHOULD be detected
// All patterns in this file should trigger FALLBACK DATA VIOLATIONS

import React from 'react'

// Pattern 1: Simple return null
function Component1({ data }: { data?: any }) {
  if (!data) return null; // SHOULD BE DETECTED
  return <div>{data.value}</div>
}

// Pattern 2: Return undefined
function Component2({ user }: { user?: any }) {
  if (!user.id) return undefined; // SHOULD BE DETECTED
  return <span>{user.name}</span>
}

// Pattern 3: Multi-line with return null
function Component3({ product }: { product?: any }) {
  if (!product) {
    console.log('No product found')
    return null; // SHOULD BE DETECTED
  }
  return <div>{product.title}</div>
}

// Pattern 4: Return null with semicolon
function Component4({ items }: { items?: any[] }) {
  if (!items?.length) return null; // SHOULD BE DETECTED
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}

// Pattern 5: Nested return null
function Component5({ config }: { config?: any }) {
  if (config.mode === 'hidden') {
    if (config.override) {
      return null; // SHOULD BE DETECTED
    }
  }
  return <div>Visible</div>
}

// Pattern 6: Hook returning null
function useCustomHook(value?: string) {
  if (!value) return null; // SHOULD BE DETECTED
  return { processed: value.toUpperCase() }
}

// Pattern 7: Arrow function return null
const Component6 = ({ data }: { data?: any }) => {
  if (!data) return null; // SHOULD BE DETECTED
  return <div>{data.content}</div>
}

// Pattern 8: Return null in different contexts
function processData(input?: any) {
  if (!input) return null; // SHOULD BE DETECTED
  return input.transformed
}

export { Component1, Component2, Component3, Component4, Component5, useCustomHook, Component6, processData }
