---
description: Load schema tables for authentication and user management
---

# Schema for Authentication & User Management

This workflow loads the essential schema information for building authentication systems and user management features.

## Load Users Table

// turbo

```bash
cmd /c node docs/scripts/schema-query.js --table users
```

## Load User Roles

// turbo

```bash
cmd /c node docs/scripts/schema-query.js --table enum_roles
```

## Load User Specifications Relationship

// turbo

```bash
cmd /c node docs/scripts/schema-query.js --table specifications
```

## Usage

This workflow provides schema information for:

- **User authentication** (users table with auth fields)
- **Role-based access control** (enum_roles for permissions)
- **User-owned content** (specifications relationship)
- **User profile management** (user fields and validation)

## AI Instructions

After running these commands, you'll have the schema information to:

- Build user registration and login forms
- Implement role-based permissions (Admin, Expert, Public)
- Handle user-owned specifications and content
- Apply proper authentication validation rules
- Design user profile management interfaces

## Authentication Flow Schema

The loaded schema supports:

- Magic link authentication (email-based)
- Role-based authorization
- User-owned content relationships
- Profile validation and management
