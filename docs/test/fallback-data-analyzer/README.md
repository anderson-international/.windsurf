# Fallback Data Detection Test Suite

This comprehensive test suite validates the fallback data detection feature in `code-review-analyzer.js`.

## Overview

The fallback data detection enforces fail-fast methodology by identifying patterns that mask errors with fallback values instead of throwing composed errors.

## Test Structure

### Failure Tests (Should Be Detected)
These files contain patterns that **SHOULD** trigger `FALLBACK DATA VIOLATION`:

- `01-return-null-failures.tsx` - Return null/undefined patterns
- `03-or-fallback-failures.tsx` - Logical OR fallback patterns (`|| 'default'`)
- `05-optional-chaining-failures.tsx` - Optional chaining with fallbacks (`obj?.prop || fallback`)
- `07-ternary-failures.tsx` - Ternary fallback patterns (`condition ? value : 'default'`)
- `09-catch-block-failures.tsx` - Empty catch blocks returning fallback data

### Passing Tests (Should NOT Be Detected)
These files contain patterns that should **PASS** without violations:

- `02-return-null-passes.tsx` - Proper error throwing instead of null returns
- `04-or-fallback-passes.tsx` - Valid logical OR usage (boolean logic, not fallbacks)
- `06-optional-chaining-passes.tsx` - Optional chaining without fallbacks
- `08-ternary-passes.tsx` - Valid ternary usage (CSS classes, aria attributes, etc.)
- `10-catch-block-passes.tsx` - Proper catch block error handling
- `11-edge-cases-passes.tsx` - Complex edge cases and accessibility patterns

## Critical Edge Cases Covered

### ✅ Accessibility Patterns (Should NOT Be Detected)
```tsx
// Conditional property spreading - VALID
<button {...(mode === 'multi' && { 'aria-checked': isSelected })} />

// Proper aria string values - VALID  
<button aria-expanded={isExpanded ? 'true' : 'false'} />
<button aria-pressed={isPressed ? 'true' : 'false'} />
```

### ✅ CSS and HTML Attributes (Should NOT Be Detected)
```tsx
// CSS class selection - VALID
className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}

// HTML boolean attributes - VALID
disabled={isDisabled ? true : false}
```

### ✅ Boolean Logic (Should NOT Be Detected)
```tsx
// Boolean operations - VALID
const shouldShow = isVisible || isEnabled
const hasContent = prefix || suffix
```

### ❌ Fallback Data Violations (Should Be Detected)
```tsx
// String fallbacks - VIOLATION
const name = user?.name || 'Anonymous'

// Array fallbacks - VIOLATION  
const items = data?.items || []

// Object fallbacks - VIOLATION
const config = settings || {}

// Ternary fallbacks - VIOLATION
const title = product?.title ? product.title : 'No Title'

// Catch block fallbacks - VIOLATION
try { return processData() } catch { return null }
```

## Running Tests

### Manual Testing
Test individual files:
```bash
cmd /c node docs/scripts/code-review-analyzer.js docs/test/fallback-data-analyzer/01-return-null-failures.tsx
```

### Automated Test Suite
Run all tests with validation:
```bash
cmd /c node docs/test/fallback-data-analyzer/run-fallback-tests.js
```

The test runner will:
1. ✅ Verify failure tests correctly detect violations
2. ✅ Verify passing tests don't trigger false positives  
3. 📊 Provide detailed results and success rate
4. 🎉 Confirm overall detection accuracy

## Expected Behavior

### For Failure Tests
- Must show `FALLBACK DATA VIOLATION` messages
- Must show `❌ FAILED` status
- Must provide "Throw composed error instead" guidance
- Must include analytical questions for developers

### For Passing Tests  
- Must show `✅ PASSED` status
- Must NOT show any `FALLBACK DATA VIOLATION` messages
- Must NOT trigger false positives on valid patterns

## Violation Message Format

When detected, violations show:
```
FALLBACK DATA VIOLATION at line X: [offending code]
→ Throw composed error instead. Why is this data missing or invalid? 
  What specific condition caused this fallback? Consider deeper validation.
```

## Integration

These tests validate that the fallback data detection:
- ✅ Catches all intended anti-patterns
- ✅ Avoids false positives on legitimate code
- ✅ Integrates properly with existing violation reporting
- ✅ Maintains fail-fast methodology enforcement

## Maintenance

When adding new fallback patterns or edge cases:
1. Add failure examples to appropriate `*-failures.tsx` file
2. Add passing examples to appropriate `*-passes.tsx` file  
3. Run test suite to validate detection accuracy
4. Update this README with any new patterns
