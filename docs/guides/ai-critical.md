# AI Context Critical

_Essential constraints and patterns that AIs regularly forget - reload this frequently._

<!-- AI_QUICK_REF
Overview: Critical constraints for AI coding tasks
Key Rules: Code file size limits, React loop prevention, Schema commands, Context requests
Avoid: Exceeding file size limits, React infinite loops, Missing context
-->

## Code File Size Limits (MANDATORY)

- **Components**: Max 150 lines
- **Hooks**: Max 100 lines
- **Utils**: Max 50 lines
- **Types**: Max 100 lines
- **API Routes**: Max 100 lines (thin controllers)
- **Services**: Max 100 lines (business logic)
- **Repositories**: Max 100 lines (data access)

**When exceeded**: Extract to custom hooks, services, repositories, or separate type files. Minimise all comments.

**Immediate Verification Required**: After creating or modifying any file, immediately run:
`cmd /c node docs/scripts/count-lines.js [filename]` to verify size compliance

## Thin Controller Pattern

- Route files: Pure HTTP handling (request/response, validation, status codes)
- Services: Business logic and orchestration
- Repositories: Database queries and data access

## React Loop Prevention (CRITICAL)

- Always wrap functions in useCallback
- Always wrap expensive calculations in useMemo
- Never define objects/arrays inline in JSX
- Always include proper dependency arrays

### Example Pattern

```typescript
const MyComponent = () => {
  const handleClick = useCallback(() => {
    // Handle click logic
  }, [dependency1, dependency2]);

  const expensiveValue = useMemo(() => {
    return calculateExpensiveValue(data);
  }, [data]);

  return <button onClick={handleClick}>Click</button>;
};
```

## Schema Loading Commands

- **Index**: `cmd /c node docs/scripts/schema-query.js --index`
- **Table**: `cmd /c node docs/scripts/schema-query.js --table specifications`
- **Patterns**: `cmd /c node docs/scripts/schema-query.js --pattern spec_*` (no quotes)

## Windows Command Syntax (CRITICAL)

### Command Requirements

- **Always use**: `cmd /c` prefix
- **Always use**: Backslashes `\` for Windows paths
- **Always use**: Relative paths when possible
- **Always quote**: Paths containing spaces
- **Always set**: SafeToAutoRun=true

### Examples

```bash
# Correct
cmd /c del docs\test\file.md
cmd /c del "docs\folder with spaces\file.md"
cmd /c node docs/scripts/schema-query.js --pattern spec_*

# Wrong
del docs\test\file.md                    # Missing cmd /c
Remove-Item docs\test\file.md           # PowerShell syntax
cmd /c del docs/test/file.md            # Unix slashes
cmd /c node script.js --pattern "spec_*" # Quoted patterns
```

## TypeScript Requirements (MANDATORY)

- **All functions**: Must have explicit return types
- **Never use**: 'any' type - use specific types or unions
- **React components**: Must return JSX.Element
- **Async functions**: Must return Promise<Type>

**Type Creation Protocol**: Before creating new types, analyze existing canonical types first:
- Search codebase for similar interfaces/types that can be reused or extended
- Prefer extending existing types over creating duplicates
- Use type composition patterns when possible

## React Anti-Patterns (CRITICAL)

- **Dual Fetching**: Don't fetch same data from component AND context
- **Unstable Dependencies**: No functions returning new objects/arrays in deps
- **Ignored Warnings**: Always address React Hook dependency warnings
- **Missing Cleanup**: Always cleanup effects and subscriptions

## API Error Handling (CRITICAL)

- **Retry**: 5xx errors, timeouts, 429 rate limits (max 3-5 attempts)
- **Fail-fast**: 4xx errors, auth failures, validation errors
- **Always**: Exponential backoff with jitter
- **Never**: Retry 4xx client errors

## Database Form Patterns

- **AI_TABLE_PURPOSE**: Defines form complexity (multi-step vs simple)
- **Junction tables**: Always multi-select components
- **// FORM: annotations**: Follow inline field guidance
- **Atomic transactions**: All related data in single transaction

## Ultra Minimalist Comments Policy

- **Always**: Remove all comments before starting a task
- **Never**: Add comments to code

⚠️ **AI ACTION REQUIRED**: Before starting any task, assess if you need additional context.
**Execute immediately**: Ask for specific context using: "I need context for [forms/API/React patterns/database/etc]"
