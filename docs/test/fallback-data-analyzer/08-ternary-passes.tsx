'use client'

// TEST FILE: Ternary patterns that should NOT be detected (including accessibility edge cases)
// All patterns in this file should PASS (no violations)

import React from 'react'

// Pattern 1: Proper error throwing instead of ternary fallback
function Component1({ user }: { user?: any }) {
  if (!user?.name) throw new Error('Component1: User name is required')
  const name = user.name // NO FALLBACK - properly validated
  return <div>{name}</div>
}

// Pattern 2: Ternary for conditional rendering (JSX, not fallback data)
function Component2({ items }: { items?: any[] }) {
  return items ? <ul>{items.map(i => <li key={i}>{i}</li>)}</ul> : <div>Loading...</div> // NOT A VIOLATION - conditional JSX
}

// Pattern 3: EDGE CASE - Conditional property spreading (accessibility pattern)
function Component3({ mode, isSelected }: { mode?: string, isSelected?: boolean }) {
  return (
    <button 
      {...(mode === 'multi' && { 'aria-checked': isSelected })} // NOT A VIOLATION - conditional property spreading
      onClick={() => {}}
    >
      Select item
    </button>
  )
}

// Pattern 4: EDGE CASE - Ternary for aria attributes (legitimate accessibility)
function Component4({ isToggled }: { isToggled?: boolean }) {
  return (
    <button 
      aria-pressed={isToggled ? 'true' : 'false'} // NOT A VIOLATION - proper aria boolean string
      onClick={() => {}}
    >
      Toggle
    </button>
  )
}

// Pattern 5: EDGE CASE - Ternary for aria-expanded (valid accessibility pattern)
function Component5({ isOpen }: { isOpen: boolean }) {
  return (
    <button 
      aria-expanded={isOpen ? 'true' : 'false'} // NOT A VIOLATION - proper aria boolean string
      onClick={() => {}}
    >
      Menu
    </button>
  )
}

// Pattern 6: Ternary for boolean logic (not fallback data)
function Component6({ isEnabled }: { isEnabled: boolean }) {
  const shouldShow = isEnabled ? true : false // NOT A VIOLATION - boolean logic, not fallback
  return shouldShow ? <div>Enabled</div> : <div>Disabled</div>
}

// Pattern 7: EDGE CASE - Conditional object spreading
function Component7({ hasError, errorProps }: { hasError: boolean, errorProps?: any }) {
  return (
    <div 
      {...(hasError && errorProps)} // NOT A VIOLATION - conditional spreading
      className="container"
    >
      Content
    </div>
  )
}

// Pattern 8: EDGE CASE - Ternary for CSS classes (not fallback data)
function Component8({ variant }: { variant?: 'primary' | 'secondary' }) {
  return (
    <button 
      className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'} // NOT A VIOLATION - CSS class selection
      onClick={() => {}}
    >
      Button
    </button>
  )
}

// Pattern 9: EDGE CASE - Ternary for HTML attributes (not fallback data)
function Component9({ isDisabled }: { isDisabled: boolean }) {
  return (
    <input 
      type="text"
      disabled={isDisabled ? true : false} // NOT A VIOLATION - HTML attribute boolean
      readOnly={isDisabled ? true : undefined} // NOT A VIOLATION - conditional HTML attribute
    />
  )
}

// Pattern 10: Proper validation with conditional logic
function Component10({ user }: { user?: any }) {
  if (!user?.name) throw new Error('Component10: User name is required')
  if (!user?.email) throw new Error('Component10: User email is required')
  
  // These are conditional logic, not fallback data
  const canEdit = user.role === 'admin' ? true : false // NOT A VIOLATION - role-based logic
  const displayName = user.preferredName ? user.preferredName : user.name // This IS a violation if fallback
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {canEdit && <button>Edit</button>}
    </div>
  )
}

// Pattern 11: EDGE CASE - Comments containing ternary fallbacks should not trigger
function Component11() {
  // This used to use: const name = user?.name ? user.name : 'Anonymous'
  // But now we validate properly
  return <div>Fixed component</div>
}

export { Component1, Component2, Component3, Component4, Component5, Component6, Component7, Component8, Component9, Component10, Component11 }
