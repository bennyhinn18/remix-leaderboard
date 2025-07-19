# Database Change Management Workflow

## Overview
This document outlines the workflow for managing database schema changes, especially when changes are made directly in Supabase's SQL editor.

## When You Make Changes in Supabase SQL Editor

### Step 1: Document the Changes
1. Run the sync check to see what's different:
   ```bash
   npm run db:check
   ```

2. Create a migration file for your changes:
   ```bash
   npm run db:create-migration "describe_your_changes"
   ```

3. Document what you changed in the migration file and schema docs:
   ```bash
   npm run db:docs
   ```

### Step 2: Update TypeScript Types
1. Generate new types from the updated database:
   ```bash
   npm run types:generate
   ```

2. Check if manual type updates are needed:
   ```bash
   npm run types:check
   ```

3. Test that your application still compiles:
   ```bash
   npm run build
   ```

### Step 3: Version Control
1. Add all the new files:
   ```bash
   git add supabase/migrations/ app/types/ docs/
   ```

2. Commit with a descriptive message:
   ```bash
   git commit -m "feat(db): add new table for [feature] - includes migration and types"
   ```

## When Team Members Need to Sync

### For New Team Members
1. Set up their local database:
   ```bash
   npm run db:reset
   npm run db:push
   ```

2. Generate types:
   ```bash
   npm run types:generate
   ```

### For Existing Team Members
1. Pull latest changes:
   ```bash
   git pull origin main
   ```

2. Apply new migrations:
   ```bash
   npm run db:push
   ```

3. Update types if needed:
   ```bash
   npm run types:generate
   ```

## Best Practices

### ✅ Do This
- Always document changes in migration files
- Update TypeScript types after schema changes
- Test builds after type updates
- Use descriptive migration names
- Keep schema documentation updated

### ❌ Avoid This
- Making schema changes without creating migrations
- Forgetting to update TypeScript types
- Pushing code without testing builds
- Making breaking changes without team discussion
- Editing migration files after they're committed

## Common Commands Quick Reference

```bash
# Check what's different between local and remote
npm run db:check

# Create a new migration file
npm run db:create-migration "your_change_description"

# Update documentation
npm run db:docs

# Generate/update TypeScript types
npm run types:generate

# Full sync workflow
npm run db:sync

# Reset local database (careful!)
npm run db:reset
```

## Troubleshooting

### Types are out of sync
```bash
npm run types:generate
npm run build
```

### Local database is corrupted
```bash
npm run db:reset
npm run db:push
npm run types:generate
```

### Migration conflicts
1. Check what's different: `npm run db:check`
2. Manually resolve conflicts in migration files
3. Test with: `npm run db:push`
4. Update types: `npm run types:generate`

## Schema Change Log
All database changes should be logged in `docs/schema-changes.md` with:
- Date and time
- Description of change
- Migration file name
- Impact on existing data
- Required application updates

## Team Communication
When making database changes:
1. **Before**: Discuss breaking changes in team chat
2. **During**: Use descriptive commit messages
3. **After**: Update team on any required actions
4. **Document**: Keep schema-changes.md updated

---

**Need Help?** 
- Check `./scripts/db-sync.sh help` for sync commands
- Check `./scripts/types-generator.sh help` for type commands
- Review migration files in `supabase/migrations/`
- Ask team members if you're unsure about impact
