#!/bin/bash

# Database Schema Sync Script
# This script helps sync database changes made in Supabase SQL editor with local migrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "🔄 Database Schema Sync Tool"
    echo "============================"
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Generate timestamp for new migration
generate_timestamp() {
    date +"%Y%m%d%H%M%S"
}

create_migration_file() {
    local description="$1"
    local timestamp=$(generate_timestamp)
    local filename="${timestamp}_${description}.sql"
    local filepath="supabase/migrations/${filename}"
    
    echo "-- Migration: ${description}"
    echo "-- Created: $(date)"
    echo "-- This migration captures changes made directly in Supabase SQL editor"
    echo ""
    echo "-- Add your SQL changes below:"
    echo ""
    
    # Create the file
    cat > "$filepath" << EOF
-- Migration: ${description}
-- Created: $(date)
-- This migration captures changes made directly in Supabase SQL editor

-- Add your SQL changes below:

-- Example:
-- ALTER TABLE members ADD COLUMN new_field TEXT;
-- CREATE INDEX idx_members_new_field ON members(new_field);

-- Remember to:
-- 1. Test these changes in a development environment first
-- 2. Document what each change does
-- 3. Consider the impact on existing data
-- 4. Update TypeScript types if needed
EOF
    
    print_success "Created migration file: ${filepath}"
    echo ""
    print_info "Next steps:"
    echo "1. Edit ${filepath} and add your SQL changes"
    echo "2. Test the migration in a development environment"
    echo "3. Update TypeScript types if database schema changed"
    echo "4. Update documentation if needed"
    echo "5. Commit the migration file to version control"
}

dump_current_schema() {
    print_step "Generating current schema documentation..."
    
    local output_file="docs/current-schema-$(date +%Y%m%d).sql"
    
    print_info "To get your current schema:"
    echo "1. Go to Supabase Dashboard > SQL Editor"
    echo "2. Run this query to get your table definitions:"
    echo ""
    echo "SELECT table_name, column_name, data_type, is_nullable, column_default"
    echo "FROM information_schema.columns"
    echo "WHERE table_schema = 'public'"
    echo "ORDER BY table_name, ordinal_position;"
    echo ""
    echo "3. Copy the results and save them to: ${output_file}"
    echo ""
    
    print_info "For complete schema dump:"
    echo "1. Use Supabase CLI: supabase db dump --schema-only"
    echo "2. Or export from your database management tool"
    echo "3. Save the output to compare with your migration files"
}

check_migration_status() {
    print_step "Checking migration file naming and organization..."
    
    local migrations_dir="supabase/migrations"
    
    if [ ! -d "$migrations_dir" ]; then
        print_error "Migrations directory not found: $migrations_dir"
        return 1
    fi
    
    echo ""
    print_info "Current migration files:"
    ls -la "$migrations_dir"
    echo ""
    
    print_warning "Notice: Some migrations don't follow timestamp naming convention"
    print_info "Consider renaming for better organization:"
    echo "  - create_members_table.sql → YYYYMMDDHHMMSS_create_members_table.sql"
    echo "  - create_project_showcase_slots_table.sql → YYYYMMDDHHMMSS_create_project_showcase_slots_table.sql"
    echo ""
    
    print_info "Migration best practices:"
    echo "✓ Use timestamp prefixes for ordering (YYYYMMDDHHMMSS_)"
    echo "✓ Use descriptive names"
    echo "✓ Keep migrations atomic (one logical change per file)"
    echo "✓ Test migrations before applying to production"
    echo "✓ Document breaking changes"
}

sync_workflow() {
    print_step "Database Change Workflow"
    echo ""
    
    print_info "When you make changes in Supabase SQL Editor:"
    echo ""
    echo "1. 📝 Document the changes:"
    echo "   - What tables/columns were modified"
    echo "   - What indexes were added/removed"
    echo "   - What constraints were changed"
    echo ""
    echo "2. 🔄 Create a migration file:"
    echo "   ./scripts/db-sync.sh create 'description_of_changes'"
    echo ""
    echo "3. 📋 Copy your SQL changes to the migration file"
    echo ""
    echo "4. 🧪 Test in development:"
    echo "   - Apply migration to a fresh database"
    echo "   - Ensure application still works"
    echo "   - Update TypeScript types if needed"
    echo ""
    echo "5. 📚 Update documentation:"
    echo "   - Update database schema docs"
    echo "   - Update API documentation if needed"
    echo "   - Update component documentation if data structure changed"
    echo ""
    echo "6. 🔒 Commit to version control:"
    echo "   git add supabase/migrations/new_migration.sql"
    echo "   git commit -m 'feat: add new database migration for XYZ'"
    echo ""
    
    print_warning "⚠️  Important Notes:"
    echo "- Never edit existing migration files after they've been applied"
    echo "- Always create new migration files for changes"
    echo "- Test migrations thoroughly before production"
    echo "- Keep migrations reversible when possible"
}

create_schema_documentation() {
    print_step "Creating schema documentation template..."
    
    local doc_file="docs/database-schema.md"
    
    if [ -f "$doc_file" ]; then
        print_warning "Schema documentation already exists: $doc_file"
        read -p "Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping schema documentation creation"
            return 0
        fi
    fi
    
    cat > "$doc_file" << 'EOF'
# 🗄️ Database Schema Documentation

*Last Updated: [DATE]*

## 📋 **Overview**

This document describes the current database schema for ByteBashBlitz Terminal.

## 📊 **Tables**

### **members**
Primary table for user profiles and community data.

```sql
- id: BIGINT PRIMARY KEY
- github_username: TEXT UNIQUE
- name: TEXT
- email: TEXT
- bash_points: INTEGER DEFAULT 0
- title: TEXT (e.g., "Basher", "Captain Bash", "Legacy Basher", "Organiser")
- clan_name: TEXT
- avatar_url: TEXT
- roll_number: TEXT
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

### **events**
Community events and activities.

```sql
- id: BIGINT PRIMARY KEY
- title: TEXT
- description: TEXT
- date: DATE
- time: TIME
- venue: TEXT
- leading_clan: JSONB
- attendees: INTEGER DEFAULT 0
- status: TEXT
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

### **clans**
Team/group organization.

```sql
- id: BIGINT PRIMARY KEY
- clan_name: TEXT UNIQUE
- description: TEXT
- members: JSONB
- clan_score: INTEGER DEFAULT 0
- activities: JSONB
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

### **points**
Point transaction history.

```sql
- id: BIGINT PRIMARY KEY
- member_id: BIGINT REFERENCES members(id)
- points: INTEGER
- description: TEXT
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

### **project_showcase_slots**
Project presentation slot allocations.

```sql
- id: BIGINT PRIMARY KEY
- member_id: BIGINT REFERENCES members(id)
- member_name: TEXT
- member_github_username: TEXT
- member_title: TEXT
- slot_number: INTEGER UNIQUE (1-25)
- event_id: TEXT
- event_name: TEXT
- status: TEXT (allocated/confirmed/cancelled)
- allocated_at: TIMESTAMP WITH TIME ZONE
- metadata: JSONB
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

### **notifications**
User notification system.

```sql
- id: BIGINT PRIMARY KEY
- member_id: BIGINT REFERENCES members(id)
- title: TEXT
- message: TEXT
- type: TEXT
- read: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP WITH TIME ZONE
```

## 🔗 **Relationships**

```mermaid
erDiagram
    MEMBERS ||--o{ POINTS : earns
    MEMBERS }o--|| CLANS : belongs_to
    MEMBERS ||--o{ PROJECT_SHOWCASE_SLOTS : has
    MEMBERS ||--o{ NOTIFICATIONS : receives
    CLANS ||--o{ EVENTS : organizes
```

## 📈 **Indexes**

### **Performance Indexes**
```sql
-- Member lookups
CREATE INDEX idx_members_github_username ON members(github_username);
CREATE INDEX idx_members_clan_name ON members(clan_name);

-- Points queries
CREATE INDEX idx_points_member_id ON points(member_id);
CREATE INDEX idx_points_created_at ON points(created_at);

-- Project showcase
CREATE INDEX idx_project_showcase_member_id ON project_showcase_slots(member_id);
CREATE INDEX idx_project_showcase_event_id ON project_showcase_slots(event_id);

-- Notifications
CREATE INDEX idx_notifications_member_id ON notifications(member_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

## 🛡️ **Security Policies (RLS)**

Row Level Security is enabled on all tables with appropriate policies for:
- User data access control
- Organiser administrative permissions
- Public read access where appropriate

## 🔄 **Migration History**

| Date | Migration | Description |
|------|-----------|-------------|
| 2025-05-19 | `create_notifications_table.sql` | Added notification system |
| 2025-05-20 | `create_push_subscriptions_table.sql` | Added push notification support |
| 2025-05-21 | `create_notification_preferences_table.sql` | Added user notification preferences |
| [DATE] | `create_members_table.sql` | Core member profiles and data |
| [DATE] | `create_project_showcase_slots_table.sql` | Project showcase slot allocation |

## 📝 **Schema Change Process**

1. **Document the change** in this file
2. **Create migration file** with timestamp
3. **Test thoroughly** in development
4. **Update TypeScript types** if needed
5. **Apply to production** via Supabase dashboard

## 🎯 **Current Schema Version**

**Version**: [UPDATE_THIS]  
**Last Migration**: [LAST_MIGRATION_FILE]  
**Compatible App Version**: [APP_VERSION]

---

*Keep this documentation updated when making schema changes!*
EOF

    print_success "Created schema documentation template: $doc_file"
    print_info "Please update this file with your current schema details"
}

show_help() {
    echo "Database Schema Sync Tool"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  create <description>    Create a new migration file"
    echo "  check                   Check current migration status"
    echo "  dump                    Show how to dump current schema"
    echo "  workflow                Show the complete sync workflow"
    echo "  docs                    Create schema documentation template"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 create 'add_user_preferences_table'"
    echo "  $0 check"
    echo "  $0 workflow"
}

# Main script logic
main() {
    print_header
    
    case "${1:-help}" in
        "create")
            if [ -z "$2" ]; then
                print_error "Please provide a description for the migration"
                echo "Usage: $0 create 'description_of_changes'"
                exit 1
            fi
            create_migration_file "$2"
            ;;
        "check")
            check_migration_status
            ;;
        "dump")
            dump_current_schema
            ;;
        "workflow")
            sync_workflow
            ;;
        "docs")
            create_schema_documentation
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run the main function with all arguments
main "$@"
