# Migration Guide: src/ to Root-Level Structure

## Overview

The codebase has been restructured to move all source files from `src/` to root-level directories. This guide explains the changes and how to adapt to the new structure.

## What Changed?

### Before (Old Structure)
```
src/
├── app/
├── components/
├── providers/
├── utils/
├── theme/
└── generated/
```

### After (New Structure)
```
/ (root)
├── app/
├── components/
├── providers/
├── utils/
├── theme/
└── generated/
```

## Migration Summary

### Directory Moves

All directories have been moved from `src/` to root:

- `src/app/` → `app/`
- `src/components/` → `components/`
- `src/providers/` → `providers/`
- `src/utils/` → `utils/`
- `src/theme/` → `theme/`
- `src/generated/` → `generated/`

### Import Path Changes

**Good news:** Import paths have **NOT changed** thanks to TypeScript path mapping!

The `@/` alias still works exactly the same:

```typescript
// Before and After - NO CHANGE NEEDED
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/providers/ThemeProvider';
import prisma from '@/utils/prisma';
```

### Configuration Updates

#### tsconfig.json

The TypeScript configuration has been updated:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]  // Changed from ["./src/*"]
    }
  }
}
```

This means `@/` now resolves to the root directory instead of `src/`.

## For Team Members

### If You Have Local Changes

1. **Commit or stash your work** before pulling the restructure:
   ```bash
   git stash
   ```

2. **Pull the latest changes**:
   ```bash
   git checkout main
   git pull origin main
   ```

3. **Reinstall dependencies** (if needed):
   ```bash
   yarn install
   ```

4. **Regenerate Prisma client**:
   ```bash
   yarn prisma:generate
   ```

5. **Reapply your stashed changes**:
   ```bash
   git stash pop
   ```

6. **Resolve any conflicts** (unlikely, but possible)

### If You're Starting Fresh

Just clone and install as usual:

```bash
git clone <repository-url>
cd remember-pertinent-info
yarn install
yarn prisma:generate
```

## For Active Development

### No Code Changes Required

Due to the `@/` path mapping, **your existing code should work without changes**:

- ✅ All imports using `@/` work as before
- ✅ All file references remain valid
- ✅ No component rewrites needed
- ✅ No API route changes needed

### New File Locations

When creating new files, use the root-level directories:

- **Page components** → `app/[route]/page.tsx`
- **UI components** → `components/ComponentName.tsx`
- **Providers** → `providers/ProviderName.tsx`
- **Utilities** → `utils/utilityName.ts`
- **API routes** → `app/api/[route]/route.ts`

### Example: Adding a New Component

**OLD way** (no longer valid):
```bash
src/components/NewComponent.tsx  ❌
```

**NEW way**:
```bash
components/NewComponent.tsx  ✅
```

Import remains the same:
```typescript
import NewComponent from '@/components/NewComponent';
```

### Example: Adding a New Page

**OLD way** (no longer valid):
```bash
src/app/about/page.tsx  ❌
```

**NEW way**:
```bash
app/about/page.tsx  ✅
```

## Benefits of New Structure

### 1. Simpler Navigation
- No need to dive into `src/` folder
- All code visible at root level
- Easier to find files

### 2. Better IDE Support
- Faster autocomplete
- More accurate file search
- Clearer project structure view

### 3. Industry Standard
- Matches Next.js 15 conventions
- Aligns with App Router best practices
- Easier onboarding for new developers

### 4. Cleaner Repository
- Fewer nested levels
- More intuitive organization
- Better discoverability

## Common Questions

### Q: Do I need to update my imports?
**A:** No! The `@/` alias continues to work the same way.

### Q: Will my IDE still autocomplete paths?
**A:** Yes, IDEs will read the updated `tsconfig.json` and autocomplete correctly.

### Q: What about the `src/` folder?
**A:** It has been removed. All code is now at root level.

### Q: Do API routes still work?
**A:** Yes, API routes in `app/api/` work exactly as before.

### Q: What about Prisma generated files?
**A:** They're now in `generated/prisma/` at root. Regenerate with `yarn prisma:generate`.

### Q: Does this affect the build process?
**A:** No, builds work the same. Run `yarn build` as usual.

### Q: Are there any breaking changes?
**A:** For existing code, no. Only the physical file locations changed.

## Troubleshooting

### Issue: Import errors after pulling

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
yarn install

# Rebuild
yarn build
```

### Issue: TypeScript can't find modules

**Solution:**
```bash
# Restart TypeScript server in your IDE
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or restart your IDE completely
```

### Issue: Prisma client not found

**Solution:**
```bash
yarn prisma:generate
```

### Issue: Path mapping not working

**Solution:**
Verify `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Best Practices Going Forward

### 1. Use Path Aliases
Always use `@/` for imports:
```typescript
// ✅ Good
import { Header } from '@/components/Header';

// ❌ Avoid (relative paths are fragile)
import { Header } from '../../components/Header';
```

### 2. Organize by Feature
Keep related files close:
```
components/
├── search/
│   ├── SearchBar.tsx
│   ├── SearchResults.tsx
│   └── SearchFilters.tsx
└── admin/
    ├── AdminPanel.tsx
    └── EntityManager.tsx
```

### 3. Consistent Naming
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL.ts`)

### 4. Export Patterns
Use index files for cleaner imports:
```typescript
// components/index.ts
export { Header } from './Header';
export { Footer } from './Footer';

// Usage elsewhere
import { Header, Footer } from '@/components';
```

## Script for Automation

The restructuring was performed by `scripts/restructure_project.py`:

```bash
# To see what would change (dry run)
python scripts/restructure_project.py --dry-run

# To execute the restructure (already done)
python scripts/restructure_project.py
```

**Note:** This script has already been executed. You don't need to run it.

## Next Steps

1. ✅ Pull the latest changes
2. ✅ Verify imports still work
3. ✅ Test your local development environment
4. ✅ Read the [ARCHITECTURE.md](./ARCHITECTURE.md) for full structure details
5. ✅ Continue development as normal

## Need Help?

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for structure details
- Review [README.md](./README.md) for project overview
- Ask in team chat if you encounter issues
- Open an issue on GitHub for persistent problems

---

**Last Updated:** October 2025
**Applies to:** Version 2 (Fall 2025)
