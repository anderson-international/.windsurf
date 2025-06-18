---
description: Read all the docs following optimized AI ingestion workflow
---

# Optimized AI Documentation Ingestion Workflow

## Phase 1: AI-Guided Discovery & Prioritization (⚠️ MANDATORY FIRST)

1. **FIRST: Document Relationship Graph**: Review `docs/document-graph.json` for the overview of document relationships
   - Understand document hierarchy and interconnections
   - Identify critical path documents

2. **SECOND: AI Core Documents** (in this exact order):
   - Read `docs/ai-index.md` for AI prioritization guidance
      - Review AI_NAVIGATION and AI_SUMMARY blocks
      - Identify urgency levels: ⚠️ CRITICAL → 🔥 HIGH → ⚙️ MEDIUM → 📝 LOW
   - Read `docs/guides/ai-coding-handbook.md` for non-negotiable coding standards
      - File size limits (150/200/100 line limits)
      - TypeScript return type requirements
      - React performance patterns
   - Read `docs/ai-validation-registry.md` for centralized validation patterns
      - Critical validation patterns for automated compliance
      - Pattern IDs and priority levels
   - Read `docs/ai-compliance-matrix.md` for compliance requirements
      - Compliance categories by severity
      - Validation patterns

### 1.2 Complete Documentation Analysis
- [ ] **Verify metadata headers** in all documents
- [ ] **Identify AI_NAVIGATION and AI_SUMMARY blocks** in all documents
- [ ] **Catalog standardized cross-references**

## Phase 2: CRITICAL Priority Documents (⚠️ CRITICAL - Est. 60 minutes)
*Essential documents for all code reviews - Read these for every task*

**Checkpoint**: Confirm you understand AI navigation before proceeding to critical documents.

Process these 5 documents in exact order using AI enhancements:
1. **[AI Coding Handbook](guides/ai-coding-handbook.md)** (7 min) - Mandatory coding standards and validation patterns
2. **[Best Practices](guides/best-practices.md)** (10 min) - File size limits, component organization, simplicity principles  
3. **[Business Context](project/business-context.md)** (8 min) - Project scope, user roles, authentication strategy
4. **[Feature Requirements](project/feature-requirements.md)** (12 min) - Detailed specifications and validation rules
5. **[Technical Stack](project/technical-stack.md)** (12 min) - Next.js, Prisma ORM, CSS Modules, deployment strategy

**For each document:**
- [ ] **Read AI_NAVIGATION blocks** for rapid context understanding
- [ ] **Extract key compliance patterns** from AI_VALIDATION blocks  
- [ ] **Follow cross-reference guidance** efficiently
- [ ] **Document interconnections** between critical files

**Checkpoint**: Confirm understanding of critical documents before proceeding to high priority.

## Phase 3: HIGH Priority Documents (🔥 HIGH - Est. 90 minutes)
*Key implementation patterns and strategies*

Process these 8 documents using established context:
6. **[Code Quality Standards](guides/code-quality-standards.md)** (8 min) - ESLint, TypeScript, and Prettier configuration
7. **[React Patterns](guides/react-patterns.md)** (12 min) - Hook usage, performance optimization, memo patterns
8. **[Architectural Guidelines](guides/architectural-guidelines.md)** (15 min) - Component structure, single responsibility
9. **[Database-Form Integration](guides/database-form-integration.md)** (22 min) - Schema-driven form development patterns
10. **[API Design](concerns/api-design.md)** (18 min) - RESTful patterns, error handling, Shopify integration
11. **[Authentication](concerns/authentication.md)** (8 min) - Magic link auth, role-based access control
12. **[Database](concerns/database.md)** (10 min) - Prisma ORM patterns, transaction handling
13. **[UI/UX Design](project/ui-ux-design.md)** (15 min) - Mobile-first design, dark theme, wizard patterns

**For each document:**
- [ ] **Leverage navigation context** from previous readings
- [ ] **Use cross-reference maps** to connect related information
- [ ] **Identify pattern relationships** across documents
- [ ] **Build comprehensive understanding** of high-priority areas

**Checkpoint**: Confirm comprehensive understanding of high-priority patterns before proceeding to medium priority.

## Phase 4: MEDIUM Priority Documents (⚙️ MEDIUM - Est. 70 minutes)
*Specialized guidance and implementation details*

Process these 6 documents using established context:
14. **[Form Management](concerns/form-management.md)** (15 min) - React Hook Form + Zod validation strategies
15. **[Prevent React Effect Loops](pitfalls/prevent-react-effect-loops.md)** (15 min) - useEffect anti-patterns and fixes
16. **[Prevent Lint Issues](pitfalls/prevent-lint-issues.md)** (12 min) - Common ESLint/TypeScript error prevention
17. **[UI/UX Patterns](concerns/ui-ux-patterns.md)** (10 min) - Component implementation and accessibility patterns
18. **[Performance Optimization](concerns/performance-optimization.md)** (8 min) - Frontend/backend optimization strategies  
19. **[Testing Strategy](concerns/testing-strategy.md)** (10 min) - Testing approaches and coverage patterns

**For each document:**
- [ ] **Process remaining files** using established context
- [ ] **Complete cross-reference network** understanding
- [ ] **Validate comprehensive coverage** of all documentation

**Checkpoint**: Validate comprehensive understanding of medium priority areas before proceeding to final phase.

## Phase 5: LOW Priority Documents (📝 LOW - Est. 15 minutes)
*Infrastructure and deployment context*

20. **[Deployment Environment](concerns/deployment-environment.md)** (15 min) - PaaS deployment and environment configuration

## Phase 6: AI-Enhanced Synthesis (Est. 30 minutes)

### 6.1 Pattern Integration
- [ ] **Synthesize AI_VALIDATION patterns** across documents
- [ ] **Map compliance requirements** to implementation areas
- [ ] **Identify potential conflicts** or inconsistencies
- [ ] **Document automated validation opportunities**

### 6.2 Cross-Reference Network Analysis
- [ ] **Verify all cross-references followed**
- [ ] **Map interconnected documentation areas**
- [ ] **Identify missing links** or documentation gaps
- [ ] **Confirm holistic understanding**

**Final Checkpoint**: Confirm complete documentation mastery before proceeding with development tasks.

## AI-Enhanced Efficiency Tips

### ✅ Leverage Enhanced AI Features
- **AI_NAVIGATION blocks** → Rapid context with reading priority, focus, compliance points, cross-refs
- **AI_SUMMARY blocks** → Concise document summary with key requirements
- **Standardized metadata headers** → Quick document assessment (status, compliance level)
- **Contextual cross-references** → Tooltips providing relationship context
- **Document relationship graph** → Visual map of documentation connections
- **Centralized validation registry** → Single source for all validation patterns
- **Progressive detail structure** → Executive Summary → Key Principles → Detailed Guidance

### ❌ Avoid Manual Anti-Patterns
- **Sequential reading** → Use AI prioritization instead
- **Ignoring AI_NAVIGATION/AI_SUMMARY blocks** → Missing rapid context opportunities
- **Manual cross-referencing** → Use tooltips and document graph for efficiency
- **Equal priority treatment** → Follow urgency indicators
- **Skipping validation patterns** → Miss automated compliance opportunities
- **Ignoring standardized structure** → Miss progressive detail opportunities

## Expected Outcomes

After completion, you should have:
- [ ] **Complete understanding** of all documentation files
- [ ] **AI_NAVIGATION mastery** for rapid context building
- [ ] **AI_SUMMARY comprehension** for key document insights
- [ ] **Validation pattern mastery** from centralized registry
- [ ] **Cross-reference network comprehension** via document graph and tooltips
- [ ] **Priority-based knowledge** emphasizing critical vs. low-priority areas
- [ ] **Progressive detail understanding** from standardized document structure
- [ ] **Implementation readiness** with clear guidance for development phases