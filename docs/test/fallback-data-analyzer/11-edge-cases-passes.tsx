'use client'

// TEST FILE: Complex edge cases that should NOT be detected
// All patterns in this file should PASS (no violations)

import React from 'react'

// EDGE CASE 1: Conditional property spreading with complex logic
function AccessibilityComponent({ mode, isSelected, hasError }: { mode?: string, isSelected?: boolean, hasError?: boolean }) {
  return (
    <button 
      {...(mode === 'multi' && { 'aria-checked': isSelected })} // NOT A VIOLATION - conditional spreading
      {...(hasError && { 'aria-invalid': 'true' })} // NOT A VIOLATION - conditional spreading
      className="select-button"
      onClick={() => {}}
    >
      Select item
    </button>
  )
}

// EDGE CASE 2: Aria attributes with proper string values
function AriaComponent({ isExpanded, isPressed, hasPopup }: { isExpanded: boolean, isPressed?: boolean, hasPopup?: boolean }) {
  return (
    <button 
      aria-expanded={isExpanded ? 'true' : 'false'} // NOT A VIOLATION - proper aria string values
      aria-pressed={isPressed ? 'true' : 'false'} // NOT A VIOLATION - proper aria string values
      aria-haspopup={hasPopup ? 'menu' : 'false'} // NOT A VIOLATION - proper aria values
      onClick={() => {}}
    >
      Menu Button
    </button>
  )
}

// EDGE CASE 3: CSS class conditional logic
function StyledComponent({ variant, size, disabled }: { variant?: 'primary' | 'secondary', size?: 'small' | 'large', disabled?: boolean }) {
  const baseClass = 'btn'
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary' // NOT A VIOLATION - CSS classes
  const sizeClass = size === 'small' ? 'btn-sm' : 'btn-lg' // NOT A VIOLATION - CSS classes
  const disabledClass = disabled ? 'btn-disabled' : '' // NOT A VIOLATION - CSS classes
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass}`}
      onClick={() => {}}
    >
      Styled Button
    </button>
  )
}

// EDGE CASE 4: HTML attribute conditional logic
function FormComponent({ isRequired, isReadOnly, maxLength }: { isRequired?: boolean, isReadOnly?: boolean, maxLength?: number }) {
  return (
    <input 
      type="text"
      required={isRequired ? true : false} // NOT A VIOLATION - HTML boolean attribute
      readOnly={isReadOnly ? true : false} // NOT A VIOLATION - HTML boolean attribute
      maxLength={maxLength ? maxLength : undefined} // NOT A VIOLATION - HTML attribute
      placeholder="Enter text"
    />
  )
}

// EDGE CASE 5: Boolean logic operations (not fallback data)
function LogicComponent({ condition1, condition2, condition3 }: { condition1: boolean, condition2: boolean, condition3: boolean }) {
  const showSection1 = condition1 || condition2 // NOT A VIOLATION - boolean logic
  const showSection2 = condition2 && condition3 // NOT A VIOLATION - boolean logic
  const complexLogic = (condition1 && condition2) || condition3 // NOT A VIOLATION - boolean logic
  
  return (
    <div>
      {showSection1 && <div>Section 1</div>}
      {showSection2 && <div>Section 2</div>}
      {complexLogic && <div>Complex Section</div>}
    </div>
  )
}

// EDGE CASE 6: Enum/union type conditional selection
function EnumComponent({ theme, language }: { theme?: 'light' | 'dark', language?: 'en' | 'es' | 'fr' }) {
  const selectedTheme = theme === 'dark' ? 'dark' : 'light' // NOT A VIOLATION - enum selection
  const selectedLang = language === 'es' ? 'es' : language === 'fr' ? 'fr' : 'en' // NOT A VIOLATION - enum selection
  
  return (
    <div data-theme={selectedTheme} data-lang={selectedLang}>
      Content with theme and language
    </div>
  )
}

// EDGE CASE 7: Mathematical operations and comparisons
function MathComponent({ value1, value2, multiplier }: { value1: number, value2: number, multiplier?: number }) {
  const result1 = value1 || value2 // NOT A VIOLATION - mathematical operation (0 is falsy)
  const result2 = value1 + value2 // NOT A VIOLATION - mathematical operation
  const result3 = multiplier ? value1 * multiplier : value1 // Could be violation if multiplier fallback is literal
  
  return (
    <div>
      <span>Result1: {result1}</span>
      <span>Result2: {result2}</span>
      <span>Result3: {result3}</span>
    </div>
  )
}

// EDGE CASE 8: Event handler conditional logic
function EventComponent({ onPrimary, onSecondary }: { onPrimary?: () => void, onSecondary?: () => void }) {
  const handleClick = onPrimary || onSecondary // NOT A VIOLATION - function selection
  const handleKeyPress = (e: KeyboardEvent) => {
    const handler = e.key === 'Enter' ? onPrimary : onSecondary // NOT A VIOLATION - conditional handler selection
    handler?.()
  }
  
  return (
    <button 
      onClick={handleClick}
      onKeyPress={handleKeyPress}
    >
      Event Button
    </button>
  )
}

// EDGE CASE 9: Data transformation without fallbacks
function TransformComponent({ data }: { data: any[] }) {
  if (!data) throw new Error('TransformComponent: Data is required')
  
  const processedData = data.map(item => ({
    ...item,
    processed: true,
    // This is transformation, not fallback
    category: item.type === 'urgent' ? 'high-priority' : 'normal-priority' // NOT A VIOLATION - categorization
  }))
  
  return (
    <ul>
      {processedData.map(item => (
        <li key={item.id} className={item.category}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}

// EDGE CASE 10: Comments and strings containing fallback patterns
function CommentsComponent() {
  const codeExample = `
    // This shows a bad pattern: const name = user?.name || 'default'
    // Instead we should: if (!user?.name) throw new Error('Name required')
  `
  
  return (
    <div>
      <pre>{codeExample}</pre>
      {/* This component used to have: return items || [] */}
      {/* But now it properly validates data */}
    </div>
  )
}

export { 
  AccessibilityComponent, 
  AriaComponent, 
  StyledComponent, 
  FormComponent, 
  LogicComponent, 
  EnumComponent, 
  MathComponent, 
  EventComponent, 
  TransformComponent, 
  CommentsComponent 
}
