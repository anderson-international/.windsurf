'use client'

// TEST FILE: Empty catch block patterns that SHOULD be detected
// All patterns in this file should trigger FALLBACK DATA VIOLATIONS

import React from 'react'

// Pattern 1: Empty catch returning null
function Component1({ data }: { data?: any }) {
  try {
    return processData(data)
  } catch {
    return null; // SHOULD BE DETECTED
  }
}

// Pattern 2: Empty catch returning undefined
function Component2({ user }: { user?: any }) {
  try {
    return validateUser(user)
  } catch {
    return undefined; // SHOULD BE DETECTED
  }
}

// Pattern 3: Empty catch returning empty array
function Component3({ items }: { items?: any[] }) {
  try {
    return items.map(transform)
  } catch {
    return []; // SHOULD BE DETECTED
  }
}

// Pattern 4: Empty catch returning empty object
function Component4({ config }: { config?: any }) {
  try {
    return parseConfig(config)
  } catch {
    return {}; // SHOULD BE DETECTED
  }
}

// Pattern 5: Empty catch returning string fallback
function Component5({ api }: { api?: any }) {
  try {
    return api.fetchData()
  } catch {
    return 'Error occurred'; // SHOULD BE DETECTED
  }
}

// Pattern 6: Empty catch returning number fallback
function Component6({ count }: { count?: number }) {
  try {
    return calculateTotal(count)
  } catch {
    return 0; // SHOULD BE DETECTED
  }
}

// Pattern 7: Empty catch returning boolean fallback
function Component7({ flag }: { flag?: boolean }) {
  try {
    return validateFlag(flag)
  } catch {
    return false; // SHOULD BE DETECTED
  }
}

// Pattern 8: Catch with error parameter but still returning fallback
function Component8({ data }: { data?: any }) {
  try {
    return processData(data)
  } catch (error) {
    console.log(error) // Has error handling but still returns fallback
    return 'Failed'; // SHOULD BE DETECTED
  }
}

// Pattern 9: Multi-line catch block with fallback return
function Component9({ user }: { user?: any }) {
  try {
    return validateAndProcessUser(user)
  } catch {
    console.log('User validation failed')
    logError('Component9 error')
    return { name: 'Anonymous', id: 0 }; // SHOULD BE DETECTED
  }
}

// Pattern 10: Nested try-catch with fallback
function Component10({ config }: { config?: any }) {
  try {
    try {
      return parseAdvancedConfig(config)
    } catch {
      return { basic: true }; // SHOULD BE DETECTED
    }
  } catch {
    return null; // SHOULD BE DETECTED
  }
}

// Mock functions for testing
function processData(data: any) { return data?.processed }
function validateUser(user: any) { return user?.valid }
function transform(item: any) { return item?.transformed }
function parseConfig(config: any) { return config?.parsed }
function calculateTotal(count: number) { return count * 2 }
function validateFlag(flag: boolean) { return flag === true }
function validateAndProcessUser(user: any) { return { ...user, validated: true } }
function parseAdvancedConfig(config: any) { return { ...config, advanced: true } }
function logError(message: string) { console.error(message) }

export { Component1, Component2, Component3, Component4, Component5, Component6, Component7, Component8, Component9, Component10 }
