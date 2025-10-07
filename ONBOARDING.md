# Developer Onboarding Guide

Welcome to the **Remember Pertinent Information** project! This guide will help you get up and running quickly.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ (check with `node --version`)
- **Yarn** 1.22+ (check with `yarn --version`)
- **PostgreSQL** 14+ (or access to a PostgreSQL database)
- **Git** (check with `git --version`)
- A code editor (we recommend VS Code)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Remember-Pertinent-Info/remember-pertinent-info.git
cd remember-pertinent-info
```

### 2. Install Dependencies

```bash
yarn install
```

This will install all necessary packages defined in `package.json`.

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env  # If example exists
# OR create manually:
touch .env
```

Add the following to `.env`:

```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Optional: Next.js configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Replace** `username`, `password`, and `database_name` with your PostgreSQL credentials.

### 4. Set Up the Database

#### Generate Prisma Client

```bash
yarn prisma:generate
```

This creates TypeScript types from your Prisma schema.

#### Run Migrations

```bash
yarn prisma:migrate
```

This creates the necessary database tables.

#### Seed the Database (Optional)

```bash
yarn prisma:seed
```

This populates the database with sample data for development.

### 5. Start the Development Server

```bash
yarn dev
```

The app will be available at **http://localhost:3000**

## Project Structure Overview

```
/
├── app/                # Next.js App Router (pages & API routes)
├── components/         # React components
├── providers/          # React Context providers
├── utils/              # Utility functions
├── theme/              # MUI theme configuration
├── generated/          # Generated Prisma client (auto-generated)
├── prisma/             # Database schema & migrations
├── public/             # Static assets
└── scripts/            # Utility scripts
```

**Key Points:**
- All source code is at the **root level** (no `src/` directory)
- Use `@/` alias for imports (e.g., `@/components/Header`)
- Pages go in `app/` following Next.js App Router conventions
- API routes go in `app/api/`

## Development Workflow

### Running the Development Server

```bash
yarn dev
```

- Uses Turbopack for fast builds
- Hot Module Replacement (HMR) enabled
- Runs on http://localhost:3000

### Type Checking

```bash
yarn tsc:check
```

Run this to verify TypeScript types without building.

### Linting

```bash
yarn lint
```

Checks code for style and potential errors. Note: Prisma generated files may show warnings (this is normal).

### Building for Production

```bash
yarn build
```

Creates an optimized production build. This will:
- Compile TypeScript
- Bundle assets
- Generate static pages
- Run type checking and linting

### Starting Production Server

```bash
yarn start
```

Runs the production build locally (must run `yarn build` first).

## Database Management

### View Database in Prisma Studio

```bash
npx prisma studio
```

Opens a GUI at http://localhost:5555 to browse and edit database records.

### Create a New Migration

After modifying `prisma/schema.prisma`:

```bash
yarn prisma:migrate
```

### Reset Database (⚠️ Destroys all data)

```bash
npx prisma migrate reset
```

### Push Schema Changes (Without Migration)

```bash
yarn prisma:push
```

Useful for rapid prototyping.

## Key Concepts

### 1. Next.js App Router

This project uses Next.js 15's App Router (not Pages Router):

- **Pages**: Create `page.tsx` in `app/[route]/`
- **Layouts**: Shared UI in `layout.tsx`
- **API Routes**: Create `route.ts` in `app/api/[endpoint]/`
- **Server Components**: Default (can use async/await)
- **Client Components**: Add `'use client'` at top when needed

### 2. Path Aliases

Always use `@/` for imports:

```typescript
// ✅ Correct
import { Header } from '@/components/Header';
import prisma from '@/utils/prisma';

// ❌ Avoid
import { Header } from '../../components/Header';
```

### 3. Component Patterns

#### Server Component (default)

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>;
}
```

#### Client Component (needs interactivity)

```typescript
// components/Counter.tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 4. API Routes

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const data = await request.json();
  const user = await prisma.user.create({ data });
  return NextResponse.json(user);
}
```

### 5. Database Queries with Prisma

```typescript
import prisma from '@/utils/prisma';

// Find all
const courses = await prisma.course.findMany();

// Find one
const course = await prisma.course.findUnique({
  where: { id: '123' },
});

// Find with relations
const course = await prisma.course.findUnique({
  where: { id: '123' },
  include: { skills: true, tracks: true },
});

// Create
const newCourse = await prisma.course.create({
  data: { code: 'CS101', name: 'Intro to CS' },
});
```

## Common Tasks

### Adding a New Page

1. Create `app/my-page/page.tsx`:

```typescript
export default function MyPage() {
  return (
    <div>
      <h1>My New Page</h1>
    </div>
  );
}
```

2. Access at http://localhost:3000/my-page

### Adding a New Component

1. Create `components/MyComponent.tsx`:

```typescript
interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return <h1>{title}</h1>;
}
```

2. Use it:

```typescript
import MyComponent from '@/components/MyComponent';

<MyComponent title="Hello" />
```

### Adding a New API Route

1. Create `app/api/my-endpoint/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const data = { message: 'Hello API' };
  return NextResponse.json(data);
}
```

2. Call it from frontend:

```typescript
const response = await fetch('/api/my-endpoint');
const data = await response.json();
```

### Adding a Database Model

1. Edit `prisma/schema.prisma`:

```prisma
model MyModel {
  id    String @id @default(cuid())
  name  String
  createdAt DateTime @default(now())
}
```

2. Create and apply migration:

```bash
yarn prisma:migrate
```

3. Use in code:

```typescript
const items = await prisma.myModel.findMany();
```

## Styling

### MUI Components (Primary)

```typescript
import { Button, Box, Typography } from '@mui/material';

<Box sx={{ p: 2 }}>
  <Typography variant="h1">Title</Typography>
  <Button variant="contained">Click Me</Button>
</Box>
```

### Tailwind Classes

```typescript
<div className="flex items-center gap-4">
  <span className="text-lg font-bold">Title</span>
</div>
```

### Emotion CSS-in-JS

```typescript
import { css } from '@emotion/react';

const styles = css`
  color: blue;
  font-size: 20px;
`;

<div css={styles}>Styled Text</div>
```

## Debugging

### Server-Side Logs

Check terminal where `yarn dev` is running.

### Client-Side Logs

Check browser console (F12 → Console tab).

### Database Queries

Use Prisma Studio:

```bash
npx prisma studio
```

### Common Errors

#### Module not found
```bash
# Clear cache and rebuild
rm -rf .next
yarn dev
```

#### Prisma client outdated
```bash
yarn prisma:generate
```

#### Database connection error
Check `.env` file has correct `DATABASE_URL`.

## Testing

Currently, the project doesn't have automated tests. This is an area for future improvement.

### Manual Testing Checklist

- [ ] Pages load without errors
- [ ] Search functionality works
- [ ] Entity modals open correctly
- [ ] Admin interface functions properly
- [ ] API endpoints return expected data
- [ ] Dark/light theme toggles correctly

## Git Workflow

### Branching Strategy

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature

# Create Pull Request on GitHub
```

### Commit Message Guidelines

- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Reference issues when relevant: "Fix #123: Correct search bug"

## Code Style

### TypeScript

- Use `interface` for object types
- Prefer `const` over `let`
- Use arrow functions for components
- Add explicit return types for functions

### React

- Functional components only (no class components)
- Use hooks (useState, useEffect, etc.)
- Extract reusable logic into custom hooks
- Keep components small and focused

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Utilities**: camelCase (`myUtil.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Files**: Match component name (`MyComponent.tsx`)

## Resources

### Project Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture overview
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guide for structure changes
- [README.md](./README.md) - Project overview and goals

### External Documentation

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev/)
- [Material-UI](https://mui.com/)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## Getting Help

1. **Read the docs** - Check ARCHITECTURE.md and this guide
2. **Search issues** - Someone may have had the same problem
3. **Ask the team** - Reach out in team chat
4. **Open an issue** - For bugs or feature requests

## Useful VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Prisma** - Schema syntax highlighting
- **TypeScript** - Enhanced TS support
- **Material-UI Snippets** - MUI component snippets
- **Tailwind CSS IntelliSense** - Tailwind autocomplete

## Next Steps

1. ✅ Follow the Quick Start above
2. ✅ Read through the codebase
3. ✅ Explore the database in Prisma Studio
4. ✅ Run the app and test features
5. ✅ Pick up a task from the issue tracker
6. ✅ Make your first contribution!

---

**Welcome to the team! Happy coding! 🚀**
