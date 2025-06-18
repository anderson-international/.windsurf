---
description: Load API and backend development documentation
---

# API Development Context

## When to Use
When building API routes, database queries, or backend logic.

## Load Sequence

// turbo
1. Load API development documents with dependencies using graph intelligence
```
cmd /c node scripts/smart-context-loader.js --workflow=docs-api
```

**Graph-based loading includes:**
- Business Context + feature requirements dependencies
- API Design patterns + authentication relationships
- Authentication strategies + role-based access patterns
- Database patterns + query optimization context

## Key Context Gained
- **Business context**: User roles (Admin vs Reviewer), scale requirements (20 users, 600 products)
- **Authentication strategy**: Magic link auth vs development dropdown, role-based access
- **Next.js API routes**: RESTful patterns and organization
- **Error handling**: Consistent error responses and status codes
- **Database**: Prisma ORM patterns and query optimization
- **Validation**: Input validation and sanitization
- **Access control**: Role-specific permissions and route protection

## Patterns Available
✅ Next.js API route structure
✅ HTTP status code standards
✅ Error response formatting
✅ Prisma query patterns
✅ Role-based access control
✅ Input validation with Zod

## Validation Check

// turbo
```bash
cmd /c node scripts/graph-analytics.js --health
```

Quick health check to ensure API-related documentation is properly linked and accessible.

**Ready for API development tasks**
