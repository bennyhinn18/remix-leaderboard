#!/bin/bash

# TypeScript Types Generator for Database Schema
# This script helps generate TypeScript types from your Supabase schema

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}"
    echo "🔧 TypeScript Types Generator"
    echo "============================="
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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

generate_types_template() {
    local output_file="app/types/database-generated.ts"
    
    print_step "Generating TypeScript types template..."
    
    cat > "$output_file" << 'EOF'
// Generated Database Types
// This file should be updated when database schema changes

export interface DatabaseTypes {
  public: {
    Tables: {
      members: {
        Row: {
          id: number;
          github_username: string;
          name: string;
          email?: string;
          bash_points: number;
          title?: string;
          clan_name?: string;
          avatar_url?: string;
          roll_number?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          github_username: string;
          name: string;
          email?: string;
          bash_points?: number;
          title?: string;
          clan_name?: string;
          avatar_url?: string;
          roll_number?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          github_username?: string;
          name?: string;
          email?: string;
          bash_points?: number;
          title?: string;
          clan_name?: string;
          avatar_url?: string;
          roll_number?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: number;
          title: string;
          description?: string;
          date: string;
          time?: string;
          venue?: string;
          leading_clan?: any; // JSONB
          attendees: number;
          status?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description?: string;
          date: string;
          time?: string;
          venue?: string;
          leading_clan?: any;
          attendees?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          date?: string;
          time?: string;
          venue?: string;
          leading_clan?: any;
          attendees?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      clans: {
        Row: {
          id: number;
          clan_name: string;
          description?: string;
          members?: any; // JSONB
          clan_score: number;
          activities?: any; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          clan_name: string;
          description?: string;
          members?: any;
          clan_score?: number;
          activities?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          clan_name?: string;
          description?: string;
          members?: any;
          clan_score?: number;
          activities?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      points: {
        Row: {
          id: number;
          member_id: number;
          points: number;
          description?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          member_id: number;
          points: number;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          member_id?: number;
          points?: number;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_showcase_slots: {
        Row: {
          id: number;
          member_id: number;
          member_name: string;
          member_github_username: string;
          member_title: string;
          slot_number: number;
          event_id: string;
          event_name: string;
          status: string;
          allocated_at: string;
          metadata?: any; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          member_id: number;
          member_name: string;
          member_github_username: string;
          member_title: string;
          slot_number: number;
          event_id?: string;
          event_name?: string;
          status?: string;
          allocated_at?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          member_id?: number;
          member_name?: string;
          member_github_username?: string;
          member_title?: string;
          slot_number?: number;
          event_id?: string;
          event_name?: string;
          status?: string;
          allocated_at?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: number;
          member_id: number;
          title: string;
          message: string;
          type?: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          member_id: number;
          title: string;
          message: string;
          type?: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          member_id?: number;
          title?: string;
          message?: string;
          type?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      // Add more tables as needed...
    };
    Views: {
      project_showcase_slots_with_members: {
        Row: {
          // This view combines project_showcase_slots with member data
          id: number;
          member_id: number;
          member_name: string;
          member_github_username: string;
          member_title: string;
          slot_number: number;
          event_id: string;
          event_name: string;
          status: string;
          allocated_at: string;
          metadata?: any;
          created_at: string;
          updated_at: string;
          // Additional member fields from the view
          avatar_url?: string;
          bash_points?: number;
          clan_name?: string;
          basher_no?: string;
        };
      };
    };
    Functions: {
      // Add custom database functions here
    };
  };
}

// Type aliases for easier use
export type Database = DatabaseTypes;
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific table types
export type Member = Tables<'members'>;
export type Event = Tables<'events'>;
export type Clan = Tables<'clans'>;
export type Point = Tables<'points'>;
export type ProjectShowcaseSlot = Tables<'project_showcase_slots'>;
export type Notification = Tables<'notifications'>;

// View types
export type ProjectShowcaseSlotWithMember = Database['public']['Views']['project_showcase_slots_with_members']['Row'];

// Insert types
export type MemberInsert = TablesInsert<'members'>;
export type EventInsert = TablesInsert<'events'>;
export type ClanInsert = TablesInsert<'clans'>;
export type PointInsert = TablesInsert<'points'>;
export type ProjectShowcaseSlotInsert = TablesInsert<'project_showcase_slots'>;
export type NotificationInsert = TablesInsert<'notifications'>;

// Update types
export type MemberUpdate = TablesUpdate<'members'>;
export type EventUpdate = TablesUpdate<'events'>;
export type ClanUpdate = TablesUpdate<'clans'>;
export type PointUpdate = TablesUpdate<'points'>;
export type ProjectShowcaseSlotUpdate = TablesUpdate<'project_showcase_slots'>;
export type NotificationUpdate = TablesUpdate<'notifications'>;
EOF

    print_success "Generated TypeScript types template: $output_file"
    print_warning "This is a template - update it to match your actual database schema"
}

show_supabase_cli_setup() {
    print_step "Setting up automatic type generation with Supabase CLI"
    
    print_info "For automatic type generation, you can use Supabase CLI:"
    echo ""
    echo "1. Install Supabase CLI:"
    echo "   npm install -g supabase"
    echo ""
    echo "2. Login to Supabase:"
    echo "   supabase login"
    echo ""
    echo "3. Initialize Supabase in your project:"
    echo "   supabase init"
    echo ""
    echo "4. Link to your project:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "5. Generate types:"
    echo "   supabase gen types typescript --linked > app/types/supabase.ts"
    echo ""
    
    print_warning "Note: This requires Supabase CLI setup and project linking"
}

show_manual_process() {
    print_step "Manual type generation process"
    
    print_info "When you make database changes:"
    echo ""
    echo "1. Update the generated types file:"
    echo "   - Edit app/types/database-generated.ts"
    echo "   - Add/modify table definitions"
    echo "   - Update interface properties"
    echo ""
    echo "2. Test TypeScript compilation:"
    echo "   npm run typecheck"
    echo ""
    echo "3. Update imports in your code:"
    echo "   import type { Member, Event } from '~/types/database-generated';"
    echo ""
    echo "4. Check for breaking changes:"
    echo "   - Search for old type usage"
    echo "   - Update component props"
    echo "   - Update API responses"
    echo ""
}

create_type_update_checklist() {
    local checklist_file="docs/type-update-checklist.md"
    
    print_step "Creating type update checklist..."
    
    cat > "$checklist_file" << 'EOF'
# 🔧 TypeScript Types Update Checklist

Use this checklist when updating database schema and types.

## 📋 **After Database Schema Changes**

### **1. Update Types**
- [ ] Update `app/types/database-generated.ts` with new/changed tables
- [ ] Add new interfaces for new tables
- [ ] Update existing interfaces for modified columns
- [ ] Add/update Insert and Update types
- [ ] Update View types if views changed

### **2. Check Compilation**
- [ ] Run `npm run typecheck` to check for errors
- [ ] Fix any TypeScript compilation errors
- [ ] Update import statements if type names changed

### **3. Update Code Usage**
- [ ] Search for old type usage in components
- [ ] Update component props that use database types
- [ ] Update API route types
- [ ] Update service function types
- [ ] Update utility function types

### **4. Test Application**
- [ ] Test affected components
- [ ] Test API endpoints with new/changed data
- [ ] Test database operations (create, read, update, delete)
- [ ] Test user flows that use modified data

### **5. Update Documentation**
- [ ] Update API documentation with new types
- [ ] Update component documentation
- [ ] Update database schema documentation
- [ ] Add migration notes if needed

## 🔍 **Common Files to Check**

### **Component Files**
- `app/components/**/*.tsx` - Check component props
- `app/routes/**/*.tsx` - Check loader/action types

### **Service Files**
- `app/services/**/*.ts` - Update service function types
- `app/utils/**/*.ts` - Update utility function types

### **Type Files**
- `app/types/**/*.ts` - Update related type definitions
- Update imports across the codebase

## 🚨 **Breaking Change Protocol**

If your schema changes break existing code:

1. **Document the breaking change**
   - List affected components/functions
   - Provide migration guide
   - Update CHANGELOG.md

2. **Update all affected code**
   - Fix component props
   - Update API responses
   - Fix database queries

3. **Test thoroughly**
   - Run full application test
   - Check all user flows
   - Verify data integrity

4. **Communicate changes**
   - Update team about breaking changes
   - Provide migration instructions
   - Update deployment notes

## 📝 **Type Generation Commands**

```bash
# Generate template types
npm run types:generate

# Check TypeScript compilation
npm run typecheck

# Fix linting issues
npm run lint:fix

# Test build
npm run build
```

## 💡 **Tips**

- Always update types immediately after schema changes
- Use descriptive type names that match your domain
- Keep Insert/Update types optional where appropriate
- Test both happy path and error cases
- Consider backward compatibility when possible
EOF

    print_success "Created type update checklist: $checklist_file"
}

show_help() {
    echo "TypeScript Types Generator"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  generate     Generate TypeScript types template"
    echo "  supabase     Show Supabase CLI setup for auto-generation"
    echo "  manual       Show manual type generation process"
    echo "  checklist    Create type update checklist"
    echo "  help         Show this help message"
    echo ""
}

main() {
    print_header
    
    case "${1:-help}" in
        "generate")
            generate_types_template
            ;;
        "supabase")
            show_supabase_cli_setup
            ;;
        "manual")
            show_manual_process
            ;;
        "checklist")
            create_type_update_checklist
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

main "$@"
