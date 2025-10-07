# Project Structure and Organization

This document details the folder and file conventions used in this Next.js 15 App Router project, following official Next.js recommendations.

## Top-level Folders

Top-level folders organize the application's code and static assets:

| Folder | Purpose |
|--------|---------|
| `app/` | App Router - pages, layouts, and API routes |
| `public/` | Static assets served at the root URL |
| `components/` | Reusable React UI components |
| `providers/` | React Context providers |
| `utils/` | Utility functions and helpers |
| `theme/` | MUI theme configuration |
| `prisma/` | Database schema and migrations |
| `scripts/` | Build and maintenance scripts |
| `generated/` | Auto-generated code (Prisma client) |

## Top-level Files

Configuration and essential files at the root level:

| File | Purpose |
|------|---------|
| **Next.js** | |
| `next.config.ts` | Configuration file for Next.js |
| `package.json` | Project dependencies and scripts |
| `.env` | Environment variables (not committed) |
| `.env.example` | Example environment variables |
| `.gitignore` | Git files and folders to ignore |
| `tsconfig.json` | TypeScript configuration |
| **Styling** | |
| `postcss.config.mjs` | PostCSS configuration |
| **Linting** | |
| `eslint.config.mjs` | ESLint configuration |

## App Directory Structure

The `app/` directory uses file-system based routing with special files:

```
app/
├── layout.tsx              # Root layout (required)
├── page.tsx                # Home page (/)
├── loading.tsx             # Global loading UI
├── error.tsx               # Global error boundary
├── global-error.tsx        # Root layout error handler
├── not-found.tsx           # Custom 404 page
├── globals.css             # Global styles
├── favicon.ico             # Favicon
├── admin/                  # Admin route (/admin)
│   ├── page.tsx            # Admin page
│   └── loading.tsx         # Admin loading state
└── api/                    # API routes
    ├── search/
    │   └── route.ts        # Search API endpoint
    └── admin/
        ├── entities/
        │   └── route.ts    # List entities
        ├── detail/
        │   └── route.ts    # Get entity details
        └── links/
            └── route.ts    # Manage relationships
```

## Special Route Files

### Required Files

- **`layout.tsx`** - Root layout that wraps all pages. Must include `<html>` and `<body>` tags.
- **`page.tsx`** - Defines a route as publicly accessible.

### Optional Enhancement Files

- **`loading.tsx`** - Loading UI shown during page transitions (React Suspense boundary)
- **`error.tsx`** - Error boundary for handling runtime errors with recovery
- **`not-found.tsx`** - Custom 404 page for missing routes
- **`global-error.tsx`** - Catches errors in the root layout itself

### API Routes

- **`route.ts`** - API endpoint handler (supports GET, POST, PUT, DELETE, etc.)

## Component Organization

Components are organized at the root level for simplicity:

```
components/
├── Header.tsx              # Application header/navbar
├── LandingPage.tsx         # Home page content
├── SearchBar.tsx           # Search input component
├── SearchResults.tsx       # Search results display
├── EntityModal.tsx         # Modal for entity details
├── ConceptDetail.tsx       # Concept-specific details
├── SkillDetail.tsx         # Skill-specific details
├── CourseDetail.tsx        # Course-specific details
├── TrackDetail.tsx         # Track-specific details
├── DepartmentDetail.tsx    # Department-specific details
├── MajorDetail.tsx         # Major-specific details
├── EmotionRegistry.tsx     # Emotion SSR registry
└── index.ts                # Component exports
```

## Routing Patterns

### Static Routes

Created by adding a `page.tsx` file to a folder:

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <h1>About</h1>;
}
```

Accessible at: `/about`

### Dynamic Routes

Use square brackets for dynamic segments:

```typescript
// app/blog/[slug]/page.tsx
export default async function BlogPost({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  return <h1>Post: {slug}</h1>;
}
```

Accessible at: `/blog/my-post`, `/blog/another-post`, etc.

### Nested Routes

Create nested folders for nested routes:

```
app/
└── blog/
    ├── page.tsx              # /blog
    └── [slug]/
        └── page.tsx          # /blog/[slug]
```

### Route Groups

Organize routes without affecting the URL by using parentheses:

```
app/
└── (marketing)/
    ├── about/
    │   └── page.tsx          # /about (not /marketing/about)
    └── contact/
        └── page.tsx          # /contact (not /marketing/contact)
```

### Private Folders

Prefix folders with underscore to exclude them from routing:

```
app/
└── _components/              # Not accessible as a route
    └── PrivateComponent.tsx
```

## Component Hierarchy

Special files are rendered in this order:

1. `layout.tsx`
2. `template.tsx` (if present)
3. `error.tsx` (React error boundary)
4. `loading.tsx` (React suspense boundary)
5. `not-found.tsx` (React error boundary)
6. `page.tsx` or nested `layout.tsx`

## State Management

### Global State

- **Theme**: `ThemeProvider` - MUI theme and light/dark mode
- **Modals**: `ModalStackProvider` - Modal stack for entity details

### Local State

- React `useState` and `useEffect` hooks for component state
- Server Components for data fetching
- Client Components (with `'use client'`) for interactivity

## Project Organization Strategy

This project uses **"Store project files outside of app"** strategy:

- `app/` directory is used purely for routing (pages and API routes)
- Shared code lives in root-level folders (`components/`, `utils/`, `providers/`, etc.)
- This keeps routing clear and separates concerns

### Benefits

1. **Clear separation** between routing and application logic
2. **Easy discovery** of reusable components
3. **Simple imports** using the `@/` path alias
4. **Scalable structure** as the app grows

## Path Aliases

TypeScript path mapping enables clean imports:

```typescript
// Instead of: import { Header } from '../../../components/Header'
import { Header } from '@/components/Header';

// Works for all top-level folders
import prisma from '@/utils/prisma';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { theme } from '@/theme/theme';
```

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Best Practices

### 1. Use Special Files for Enhanced UX

- Add `loading.tsx` for data-heavy pages
- Add `error.tsx` for pages that might fail
- Customize `not-found.tsx` for brand consistency

### 2. Server Components by Default

All components in `app/` are Server Components unless marked with `'use client'`:

```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component (for interactivity)
'use client';
export default function Interactive() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 3. Colocation

You can colocate non-route files in `app/` - they won't be routable unless you add `page.tsx`:

```
app/
└── dashboard/
    ├── page.tsx              # ✅ Routable: /dashboard
    ├── DashboardHeader.tsx   # ❌ Not routable (no page.tsx)
    └── utils.ts              # ❌ Not routable (no page.tsx)
```

### 4. Consistent Naming

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL.ts`)
- **Next.js special files**: lowercase (e.g., `page.tsx`, `layout.tsx`)

## Future Enhancements

As the project grows, consider:

1. **Route Groups** for organizing related pages
2. **Parallel Routes** for complex layouts (using `@folder` convention)
3. **Intercepting Routes** for modals (using `(.)folder` convention)
4. **Middleware** for authentication and request handling
5. **Instrumentation** for monitoring and observability

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Project Structure Guide](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
