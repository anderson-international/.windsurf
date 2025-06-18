---
description: Load API and backend development documentation
---

# API Development Context

## When to Use
When building API routes, database queries, or backend logic.

## Load Sequence

// turbo
1. Load business context for user roles
```
Load: docs/project/business-context.md
```

// turbo
2. Load API design patterns
```
Load: docs/concerns/api-design.md
```

// turbo
3. Load authentication strategies
```
Load: docs/concerns/authentication.md
```

// turbo
4. Load database patterns
```
Load: docs/concerns/database.md
```

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

**Ready for API development tasks**
