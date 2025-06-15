---
description: Peform a Complete Codebase Code Review Using AI-Enhanced Documentation
---

# AI-Enhanced Complete Codebase Code Review

## Phase 1: AI-Accelerated Pre-Review Discovery (MANDATORY)

### 1.1 Setup & AI Compliance Foundation
- [ ] **⚠️ FIRST: Read `docs/guides/ai-coding-handbook.md`** - Non-negotiable coding standards
  - File size limits (150/200/100 line limits)
  - TypeScript return type requirements  
  - React performance patterns (React.memo, useCallback, useMemo)
- [ ] **Read `docs/ai-index.md`** for prioritization (⚠️ CRITICAL → 🔥 HIGH → ⚙️ MEDIUM → 📝 LOW)
- [ ] **List all `.tsx` files** and **`.ts` files** in the project
- [ ] **Identify current phase** from `docs/our-plan.md`
- [ ] **Confirm review scope** and document total file count

### 1.2 AI-Enhanced Documentation Analysis
- [ ] **Use AI_NAVIGATION blocks** from critical documentation for rapid context
- [ ] **Extract compliance patterns** from AI_VALIDATION blocks in:
  - `ai-coding-handbook.md` - **PRIMARY compliance source**
  - `code-quality-standards.md` - TypeScript/ESLint
  - `best-practices.md` - File size limits
  - `react-patterns.md` - Performance patterns
  - `form-management.md` - React Hook Form + Zod
  - `prevent-react-effect-loops.md` - Effect safety
  - `api-design.md` - API/error handling

## Phase 2: AI-Validated Standards Compliance

⚠️ **CRITICAL INSTRUCTION: Use `ai-coding-handbook.md` as the primary validation source. Each section below must check ALL relevant files, regardless of results from previous sections**

### 2.1 File Size Validation (⚠️ CRITICAL)
**Reference**: `ai-coding-handbook.md` Section 1 - File Size Limits
**Check ALL `.tsx` and `.ts` files discovered in Phase 1:**
- [ ] **Component files ≤150 lines**: Flag violations from ALL `.tsx` component files
- [ ] **Page files ≤200 lines**: Flag violations from ALL page `.tsx` files  
- [ ] **Utility files ≤100 lines**: Flag violations from ALL `.ts` utility files

**Handbook Requirement**: Files exceeding limits must be refactored immediately - no exceptions.

---

### 2.2 TypeScript Compliance (⚠️ CRITICAL)
**Reference**: `ai-coding-handbook.md` Section 2 - TypeScript Standards
⚠️ **Check ALL `.tsx` and `.ts` files from Phase 1 - DO NOT limit to only files that failed size checks**

Use AI_VALIDATION patterns from `ai-coding-handbook.md`:
- [ ] **Function return types**: Check ALL files for `/function\s+\w+\([^)]*\):\s*\w+/`
- [ ] **Arrow function return types**: Check ALL files for `/=\s*\([^)]*\)\s*:\s*\w+\s*=>/`
- [ ] **No 'any' usage**: Check ALL files - `/:\s*any\b/` should return no matches
- [ ] **Event handler typing**: Check ALL files - All handlers have `: void`

**Handbook Requirement**: ESLint `@typescript-eslint/explicit-function-return-type: error` - Zero tolerance for missing return types.

---

### 2.3 React Performance Patterns (🔥 HIGH)
**Reference**: `ai-coding-handbook.md` Section 3 - React Performance  
⚠️ **Check ALL `.tsx` React component files from Phase 1 - DO NOT limit to only files that failed previous checks**

**MANDATORY: Review EVERY SINGLE `.tsx` file - Do NOT assume any files are "key" or "important" - check ALL files systematically**

Use AI_VALIDATION patterns from `ai-coding-handbook.md`:
- [ ] **React.memo**: Search ALL `.tsx` files for `/React\.memo\(/` - list every file checked, not just matches
- [ ] **useCallback**: Search ALL `.tsx` files for `/useCallback\(/` - examine every component file individually  
- [ ] **useMemo**: Search ALL `.tsx` files for `/useMemo\(/` - verify each file has proper derived state patterns
- [ ] **Effect safety**: Check ALL `.tsx` files - examine every useEffect dependency array for unstable references

**Handbook Requirement**: All functions that update state or are passed as props/dependencies MUST use useCallback. All derived state MUST use useMemo.

**Process Requirement**: Must explicitly list each `.tsx` file reviewed, showing file-by-file analysis rather than summarizing "key components"

---

### 2.4 Form Management (🔥 HIGH)
**Reference**: `ai-coding-handbook.md` Section 4 - Form Standards
⚠️ **Check ALL form-related `.tsx` files from Phase 1 - DO NOT limit to only files that failed previous checks**

Use AI_VALIDATION patterns from `ai-coding-handbook.md` and `form-management.md`:
- [ ] **useForm usage**: Check ALL form files for `/const.*=.*useForm</`
- [ ] **handleSubmit wrapper**: Check ALL form files for `/handleSubmit\(/`
- [ ] **Field registration**: Check ALL form files for `/\{\.\.\.register\(/`
- [ ] **Zod integration**: Check ALL form files for `/zodResolver\(/`

**Handbook Requirement**: React Hook Form + Zod schema validation mandatory for all forms.

## Phase 3: Code Quality Assessment

### 3.1 Standards Compliance (Based on AI Handbook)
- [ ] **Import organization**: React → Third-party → Local with blank lines (`ai-coding-handbook.md` Section 5)
- [ ] **Performance optimization**: Image optimization, lazy loading, memoization
- [ ] **Error handling**: Fail-fast (4xx), retry with backoff (5xx), error boundaries
- [ ] **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

### 3.2 Architecture Validation
- [ ] **Component architecture**: Single responsibility, clean interfaces
- [ ] **Mobile-first design**: CSS Modules, responsive breakpoints, touch targets
- [ ] **Navigation patterns**: Next.js Link usage, SPA preservation
- [ ] **Database integration**: Transactions, enum caching, Server Actions

## Phase 4: Automated Compliance Scoring

### 4.1 Quality Metrics (0-10 scale) - **AI Handbook Weighted**
- [ ] **File Size Compliance**: ___/10 (⚠️ CRITICAL from handbook - 30% weight)
- [ ] **TypeScript Standards**: ___/10 (⚠️ CRITICAL from handbook - 25% weight)
- [ ] **React Performance**: ___/10 (🔥 HIGH from handbook - 20% weight)
- [ ] **Architecture**: ___/10 (responsibility, composition - 10% weight)
- [ ] **Error Handling**: ___/10 (fail-fast, recovery, UX - 10% weight)
- [ ] **Accessibility**: ___/10 (semantic HTML, ARIA, keyboard - 5% weight)

**Overall Score**: ___/10 (AI Handbook compliance = 75% of total score)

### 4.2 Risk Assessment & Recommendations
- [ ] **⚠️ CRITICAL**: AI Handbook violations - Must fix before proceeding
- [ ] **🔥 HIGH**: Performance/standards gaps - Address soon
- [ ] **⚙️ MEDIUM**: Architecture improvements - Future iterations
- [ ] **📝 LOW**: Nice-to-have enhancements

## Phase 5: ⚠️ CRITICAL - Project Documentation Update

### 5.1 Update Project Plan (MANDATORY)
- [ ] **⚠️ CRITICAL: Update `docs/our-plan.md`** once all AI Handbook violations resolved
- [ ] **Document compliance status** with `ai-coding-handbook.md` standards
- [ ] **Record findings** and **architectural decisions**

**Completion Criteria:** All AI Handbook requirements met, critical violations resolved, standards documented.

## Anti-Patterns to Avoid
- **Skipping AI Handbook** → Always read handbook first for compliance baseline
- **Manual doc reading** → Use AI_NAVIGATION blocks
- **Ignoring AI patterns** → Leverage regex validation from handbook
- **Missing priorities** → Follow handbook urgency indicators
- **Pattern inconsistency** → Use handbook as single source of truth

## Usage Instructions
1. **Start with AI Coding Handbook** for non-negotiable standards
2. **Use AI Index** for prioritization
3. **Use AI_NAVIGATION/AI_VALIDATION blocks** for automation
4. **Follow urgency indicators** (⚠️→🔥→⚙️→📝)
5. **Cross-reference efficiently** using navigation guidance

## Key Documentation Files (Priority Order)
**Primary**: `ai-coding-handbook.md` (single source of truth for standards)
**Core**: `ai-index.md`, `architectural-guidelines.md`, `code-quality-standards.md`, `best-practices.md`
**Patterns**: `react-patterns.md`, `form-management.md`, `prevent-react-effect-loops.md`, `api-design.md`
**Implementation**: `ui-ux-design.md`, `ui-ux-patterns.md`, `performance-optimization.md`