'use client'

// TEST FILE: Catch block patterns that should NOT be detected
// All patterns in this file should PASS (no violations)

import React from 'react'

// Pattern 1: Proper error re-throwing in catch
function Component1({ data }: { data?: any }) {
  try {
    return processData(data)
  } catch (error) {
    throw new Error(`Component1: Failed to process data - ${error}`) // NOT A VIOLATION - re-throwing
  }
}

// Pattern 2: Catch with composed error throwing
function Component2({ user }: { user?: any }) {
  try {
    return validateUser(user)
  } catch (error) {
    throw new Error(`Component2: User validation failed - ${error}`) // NOT A VIOLATION - composed error
  }
}

// Pattern 3: Catch returning JSX (not fallback data)
function Component3({ items }: { items?: any[] }) {
  try {
    return <ul>{items.map(transform).map(i => <li key={i.id}>{i.name}</li>)}</ul>
  } catch (error) {
    return <div>Error loading items</div> // NOT A VIOLATION - returning JSX
  }
}

// Pattern 4: Catch with proper error handling and re-throw
function Component4({ config }: { config?: any }) {
  try {
    return parseConfig(config)
  } catch (error) {
    logError('Config parsing failed', error)
    throw new Error(`Component4: Invalid configuration - ${error}`) // NOT A VIOLATION - re-throwing
  }
}

// Pattern 5: Empty catch that re-throws (no return)
function Component5({ api }: { api?: any }) {
  try {
    return api.fetchData()
  } catch {
    throw new Error('Component5: API fetch failed') // NOT A VIOLATION - throwing, not returning
  }
}

// Pattern 6: Catch with logging but still throws
function Component6({ count }: { count?: number }) {
  try {
    return calculateTotal(count)
  } catch (error) {
    console.error('Calculation failed:', error)
    throw new Error(`Component6: Calculation error - ${error}`) // NOT A VIOLATION - throwing
  }
}

// Pattern 7: Catch block without return statement
function Component7({ flag }: { flag?: boolean }) {
  try {
    return validateFlag(flag)
  } catch (error) {
    logError('Flag validation failed', error)
    // NO RETURN STATEMENT - NOT A VIOLATION
    throw new Error(`Component7: Invalid flag - ${error}`)
  }
}

// Pattern 8: Try-catch where catch doesn't return anything
function Component8({ data }: { data?: any }) {
  let result
  try {
    result = processData(data)
  } catch (error) {
    throw new Error(`Component8: Processing failed - ${error}`) // NOT A VIOLATION - throwing
  }
  return result
}

// Pattern 9: Comments containing catch returns should not trigger
function Component9({ user }: { user?: any }) {
  try {
    return validateAndProcessUser(user)
  } catch (error) {
    // This used to have: return null
    // But now we properly throw errors
    throw new Error(`Component9: User processing failed - ${error}`)
  }
}

// Pattern 10: Nested try-catch with proper error handling
function Component10({ config }: { config?: any }) {
  try {
    try {
      return parseAdvancedConfig(config)
    } catch (innerError) {
      throw new Error(`Component10: Inner config parsing failed - ${innerError}`)
    }
  } catch (outerError) {
    throw new Error(`Component10: Config processing failed - ${outerError}`) // NOT A VIOLATION - throwing
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
function logError(message: string, error?: any) { console.error(message, error) }

export { Component1, Component2, Component3, Component4, Component5, Component6, Component7, Component8, Component9, Component10 }
