---
description: Context refresh and quality checks during development
---

# Live Fix Workflow

**Purpose**: Refresh AI context and run quality checks to prevent error accumulation during development

## 🚨 CRITICAL RULE: ALL ISSUES MUST BE FIXED IMMEDIATELY

**Since this workflow runs frequently during development, ALL reported violations are fresh and MUST be fixed before continuing. No exceptions, no tiers, no deferrals.**

## 🔄 Step 1: Refresh Context

```bash
# // turbo
/run critical-context
```

```bash
# // turbo
/run tech-code-quality
```

## 🔍 Step 2: Analyze Issues

### Code Review Analysis (MANDATORY)
```bash
cmd /c node docs\scripts\code-review-analyzer.js [file1] [file2] [file3]
```
*This will report ALL violations including file size issues*

## 🔧 Step 3: Apply Available Fixes (OPTIONAL)

**Remove debug console statements** (if found by analyzer):
```bash
cmd /c node docs\scripts\code-fix.js --console [file1] [file2] [file3]
```

**Batch remove comments** (if comment violations reported by analyzer):
```bash
cmd /c node docs\scripts\code-fix.js --comments [file1] [file2] [file3]
```

**⚠️ IMPORTANT**: `code-fix.js` has LIMITED scope:
- **`--console`**: Only removes console.log/debug/info statements
- **`--comments`**: Only removes all comments (JSDoc, //, /* */)
- **Does NOT fix**: TypeScript errors, ESLint violations, or other quality issues
- **console.error/warn are BLOCKING VIOLATIONS** - must be manually fixed

## ✅ Step 4: Verify Size Reductions (AFTER FIXES)

**Use after applying comment/console fixes to confirm file size reductions:**
```bash
cmd /c node docs\scripts\code-size.js [file1] [file2] [file3]
```
*This confirms that file size violations have been successfully resolved*

## 🎯 AI Trigger Conditions

**The AI must automatically run this workflow when:**

1. **User requests code changes** - Run after implementing any code modifications
2. **Before proposing solutions** - Run to ensure current state is clean
3. **When user mentions quality concerns** - Run immediately
4. **During active development** - User can request `/live-fix` at any time
5. **Before code-fix workflow** - Always run as prerequisite

## ⚠️ BLOCKING REQUIREMENT

**If ANY violations are found:**

1. **STOP all other work immediately**
2. **Report ALL violations to user**
3. **Get explicit approval to fix each violation**
4. **Fix ALL violations before proceeding**
5. **Re-run analysis to confirm clean state**

**NO WORK CONTINUES until ALL issues are resolved.**

## 📋 Usage Examples

**Current working files:**
```bash
cmd /c node docs\scripts\code-review-analyzer.js src\components\ShippingForm.tsx src\services\rate-calculator.ts
cmd /c node docs\scripts\code-size.js src\components\ShippingForm.tsx src\services\rate-calculator.ts
# Apply fixes if violations found:
cmd /c node docs\scripts\code-fix.js --console src\components\ShippingForm.tsx src\services\rate-calculator.ts
cmd /c node docs\scripts\code-fix.js --comments src\components\ShippingForm.tsx src\services\rate-calculator.ts
```

**All TypeScript files:**
```bash
cmd /c node docs\scripts\code-review-analyzer.js src\**\*.ts src\**\*.tsx
cmd /c node docs\scripts\code-size.js src\**\*.ts src\**\*.tsx
```

## ✅ Success Criteria

- ✅ Context refreshed with latest project knowledge
- ✅ Zero violations found in code review analysis
- ✅ All files pass size limits
- ✅ Clean state confirmed before continuing development

**ONLY when all checks pass can development work continue.**