# Project Showcase Event Management System

A comprehensive event management system for organizing multiple project showcase events with slot allocation, member management, and full administrative control.

## 🚀 New Features - Multi-Event Management

### Event Management Dashboard (`/events/project-showcase/events`)
- **Create Multiple Events**: Set up unlimited showcase events with unique configurations
- **Event Templates**: Duplicate existing events to save time
- **Status Management**: Control event lifecycle (Draft → Open → Closed → Completed)
- **Real-time Analytics**: Track slot allocation progress and member engagement
- **Bulk Operations**: Mass management of events and participants

### Enhanced Event Configuration
- **Flexible Slot Limits**: Configure 1-100 slots per event
- **Custom Duration**: Set presentation and Q&A time limits
- **Venue Management**: Track locations and hosting clans
- **Registration Windows**: Control when members can sign up
- **Status Tracking**: Monitor event progress through lifecycle stages

## 📊 Complete System Overview

### User Interfaces

#### 1. Public Event Page (`/events/project-showcase`)
- **Event Discovery**: Browse available showcase events
- **Slot Allocation**: Animated slot machine for fair assignment
- **Member Verification**: Automatic eligibility checking
- **Real-time Updates**: Live slot availability tracking
- **Profile Integration**: Seamless member profile linking

#### 2. Event Management (`/events/project-showcase/manage`)
- **Slot Administration**: Manual slot assignment and status updates
- **Member Management**: View eligible participants and allocations
- **Data Export**: Download complete event and slot data
- **Bulk Operations**: Clear slots, update statuses in bulk
- **Analytics Dashboard**: Comprehensive event statistics

#### 3. Events Overview (`/events/project-showcase/events`)
- **Multi-Event Dashboard**: Manage all showcase events from one place
- **Event Creation**: Quick setup with templates and duplication
- **Status Control**: Manage event lifecycle and registration windows
- **Progress Tracking**: Visual progress indicators for each event
- **Action Center**: Quick access to manage, view, duplicate, or delete events

### Database Architecture

#### Core Tables
```sql
-- Events management table
project_showcase_events (
  id, event_id, event_name, description, event_date, event_time,
  venue, max_slots, hosting_clan_id, status, created_at, updated_at
)

-- Slot allocations (enhanced)
project_showcase_slots (
  id, member_id, slot_number, event_id, status, allocated_at,
  showcase_event_id -- Links to events table
)

-- Analytics view
project_showcase_events_with_clans (
  -- Combines event data with clan info and slot statistics
)
```

#### Event Status Lifecycle
1. **Draft** - Event created, not visible to participants
2. **Open** - Registration active, members can pick slots
3. **Closed** - Registration ended, slots finalized
4. **Completed** - Event finished, archived
5. **Cancelled** - Event cancelled, slots released

### API Endpoints

#### Event Management
- `GET /events/project-showcase/events` - List all events (organiser only)
- `POST /events/project-showcase/events` - Create/manage events
  - `create_event` - Create new showcase event
  - `update_status` - Change event status
  - `delete_event` - Remove event and all slots
  - `duplicate_event` - Copy event configuration

#### Slot Management (Per Event)
- `GET /events/project-showcase/manage?event={id}` - Manage specific event
- `POST /events/project-showcase/manage` - Slot operations
  - `manual_allocate` - Assign specific slot to member
  - `clear_all_slots` - Reset all allocations
  - `export_slots` - Download event data
  - `update_slot_status` - Change allocation status

#### Public Participation
- `GET /events/project-showcase?event={id}` - View event (optional param)
- `POST /events/project-showcase` - Participate in event
  - `allocate_slot` - Random slot assignment for eligible members

## 🔧 System Configuration

### Environment Setup
```bash
# Install dependencies
npm install

# Run database migrations
npx supabase migration up

# Start development server
npm run dev
```

### Event Configuration Options
```typescript
interface EventConfig {
  eventName: string;          // Display name
  description: string;        // Event description
  eventDate: string;          // Date (YYYY-MM-DD)
  eventTime: string;          // Time (HH:MM)
  venue: string;              // Location
  maxSlots: number;           // 1-100 slots
  hostingClanId: number;      // Clan hosting event
  presentationDuration: number; // 5-30 minutes
  qaDuration: number;         // 2-15 minutes
  status: EventStatus;        // Lifecycle stage
}
```

### Access Control
- **Public Access**: View open events, participate if eligible
- **Member Access**: Slot allocation for "Basher" titled members
- **Organiser Access**: Full event and slot management capabilities

## 🎯 Usage Workflows

### Creating a New Event (Organiser)
1. Navigate to `/events/project-showcase/events`
2. Click "Create New Showcase Event"
3. Fill in event details and configuration
4. Save as "Draft" for later or "Open" for immediate registration
5. Share event link with community

### Managing Event Lifecycle (Organiser)
1. **Draft Stage**: Configure event, test settings
2. **Open Stage**: Enable registration, monitor slot allocation
3. **Closed Stage**: Finalize participants, prepare for event
4. **Completed Stage**: Archive event, export data for records

### Participating in Events (Members)
1. Visit `/events/project-showcase`
2. Browse available events (open status)
3. Check eligibility (automatic verification)
4. Click "Pick My Slot" for random allocation
5. View slot assignment and prepare presentation

### Data Management (Organiser)
1. Export event data anytime during lifecycle
2. Monitor real-time allocation progress
3. Manually assign slots for special cases
4. Update slot statuses as needed
5. Archive completed events for historical records

## 🔒 Security & Permissions

### Role-Based Access
- **Anonymous**: View public event information
- **Authenticated Members**: Participate in slot allocation
- **Eligible Members**: Must have "Basher" title for participation
- **Organisers**: Full administrative access to all features

### Data Protection
- Row Level Security (RLS) on all tables
- Organiser verification for administrative actions
- Input validation and sanitization
- Rate limiting on slot allocation attempts

## 📈 Analytics & Reporting

### Real-time Metrics
- Slot allocation progress per event
- Member participation rates
- Event timeline tracking
- Clan hosting statistics

### Export Capabilities
- Complete event data (JSON format)
- Slot allocation reports
- Member participation lists
- Historical event archives

## 🛠️ Maintenance & Cleanup

### Event Lifecycle Management
- Automatic status transitions available
- Manual override capabilities for organisers
- Bulk operations for efficiency
- Safe deletion with confirmation dialogs

### Data Cleanup
- Events can be safely deleted after completion
- Slot data archived with event deletion
- No impact on core application functionality
- Clean separation of concerns

## 🔮 Future Enhancements

### Planned Features
- **Email Notifications**: Automatic alerts for slot allocation
- **Calendar Integration**: Sync with Google Calendar/Outlook
- **Project Submission Portal**: Upload presentations and materials
- **Voting System**: Community voting for best projects
- **Certificate Generation**: Automated participation certificates
- **QR Code Check-in**: Event day attendance tracking
- **Live Streaming Integration**: Virtual participation options

### Technical Improvements
- **WebSocket Support**: Real-time slot allocation updates
- **Advanced Analytics**: Detailed reporting and insights
- **Mobile App**: Dedicated mobile experience
- **API Documentation**: Complete OpenAPI specification
- **Automated Testing**: Comprehensive test coverage

## 📋 Troubleshooting

### Common Issues
1. **Event Creation Fails**: Check organiser permissions and form validation
2. **Slot Allocation Issues**: Verify member eligibility and slot availability
3. **Permission Denied**: Ensure proper role assignment in database
4. **Data Export Problems**: Check browser download permissions

### Database Queries for Debugging
```sql
-- Check event status
SELECT * FROM project_showcase_events WHERE status = 'open';

-- View slot allocations for event
SELECT * FROM project_showcase_slots_with_members WHERE event_id = 'your-event-id';

-- Check member eligibility
SELECT * FROM members WHERE title ILIKE '%basher%';

-- Event statistics
SELECT 
  e.event_name,
  e.max_slots,
  COUNT(s.id) as allocated_slots,
  e.max_slots - COUNT(s.id) as available_slots
FROM project_showcase_events e
LEFT JOIN project_showcase_slots s ON e.event_id = s.event_id
GROUP BY e.id, e.event_name, e.max_slots;
```

---

**System Status**: ✅ Production Ready
**Last Updated**: August 30, 2025
**Version**: 2.0 (Multi-Event Support)

This comprehensive system provides everything needed to manage professional project showcase events with complete administrative control and engaging user experiences.
