// CLEAN TEST: Validate edge case fixes without comments/return type violations
import React from 'react'

// EDGE CASE: Conditional property spreading - should NOT be detected
export function AccessibilityButton({ mode, isSelected }: { mode?: string, isSelected?: boolean }): JSX.Element {
  return (
    <button 
      {...(mode === 'multi' && { 'aria-checked': isSelected })}
      onClick={() => {}}
    >
      Select
    </button>
  )
}

// EDGE CASE: HTML attributes - should NOT be detected  
export function FormInput({ isDisabled }: { isDisabled: boolean }): JSX.Element {
  return (
    <input 
      type="text"
      disabled={isDisabled ? true : false}
      readOnly={isDisabled ? true : undefined}
    />
  )
}

// EDGE CASE: Aria attributes - should NOT be detected
export function MenuButton({ isExpanded }: { isExpanded: boolean }): JSX.Element {
  return (
    <button 
      aria-expanded={isExpanded ? 'true' : 'false'}
      onClick={() => {}}
    >
      Menu
    </button>
  )
}

// VIOLATION: Should still be detected
export function BadComponent({ user }: { user?: any }): JSX.Element | null {
  if (!user) return null // SHOULD BE DETECTED
  return <div>{user.name}</div>
}
