import React from 'react'

const TestComponent = ({ mode, isSelected }: { mode?: string, isSelected?: boolean }) => {
  return (
    <button 
      {...(mode === 'multi' && { 'aria-checked': isSelected })}
      onClick={() => {}}
    >
      Select
    </button>
  )
}
