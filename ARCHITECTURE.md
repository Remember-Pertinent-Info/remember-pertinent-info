# Architecture Documentation

## Project Overview

**Remember Pertinent Information** is a Next.js 15 web application built with React 19, TypeScript, Material-UI, and PostgreSQL. It facilitates learning by helping students understand course prerequisites, skills, and concepts through an interactive web interface.

## Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Material-UI (MUI) v7 + Emotion + Tailwind CSS 4
- **Fonts:** Roboto (via @fontsource)

### Backend
- **Runtime:** Next.js API Routes (Node.js)
- **Database:** PostgreSQL
- **ORM:** Prisma 6

### Build & Dev Tools
- **Package Manager:** Yarn
- **Linter:** ESLint 9
- **Type Checker:** TypeScript
- **Build Tool:** Next.js Turbopack

## Project Structure

The project follows a **flat, root-level architecture** for maximum simplicity and discoverability:

```
/
├── app/                    # Next.js App Router (pages & API routes)
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page (/)
│   ├── loading.tsx         # Global loading UI
│   ├── error.tsx           # Global error boundary
│   ├── global-error.tsx    # Root layout error handler
│   ├── not-found.tsx       # Global 404 page
│   ├── globals.css         # Global styles
│   ├── admin/              # Admin page route
│   │   ├── page.tsx        # Admin management UI (/admin)
│   │   └── loading.tsx     # Admin loading state
│   └── api/                # API route handlers
│       ├── search/         # Search endpoint
│       └── admin/          # Admin endpoints (entities, details, links)
│
├── components/             # React UI components (all components)
│   ├── Header.tsx          # App header/navigation
│   ├── LandingPage.tsx     # Main landing page
│   ├── SearchBar.tsx       # Search input component
│   ├── SearchResults.tsx   # Search results display
│   ├── EntityModal.tsx     # Modal for entity details
│   ├── ConceptDetail.tsx   # Concept detail view
│   ├── SkillDetail.tsx     # Skill detail view
│   ├── CourseDetail.tsx    # Course detail view
│   ├── TrackDetail.tsx     # Track detail view
│   ├── DepartmentDetail.tsx # Department detail view
│   ├── MajorDetail.tsx     # Major detail view
│   └── index.ts            # Component exports
│
├── providers/              # React Context providers
│   ├── ThemeProvider.tsx   # MUI theme & dark/light mode
│   └── ModalStackProvider.tsx # Modal stack management
│
├── utils/                  # Utility functions
│   ├── prisma.ts           # Prisma client singleton
│   └── categoryColors.ts   # Entity category color mapping
│
├── theme/                  # Theme configuration
│   └── theme.ts            # MUI theme customization
│
├── generated/              # Generated code (Prisma client)
│   └── prisma/             # Auto-generated Prisma types/client
│
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma       # Database schema definition
│   ├── migrations/         # Database migration files
│   └── seed.ts             # Database seeding script
│
├── scripts/                # Utility scripts
│   └── restructure_project.py # Project restructuring utility
│
├── public/                 # Static assets (images, fonts, etc.)
│
├── .github/                # GitHub configuration
│   └── workflows/          # CI/CD workflows
│
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies & scripts
└── README.md               # Project documentation
```

### Design Principles

1. **Flat Structure**: All major folders at root level for easy discovery
2. **Convention over Configuration**: Following Next.js 15 App Router conventions
3. **Type Safety**: Full TypeScript with strict mode
4. **Component Isolation**: Each component is self-contained
5. **API-First**: Backend logic separated into API routes

## Routing Architecture

### Page Routes (App Router)

Next.js 15 App Router uses file-system based routing with special files for enhanced UX:

- **`/`** → `app/page.tsx` - Landing page with search
- **`/admin`** → `app/admin/page.tsx` - Admin management interface

### Special Route Files

The app follows Next.js 15 conventions for special route files:

- **`app/layout.tsx`** - Root layout wrapping all pages
- **`app/loading.tsx`** - Global loading state (React Suspense boundary)
- **`app/error.tsx`** - Global error boundary for error handling
- **`app/global-error.tsx`** - Error boundary for root layout errors
- **`app/not-found.tsx`** - Custom 404 page
- **`app/admin/loading.tsx`** - Admin-specific loading state

These files provide:
- Consistent loading experiences across routes
- Graceful error handling with user-friendly messages
- Branded 404 pages with navigation back to home
- Error recovery with retry functionality

### API Routes

RESTful API endpoints for data operations:

- **`GET /api/search`** - Search across all entities (concepts, skills, courses, etc.)
- **`GET /api/admin/entities`** - List all entities by type
- **`GET /api/admin/detail?type={type}&id={id}`** - Get detailed entity information
- **`POST /api/admin/links`** - Create/remove relationships between entities

### Navigation Flow

```
User lands on /
  ↓
Searches for entity (concept/skill/course/track/major/department)
  ↓
Results displayed
  ↓
Clicks entity → Modal opens with details
  ↓
Can navigate to related entities (opens new modal in stack)
  ↓
Admin can access /admin for management
```

## Data Model

### Entities

The application manages 6 core entity types:

1. **Concept** - High-level learning concepts (e.g., "Fourier Transform")
2. **Skill** - Specific skills (e.g., "Matrix Multiplication")
3. **Course** - Academic courses (e.g., "CSCI 1200")
4. **Track** - Course tracks/specializations
5. **Major** - Academic majors
6. **Department** - Academic departments

### Relationships

- Concepts ↔ Skills (many-to-many)
- Skills ↔ Courses (many-to-many)
- Courses ↔ Tracks (many-to-many)
- Majors ↔ Courses (many-to-many)
- Majors ↔ Tracks (many-to-many)
- Departments ↔ Majors (one-to-many)

## State Management

### Global State

- **Theme**: Managed by `ThemeProvider` (light/dark mode)
- **Modals**: Managed by `ModalStackProvider` (modal stack for entity details)

### Local State

- Component-specific state using React `useState` hooks
- API data fetched on-demand (no global cache currently)

## Styling Strategy

### Theme System

- Base theme defined in `theme/theme.ts`
- MUI components themed consistently
- Support for light and dark modes
- System preference detection on initial load

### Styling Approaches

1. **MUI Components**: Primary UI framework
2. **Emotion CSS-in-JS**: For MUI styling and custom styles
3. **Tailwind CSS**: Utility classes for quick styling
4. **Global CSS**: `app/globals.css` for app-wide styles

## Development Workflow

### Setup

```bash
# Install dependencies
yarn install

# Generate Prisma client
yarn prisma:generate

# Run database migrations
yarn prisma:migrate

# Seed database (optional)
yarn prisma:seed
```

### Development

```bash
# Start dev server (with Turbopack)
yarn dev

# Type checking
yarn tsc:check

# Linting
yarn lint
```

### Building

```bash
# Production build
yarn build

# Start production server
yarn start
```

## Key Features

### Search Functionality

- Real-time search across all entity types
- Fuzzy matching on names and codes
- Category-based filtering
- Results grouped by entity type

### Modal Stack System

- Open entity details in modals
- Navigate to related entities (opens new modal)
- Breadcrumb-style modal stacking
- Close modals individually or all at once

### Admin Interface

- Manage all entity types (CRUD operations)
- Create/remove relationships between entities
- Bulk operations support
- Real-time updates

## Security Considerations

### Current State

- No authentication implemented yet
- Admin routes are publicly accessible
- Database credentials in environment variables

### Planned Improvements

- RPI SSO integration for authentication
- DUO verification for login
- Role-based access control (professors vs. students)
- Session management

## Performance Considerations

- **Static Generation**: Home page pre-rendered at build time
- **Server Components**: Default for App Router pages
- **Client Components**: Used only where interactivity needed
- **Code Splitting**: Automatic via Next.js
- **Turbopack**: Fast builds and HMR in development

## Database Schema

See `prisma/schema.prisma` for full schema definition.

### Key Models

- **Concept**: id, code, name, description, skills[]
- **Skill**: id, code, name, description, concepts[], courses[]
- **Course**: id, code, name, description, skills[], tracks[], majors[]
- **Track**: id, code, name, description, courses[], majors[]
- **Major**: id, code, name, description, department, courses[], tracks[]
- **Department**: id, code, name, description, majors[]

All IDs are CUIDs (collision-resistant unique identifiers).

## Future Enhancements

### Planned Features

1. User authentication (RPI SSO + DUO)
2. User progress tracking
3. Interactive quizzes and assessments
4. Professor content management system (CMS)
5. Markdown-based lecture notes
6. Video/multimedia content support
7. Course prerequisites visualization
8. Learning path recommendations

### Scalability Considerations

- Current structure supports easy addition of new pages
- Component library ready for expansion
- API routes can be extended without restructuring
- Database schema designed for growth
- Modal system scales to arbitrary depth

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check `DATABASE_URL` in `.env`
2. **Type errors**: Run `yarn prisma:generate` to regenerate types
3. **Build errors**: Clear `.next` folder and rebuild
4. **Lint errors in generated files**: These are expected, add to `.eslintignore` if needed

## Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
