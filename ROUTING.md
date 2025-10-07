# Routing Guide

This document explains the routing architecture and patterns used in the application.

## Overview

The project uses **Next.js 15 App Router** for both page routing and API routing. This provides:

- File-system based routing
- Server Components by default
- Built-in API routes
- Automatic code splitting
- TypeScript support

## Page Routes

### Current Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page with search |
| `/admin` | `app/admin/page.tsx` | Admin management interface |

### How It Works

Next.js App Router uses the filesystem to define routes with special files:

```
app/
├── layout.tsx         → Root layout (wraps all pages)
├── page.tsx           → / (root)
├── loading.tsx        → Global loading UI
├── error.tsx          → Global error boundary
├── global-error.tsx   → Root layout error handler
├── not-found.tsx      → Custom 404 page
├── globals.css        → Global styles
└── admin/
    ├── page.tsx       → /admin
    └── loading.tsx    → Admin loading state
```

### Special Route Files

Next.js 15 provides special file names for enhanced functionality:

#### `loading.tsx`
Automatically wraps the page in a React Suspense boundary and displays while content loads.

```typescript
// app/loading.tsx
import { CircularProgress } from '@mui/material';

export default function Loading() {
  return <CircularProgress />;
}
```

#### `error.tsx`
Catches errors in the route segment and displays a fallback UI. Must be a Client Component.

```typescript
// app/error.tsx
'use client';

export default function Error({ error, reset }: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

#### `not-found.tsx`
Displayed when a route doesn't exist or when `notFound()` is called.

```typescript
// app/not-found.tsx
export default function NotFound() {
  return <h2>Page Not Found</h2>;
}
```

#### `global-error.tsx`
Catches errors in the root layout. Must include its own `<html>` and `<body>` tags.

```typescript
// app/global-error.tsx
'use client';

export default function GlobalError({ error, reset }: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Critical Error</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
```

### Adding a New Page

To add a new page at `/about`:

1. Create the directory and file:
   ```bash
   mkdir app/about
   touch app/about/page.tsx
   ```

2. Add the component:
   ```typescript
   // app/about/page.tsx
   export default function AboutPage() {
     return (
       <div>
         <h1>About Us</h1>
         <p>This is the about page.</p>
       </div>
     );
   }
   ```

3. Access at http://localhost:3000/about

### Layouts

The root layout (`app/layout.tsx`) wraps all pages and provides:

- HTML structure
- Global providers (Theme, Modals, Emotion)
- Metadata (title, description)
- Global styles

To add a layout for a specific route:

```typescript
// app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav>{/* Admin navigation */}</nav>
      <main>{children}</main>
    </div>
  );
}
```

### Dynamic Routes

To create a dynamic route like `/courses/[id]`:

```typescript
// app/courses/[id]/page.tsx
interface CoursePageProps {
  params: { id: string };
}

export default function CoursePage({ params }: CoursePageProps) {
  return <div>Course ID: {params.id}</div>;
}
```

Access with: http://localhost:3000/courses/123

### Navigation Between Pages

#### Using Link Component

```typescript
import Link from 'next/link';

<Link href="/admin">Go to Admin</Link>
```

#### Programmatic Navigation

```typescript
'use client';
import { useRouter } from 'next/navigation';

export default function MyComponent() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/admin');
  };
  
  return <button onClick={handleClick}>Go to Admin</button>;
}
```

## API Routes

### Current API Endpoints

| Method | Endpoint | File | Description |
|--------|----------|------|-------------|
| GET | `/api/search` | `app/api/search/route.ts` | Search all entities |
| GET | `/api/admin/entities` | `app/api/admin/entities/route.ts` | List entities by type |
| GET | `/api/admin/detail` | `app/api/admin/detail/route.ts` | Get entity details |
| POST | `/api/admin/links` | `app/api/admin/links/route.ts` | Manage entity relationships |

### How API Routes Work

API routes are defined by creating a `route.ts` file:

```
app/
└── api/
    ├── search/
    │   └── route.ts       → /api/search
    └── admin/
        ├── entities/
        │   └── route.ts   → /api/admin/entities
        ├── detail/
        │   └── route.ts   → /api/admin/detail
        └── links/
            └── route.ts   → /api/admin/links
```

### Creating a New API Route

To add a new endpoint at `/api/users`:

1. Create the directory and file:
   ```bash
   mkdir -p app/api/users
   touch app/api/users/route.ts
   ```

2. Add the handler:
   ```typescript
   // app/api/users/route.ts
   import { NextResponse } from 'next/server';
   import prisma from '@/utils/prisma';

   export async function GET(request: Request) {
     try {
       const users = await prisma.user.findMany();
       return NextResponse.json(users);
     } catch (error) {
       return new NextResponse('Internal Server Error', { status: 500 });
     }
   }

   export async function POST(request: Request) {
     try {
       const data = await request.json();
       const user = await prisma.user.create({ data });
       return NextResponse.json(user);
     } catch (error) {
       return new NextResponse('Bad Request', { status: 400 });
     }
   }
   ```

3. Call from frontend:
   ```typescript
   const response = await fetch('/api/users');
   const users = await response.json();
   ```

### API Route Patterns

#### Query Parameters

```typescript
// GET /api/users?role=admin
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  
  const users = await prisma.user.findMany({
    where: { role: role || undefined },
  });
  
  return NextResponse.json(users);
}
```

#### Dynamic API Routes

```typescript
// app/api/users/[id]/route.ts
// GET /api/users/123
interface Context {
  params: { id: string };
}

export async function GET(request: Request, context: Context) {
  const user = await prisma.user.findUnique({
    where: { id: context.params.id },
  });
  
  if (!user) {
    return new NextResponse('Not Found', { status: 404 });
  }
  
  return NextResponse.json(user);
}
```

#### Request Body

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email } = body;
  
  // Validate
  if (!name || !email) {
    return new NextResponse('Missing required fields', { status: 400 });
  }
  
  // Process
  const user = await prisma.user.create({
    data: { name, email },
  });
  
  return NextResponse.json(user);
}
```

#### Response Types

```typescript
// JSON response
return NextResponse.json({ message: 'Success' });

// Plain text response
return new NextResponse('Success', { status: 200 });

// Error response
return new NextResponse('Not Found', { status: 404 });

// Redirect response
return NextResponse.redirect(new URL('/success', request.url));
```

## Modal-Based Navigation

While the app has traditional page routes, most navigation happens through a **modal stack system**:

### How It Works

1. User searches for an entity on the landing page
2. Clicks a result → Opens entity detail modal
3. Clicks a related entity in the modal → Opens another modal (stacked)
4. Can close modals one by one or all at once

### Implementation

The modal stack is managed by `ModalStackProvider`:

```typescript
// providers/ModalStackProvider.tsx
const { pushModal, popModal, popAllModals } = useModalStack();

// Open a modal
pushModal({
  id: entity.id,
  type: entity.type,
  code: entity.code,
  name: entity.name,
});

// Close top modal
popModal();

// Close all modals
popAllModals();
```

### Benefits

- No page reloads (better UX)
- Preserves navigation history
- Allows deep linking to related entities
- Maintains context (search results stay visible)

## Navigation Patterns

### Pattern 1: Landing Page → Search → Modal

```
User Flow:
/ → Search for "CSCI 1200" → Click result → Modal opens with course details
```

Implementation:
```typescript
// components/LandingPage.tsx
const handleEntityClick = (entity: Entity) => {
  pushModal({
    id: entity.id,
    type: entity.type,
    code: entity.code,
    name: entity.name,
  });
};
```

### Pattern 2: Modal → Related Entity → Stacked Modal

```
User Flow:
Course modal → Click related skill → Skill modal opens (stacked on top)
```

Implementation:
```typescript
// components/CourseDetail.tsx
const handleSkillClick = (skill: Entity) => {
  pushModal({
    id: skill.id,
    type: 'skill',
    code: skill.code,
    name: skill.name,
  });
};
```

### Pattern 3: Direct Page Navigation

```
User Flow:
/ → Click "Admin" in header → Navigate to /admin page
```

Implementation:
```typescript
// components/Header.tsx
import Link from 'next/link';

<Link href="/admin">Admin</Link>
```

## Future Routing Enhancements

### Planned Features

1. **User Profiles** - `/profile/[username]`
2. **Course Pages** - `/courses/[code]`
3. **Department Pages** - `/departments/[code]`
4. **Login/Signup** - `/auth/login`, `/auth/signup`
5. **Dashboard** - `/dashboard`
6. **Settings** - `/settings`

### Deep Linking to Modals

Future enhancement: Allow URLs to open specific modals:

```
/search?entity=course&id=abc123  → Opens course modal
```

Implementation approach:
```typescript
// app/page.tsx
export default function HomePage({ searchParams }: { searchParams: { entity?: string; id?: string } }) {
  useEffect(() => {
    if (searchParams.entity && searchParams.id) {
      // Open modal based on URL params
      pushModal({
        id: searchParams.id,
        type: searchParams.entity,
      });
    }
  }, [searchParams]);
}
```

## Best Practices

### 1. Use Server Components by Default

```typescript
// app/my-page/page.tsx (Server Component)
export default async function MyPage() {
  const data = await fetchData(); // Can use async/await directly
  return <div>{data}</div>;
}
```

### 2. Add 'use client' Only When Needed

```typescript
// components/Interactive.tsx (Client Component)
'use client';

import { useState } from 'react';

export default function Interactive() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 3. Use Loading States

```typescript
// app/courses/loading.tsx
export default function Loading() {
  return <div>Loading courses...</div>;
}
```

### 4. Handle Errors Gracefully

```typescript
// app/courses/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h1>Something went wrong!</h1>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 5. Add Metadata

```typescript
// app/about/page.tsx
export const metadata = {
  title: 'About Us',
  description: 'Learn more about our mission',
};

export default function AboutPage() {
  return <div>About Us</div>;
}
```

## Troubleshooting

### Route Not Found (404)

- Ensure `page.tsx` exists in the route folder
- Check spelling and case sensitivity
- Restart dev server: `yarn dev`

### API Route Not Working

- Ensure file is named `route.ts` (not `api.ts` or `handler.ts`)
- Check HTTP method matches (GET, POST, etc.)
- Verify request format (query params, body, etc.)

### Navigation Not Working

- Ensure you're using `next/link` for client-side navigation
- For programmatic navigation, use `next/navigation` (not `next/router`)
- Check that target route exists

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

---

**For more information, see [ARCHITECTURE.md](./ARCHITECTURE.md)**
