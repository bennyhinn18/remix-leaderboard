# 🌐 Supabase Remote Database Sync Guide

## 🎯 **Overview**

This guide explains how to manage database changes when working with **Supabase remote databases** (your live production/staging databases).

## 🔄 **Two Main Scenarios**

### **Scenario A: Changes Made in Supabase Dashboard**
When you make changes directly in the Supabase web interface.

### **Scenario B: Local Development → Remote Deployment**
When you develop locally and need to apply changes to remote.

---

## 📋 **Scenario A: Supabase Dashboard Changes**

### **What Happens:**
1. You open Supabase Dashboard > SQL Editor
2. You run SQL commands like:
   ```sql
   ALTER TABLE members ADD COLUMN phone_number TEXT;
   CREATE INDEX idx_members_phone ON members(phone_number);
   ```
3. **Changes are applied IMMEDIATELY to your live database**
4. Your local codebase doesn't know about these changes
5. Other team members don't see these changes

### **🔧 How to Sync Using Our Tool:**

#### **Step 1: Document the Remote Change**
```bash
npm run db:create-migration "add_phone_number_to_members"
```

#### **Step 2: Copy Your SQL to Migration File**
Edit the created migration file and add the exact SQL you ran:

```sql
-- Migration: add_phone_number_to_members
-- Created: Mon Jul 21 2025
-- Applied to REMOTE database via Supabase Dashboard

-- Add phone number column to members table
ALTER TABLE members ADD COLUMN phone_number TEXT;

-- Add index for performance
CREATE INDEX idx_members_phone ON members(phone_number);

-- Applied on: 2025-07-21 12:30 UTC
-- Applied by: [Your Name]
-- Database: [Production/Staging]
```

#### **Step 3: Update Local Types**
```bash
npm run types:generate
```

#### **Step 4: Test and Commit**
```bash
npm run build  # Ensure app still works
git add supabase/migrations/ app/types/
git commit -m "sync(db): add phone_number column from remote changes"
```

---

## 🚀 **Scenario B: Local → Remote Deployment**

### **Using Supabase CLI (Recommended)**

#### **Step 1: Link Your Project**
```bash
# Link to your remote Supabase project
supabase link --project-ref your-project-ref
```

#### **Step 2: Create Migration Locally**
```bash
npm run db:create-migration "add_user_preferences"
```

#### **Step 3: Write Your Migration**
```sql
-- Migration: add_user_preferences
-- Created: Mon Jul 21 2025

CREATE TABLE user_preferences (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES members(id),
  theme TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

#### **Step 4: Apply to Remote**
```bash
# Push migration to remote database
supabase db push
```

#### **Step 5: Verify**
```bash
# Check if migration was applied
supabase migration list
```

---

## 🔍 **Advanced Sync Techniques**

### **Pull Remote Changes**
If someone else made changes to the remote database:

```bash
# Pull schema changes from remote
supabase db pull

# See what changed
supabase db diff --schema public
```

### **Compare Local vs Remote**
```bash
# Generate diff file showing differences
supabase db diff --schema public > schema_diff.sql

# Review the differences
cat schema_diff.sql
```

### **Backup Before Changes**
```bash
# Backup your remote database before major changes
supabase db dump --data-only > backup_$(date +%Y%m%d).sql
```

---

## 🛡️ **Safety Best Practices**

### **🚨 Critical Rules for Remote Databases:**

1. **Never make breaking changes during business hours**
2. **Always test in staging environment first**
3. **Backup before major schema changes**
4. **Coordinate with team before database changes**
5. **Document every change immediately**

### **✅ Recommended Workflow:**

```bash
# 1. Create staging environment
supabase projects create my-app-staging

# 2. Test changes in staging
supabase link --project-ref staging-ref
supabase db push

# 3. Verify application works with changes
npm run dev

# 4. Apply to production
supabase link --project-ref production-ref
supabase db push
```

---

## 🔧 **Common Commands Reference**

### **Database Sync Commands**
```bash
# Create migration for remote changes
npm run db:create-migration "description"

# Check current migration status
npm run db:check

# Get help with sync workflow
npm run db:sync

# Update schema documentation
npm run db:docs
```

### **Supabase CLI Commands**
```bash
# Link to remote project
supabase link --project-ref YOUR_REF

# Pull remote schema changes
supabase db pull

# Push local migrations to remote
supabase db push

# Generate diff between local and remote
supabase db diff --schema public

# List applied migrations
supabase migration list

# Backup remote database
supabase db dump --data-only
```

### **TypeScript Type Updates**
```bash
# Generate types from current database schema
npm run types:generate

# Check if manual type updates needed
npm run types:check
```

---

## 🎯 **Real-World Example**

### **Scenario: Adding a new feature that requires database changes**

#### **Step 1: Plan the Change**
```sql
-- Need to add user notification preferences
CREATE TABLE notification_preferences (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  member_id BIGINT REFERENCES members(id),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Step 2: Test in Staging**
```bash
# Link to staging
supabase link --project-ref staging-ref

# Create migration
npm run db:create-migration "add_notification_preferences_table"

# Edit migration file with SQL above
# Apply to staging
supabase db push

# Test app functionality
npm run dev
```

#### **Step 3: Apply to Production**
```bash
# Link to production
supabase link --project-ref production-ref

# Apply same migration
supabase db push

# Update types
npm run types:generate

# Commit everything
git add .
git commit -m "feat(db): add notification preferences table"
```

---

## 🤝 **Team Collaboration**

### **When Multiple Developers Work on Database:**

1. **Communicate changes in team chat**
2. **Use descriptive migration names**
3. **Always pull latest before making changes**
4. **Test migrations locally before applying to remote**
5. **Update team when migrations are applied to production**

### **Migration Naming Convention:**
```
YYYYMMDDHHMMSS_descriptive_name.sql

Examples:
20250721120000_add_phone_number_to_members.sql
20250721130000_create_notification_preferences_table.sql
20250721140000_add_index_for_member_search.sql
```

---

This workflow ensures that your remote Supabase database changes are properly tracked, documented, and synchronized with your team's codebase! 🚀
