---
description: Guidance for checking for canonical types during code fix sessions
---

## Type Creation Protocol - MANDATORY VERIFICATION**: Before creating ANY new interface or type:

### 3-Step Protocol

1. **Search for Existing Types** (REQUIRED):
   ```bash
   cmd /c npx grep-search "interface.*ApiResponse|type.*ApiResponse" --include="*.ts" --include="*.tsx"
   cmd /c npx grep-search "interface.*[YourTypeName]|type.*[YourTypeName]" --include="*.ts" --include="*.tsx"
   ```

2. **Check Canonical Locations** (REQUIRED):
   - `types/index.ts` - Global type definitions
   - `lib/api/utils.ts` - API utility types  
   - `types/specification.ts` - Domain-specific types
   - Service files in `lib/services/` - Service-specific types

3. **Verification Checklist** (ALL MUST PASS):
   - [ ] Searched codebase with specific grep commands
   - [ ] Reviewed canonical type locations  
   - [ ] Confirmed no existing type matches functionality
   - [ ] Confirmed no existing type can be extended/composed
   - [ ] If similar type exists, documented why extension isn't viable

4. **FAIL-FAST Rule**: If ANY existing type covers >70% of your use case, you MUST extend it rather than create duplicate.

