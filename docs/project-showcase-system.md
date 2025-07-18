# Project Showcase Slot Allocation System

A comprehensive slot allocation system for the Byte Bash Blitz Project Showcase event, featuring random slot assignment with organiser management capabilities.

## Features

### For Members (Bashers)
- **Eligibility Check**: Automatically verifies if member has "Basher" title
- **Random Slot Allocation**: Fair slot assignment using animated slot machine
- **Slot Status Tracking**: View allocated slots with member details
- **Responsive Design**: Works on all device sizes
- **Real-time Updates**: Live updates when slots are allocated

### For Organisers
- **Management Dashboard**: Full control over slot allocations
- **Manual Allocation**: Assign specific slots to specific members
- **Bulk Operations**: Clear all slots, export data
- **Status Management**: Update slot status (allocated/confirmed/cancelled)
- **Analytics**: View stats and member information

## Database Schema

### Table: `project_showcase_slots`
```sql
- id: BIGINT (Primary Key)
- member_id: BIGINT (References members.id)
- member_name: TEXT
- member_github_username: TEXT
- member_title: TEXT
- slot_number: INTEGER (1-25, Unique)
- event_id: TEXT (Default: 'project-showcase-2025')
- event_name: TEXT
- status: TEXT (allocated/confirmed/cancelled)
- allocated_at: TIMESTAMP
- metadata: JSONB
```

### View: `project_showcase_slots_with_members`
Combines slot data with member details for efficient querying.

## Routes

### Public Routes
- `/events/project-showcase` - Main showcase page
- `/api/project-showcase` - API for slot data

### Organiser Routes
- `/events/project-showcase/manage` - Management dashboard

## API Endpoints

### GET `/api/project-showcase`
Returns current slot allocations and stats
```json
{
  "success": true,
  "data": {
    "slots": [...],
    "stats": {
      "totalSlots": 25,
      "allocatedSlots": 10,
      "availableSlots": 15,
      "eligibleMembers": 45
    }
  }
}
```

### POST `/events/project-showcase`
Actions:
- `allocate_slot` - Random slot allocation
- `remove_slot` - Remove specific slot (organiser only)

### POST `/events/project-showcase/manage`
Actions:
- `manual_allocate` - Assign specific slot
- `clear_all_slots` - Remove all allocations
- `export_slots` - Export slot data
- `update_slot_status` - Change slot status

## Components

### Core Components
- `SlotPicker` - Animated slot allocation interface
- `SlotDisplay` - Individual slot card display
- `ProjectShowcaseService` - Server-side slot management

### Utility Functions
- `formatSlotNumber()` - Format slot numbers with padding
- `getSlotStatusColor()` - Get color scheme for status
- `validateSlotNumber()` - Validate slot number range

## Configuration

### Environment Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

### Constants
```typescript
const PROJECT_SHOWCASE_CONFIG = {
  EVENT_ID: 'project-showcase-2025',
  EVENT_NAME: 'Project Showcase Event 2025',
  MAX_SLOTS: 25,
  ELIGIBILITY_KEYWORD: 'basher',
  PRESENTATION_DURATION: 10, // minutes
  QA_DURATION: 5, // minutes
}
```

## Setup Instructions

1. **Database Setup**
   ```bash
   # Run the migration
   supabase migration up
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Add to .env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Usage

### For Regular Members
1. Visit `/events/project-showcase`
2. Log in with GitHub
3. Click "Pick My Slot" if eligible
4. Watch the slot machine animation
5. View allocated slot in the list

### For Organisers
1. Visit `/events/project-showcase/manage`
2. Use manual allocation for specific assignments
3. Monitor and update slot statuses
4. Export data for external use
5. Clear slots if needed for reset

## Security Features

- **Row Level Security**: Database policies restrict access
- **Organiser Verification**: Admin functions require organiser status
- **Input Validation**: All inputs validated client and server-side
- **Rate Limiting**: Prevents spam allocation attempts

## Animations & UX

- **Slot Machine Effect**: Exciting allocation animation
- **Confetti Celebration**: Success feedback
- **Loading States**: Clear feedback during operations
- **Responsive Cards**: Optimized for all screen sizes
- **Real-time Updates**: Live data refresh

## Modular Design

The system is designed to be easily removable after the event:
- Self-contained routes and components
- Isolated database table
- No dependencies on core application logic
- Clean separation of concerns

## Troubleshooting

### Common Issues
1. **Members not eligible**: Ensure title contains "Basher"
2. **Slots not allocating**: Check database permissions
3. **Management access denied**: Verify organiser status
4. **Animation not working**: Check JavaScript enabled

### Database Queries
```sql
-- Check eligible members
SELECT * FROM members WHERE title ILIKE '%basher%';

-- View all allocations
SELECT * FROM project_showcase_slots_with_members;

-- Reset all slots
DELETE FROM project_showcase_slots WHERE event_id = 'project-showcase-2025';
```

## Future Enhancements

- Email notifications for slot allocation
- Calendar integration for presentation scheduling
- Project submission portal
- Voting system for best projects
- Certificate generation
- QR code check-in system

---

**Note**: This system is specifically designed for the Project Showcase event and can be safely removed after the event concludes by dropping the database table and removing the route files.
