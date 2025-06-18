---
description: Load UI/UX design and styling documentation
---

# UI/UX Development Context

## When to Use
When styling components, implementing design patterns, or building layouts.

## Load Sequence

// turbo
1. Load UI development documents with dependencies using graph intelligence
```
cmd /c node scripts/smart-context-loader.js --workflow=docs-ui
```

**Graph-based loading includes:**
- Technical Stack + implementation dependencies
- UI/UX Design specifications + pattern relationships
- UI/UX Implementation patterns + design system context
- React patterns + performance optimization context

## Key Context Gained
- **Technical stack**: Next.js App Router, CSS Modules, component boundaries
- **Mobile-first design**: Touch-friendly, progressive enhancement
- **Dark theme**: Brand-matching color palette and CSS variables
- **Component styling**: CSS Modules and scoped styling patterns
- **Responsive patterns**: 8px grid system and breakpoints
- **React optimization**: Server vs client components, performance patterns
- **Accessibility**: ARIA labels and keyboard navigation

## Design System Available
✅ Dark theme color palette
✅ 8px grid system
✅ Mobile-first breakpoints
✅ Touch-friendly component sizes
✅ CSS Modules organization
✅ Accessibility patterns

This step loads relevant documents based on the document graph for UI workflow.

## Validation Check

// turbo
```bash
cmd /c node scripts/graph-analytics.js --health
```

Quick health check to ensure UI-related documentation is properly linked and accessible.

**Ready for UI/UX development tasks**
