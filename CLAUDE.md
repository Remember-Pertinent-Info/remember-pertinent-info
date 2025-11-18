# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Remember Pertinent Information** is a Next.js 15 web application that helps students learn course prerequisites, skills, and concepts. The platform allows educators to create learning modules and helps students understand course materials and gauge their preparedness.

## Technology Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5
- **UI:** Material-UI v7 + Emotion + Tailwind CSS 4
- **Backend:** Next.js API Routes (Node.js)
- **Database:** PostgreSQL with Prisma ORM v6
- **Package Manager:** Yarn (NOT npm)

## Essential Commands

### Development
```bash
# Install dependencies
yarn install

# Database setup (required before first run)
yarn prisma:generate    # Generate Prisma client
yarn prisma:migrate     # Run migrations
yarn prisma:seed        # (Optional) Seed sample data

# Start development server with Turbopack
yarn dev

# Type checking
yarn tsc:check

# Linting
yarn lint
```

### Building
```bash
yarn build    # Production build
yarn start    # Start production server
```

### Database Operations
```bash
yarn prisma:generate    # Regenerate Prisma client after schema changes
yarn prisma:push        # Push schema changes without migrations
yarn prisma:seed        # Populate database with sample data
```

## Architecture Overview

### Flat Root-Level Structure
The project uses a **flat, root-level architecture** (no `src/` folder) following Next.js 15 App Router conventions:

```
/
├── app/                # Next.js App Router (pages & API routes)
├── components/         # React UI components
├── providers/          # React Context (Theme, Modals)
├── utils/              # Utility functions (Prisma client, etc.)
├── theme/              # MUI theme configuration
├── generated/          # Auto-generated Prisma client
├── prisma/             # Database schema & migrations
└── scripts/            # Utility scripts
```

### Path Aliases
ALWAYS use `@/` imports instead of relative paths:
```typescript
// ✅ Correct
import { Header } from '@/components/Header';
import prisma from '@/utils/prisma';

// ❌ Avoid
import { Header } from '../../components/Header';
```

### Component Architecture
- **Server Components by default** - Only add `'use client'` when interactivity is needed
- **Modal Stack System** - Entity details open in stacked modals (managed by `ModalStackProvider`)
- **Theme Support** - Light/dark mode via `ThemeProvider`

## Data Model

The application manages 6 core entity types with many-to-many relationships:

1. **Concept** - High-level learning concepts (e.g., "Fourier Transform")
2. **Skill** - Specific skills (e.g., "Matrix Multiplication")
3. **Course** - RPI courses (e.g., "CSCI 1200") - data scraped from QUACS
4. **Track** - Course tracks/specializations within majors
5. **Major** - Academic degree programs
6. **Department** - Academic departments

All entities follow this schema pattern:
```typescript
{
  id: string;          // cuid primary key
  code: string;        // unique short code (e.g., "CSCI1200")
  name: string;        // display name
  description?: string; // optional description
}
```

### Prisma Client Usage
- Import from `@/utils/prisma` (singleton pattern to prevent connection exhaustion)
- ALWAYS run `yarn prisma:generate` after modifying `prisma/schema.prisma`
- Generated types are in `generated/prisma/`

## API Routes

RESTful endpoints in `app/api/`:

- **GET /api/search** - Search across all entities
- **GET /api/admin/entities** - List all entities by type
- **GET /api/admin/detail?type={type}&id={id}** - Get entity details with relationships
- **POST /api/admin/links** - Create/remove relationships between entities

## Key Coding Conventions

### TypeScript
- Use `interface` for object types (not `type` unless necessary)
- Explicit return types for all functions
- Strict mode enabled
- Prefer `const` over `let`, never `var`

### React
- Functional components with hooks only (no class components)
- Server Components by default
- Add `'use client'` directive only when needed for:
  - useState, useEffect, or other React hooks
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs

### Naming Conventions
- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **Next.js special files:** lowercase (e.g., `page.tsx`, `layout.tsx`, `route.ts`)
- **Files:** Match component name exactly

### Styling
- **Primary:** Material-UI components with `sx` prop
- **Secondary:** Tailwind CSS utility classes
- **Theme:** Always use MUI theme values for colors/spacing/breakpoints (defined in `theme/theme.ts`)

## Important Notes

### Do
- Use the App Router (NOT Pages Router)
- Use `yarn` for all package operations
- Use Prisma for ALL database operations (never raw SQL)
- Follow the flat root-level structure
- Add `'use client'` only when truly needed
- Write explicit types

### Don't
- Don't use `npm` - always use `yarn`
- Don't use class components
- Don't use `var`
- Don't use relative imports when `@/` alias is available
- Don't create a `src/` directory
- Don't use the Pages Router (`pages/` directory)

## Current Development Phase

The project is actively developing these features:
1. Interfacing with Course Scaffold (previous RCOS project)
2. Building course framework and user interface
3. Implementing user posts (quizzes, videos, text-based content)
4. Syncing database with RPI course offerings from QUACS

### Planned Features
- RPI SSO integration with DUO verification
- Professor CMS for creating interactive content modules
- Markdown-based lecture notes with inline quizzes
- User progress tracking linked to SSO login

## Special Files (Next.js App Router)

- `page.tsx` - Route page component (required)
- `layout.tsx` - Shared layout wrapper
- `loading.tsx` - Loading UI (Suspense boundary)
- `error.tsx` - Error boundary
- `not-found.tsx` - Custom 404 page
- `route.ts` - API route handler

## Troubleshooting

- **Database errors:** Check `DATABASE_URL` in `.env` file (see `.env.example`)
- **Type errors after schema changes:** Run `yarn prisma:generate`
- **Build errors:** Delete `.next` folder and rebuild
- **Import errors:** Verify you're using `@/` path alias

## Additional Documentation

- `ARCHITECTURE.md` - Detailed architecture and design decisions
- `ONBOARDING.md` - Developer onboarding guide with code examples
- `PROJECT_STRUCTURE.md` - Next.js 15 structure and conventions
- `ROUTING.md` - Routing patterns and API endpoints
- `MIGRATION_GUIDE.md` - Guide for handling structure changes
- `README.md` - Project overview and quick start
