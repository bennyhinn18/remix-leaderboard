# Member Management System Documentation

This comprehensive member management system for organisers provides complete control over community members, roles, Discord integration, and analytics.

## 🚀 Features Overview

### 1. **Member Management Dashboard** (`/admin/members`)
- **View all members** with advanced filtering and search
- **Role-based access control** with visual role indicators
- **Bulk operations** for efficient management
- **Real-time Discord sync status**
- **Member statistics** and quick insights
- **Export functionality** for data backup

### 2. **Add Single Member** (`/admin/members/add`)
- **GitHub integration** with real-time profile preview
- **Role assignment** with permission descriptions
- **Contact information** management
- **Clan assignment** with existing clan selection
- **Automatic avatar** fetching from GitHub
- **Form validation** with error handling

### 3. **Bulk Import Members** (`/admin/members/bulk-add`)
- **CSV upload support** with drag-and-drop interface
- **Data validation** with detailed error reporting
- **Preview system** before final import
- **Template download** for proper formatting
- **Duplicate detection** and conflict resolution
- **Progress tracking** during import

### 4. **Discord Role Management** (`/admin/discord-roles`)
- **Real-time Discord sync** with individual and bulk operations
- **Role assignment** directly from the interface
- **Sync status monitoring** with detailed logs
- **Discord server statistics** and member counts
- **Automated role mapping** based on community roles
- **Username management** for Discord linking

### 5. **Member Analytics** (`/admin/members/analytics`)
- **Comprehensive statistics** with multiple view modes
- **Role distribution** analysis with visual charts
- **Activity tracking** and engagement metrics
- **Points distribution** across different tiers
- **Growth metrics** with trend analysis
- **Top performers** and most active members

### 6. **Discord CLI Tool** (`scripts/discord-cli.ts`)
- **Terminal-based management** for advanced users
- **Bulk operations** with dry-run capability
- **Role assignment** and removal from command line
- **Member listing** with filtering options
- **Server statistics** reporting
- **Automated sync scripts** for scheduled operations

## 🔧 Available Roles

| Role | Description | Permissions | Discord Role |
|------|-------------|-------------|--------------|
| **Organiser** | Community administrators | Full admin access, manage all members, create events, award points | @Organiser |
| **Captain Bash** | Team captains | Manage clan members, assign tasks, view clan analytics | @Captain Bash |
| **Mentor** | Experienced guides | Guide new members, access mentor resources, create study groups | @Mentor |
| **Legacy Basher** | Long-standing members | Special recognition, enhanced privileges | @Legacy Basher |
| **Basher** | Regular members | Participate in events, join clans, earn points | @Basher |
| **Rookie** | New members | Limited access, probationary period, basic participation | @Rookie |
| **Null Basher** | Suspended members | Suspended account, no Discord access, read-only permissions | No Discord role |

## 📊 Points Tiers

The system uses a tiered points system to track member progress:

- **Diamond** (3000+): Master level
- **Obsidian** (2600-2999): Expert level
- **Pearl** (2200-2599): Advanced level
- **Amethyst** (1750-2199): Intermediate+ level
- **Emerald** (1350-1749): Intermediate level
- **Ruby** (1000-1349): Developing level
- **Sapphire** (700-999): Growing level
- **Gold** (450-699): Learning level
- **Silver** (250-449): Beginner+ level
- **Bronze** (0-249): Beginner level

## 🔗 Discord Integration

### Automatic Role Sync
- **Real-time synchronization** when roles are changed
- **Batch processing** for bulk updates
- **Error handling** with retry mechanisms
- **Logging system** for audit trails

### Discord CLI Commands
```bash
# Sync single member
./scripts/discord-cli.ts sync-role johndoe

# Bulk sync with dry run
./scripts/discord-cli.ts bulk-sync --dry-run

# Assign role
./scripts/discord-cli.ts assign-role "johndoe#1234" "Captain Bash"

# Remove role (suspend)
./scripts/discord-cli.ts remove-role "johndoe#1234"

# List members by role
./scripts/discord-cli.ts list-members --role "Organiser"

# Server statistics
./scripts/discord-cli.ts server-stats
```

## 📥 Bulk Import Format

### CSV Template
```csv
name,github_username,title,discord_username,personal_email,mobile_number,clan_name,bash_points
John Doe,johndoe,Basher,johndoe#1234,john@example.com,+1234567890,Alpha Clan,0
Jane Smith,janesmith,Captain Bash,janesmith#5678,jane@example.com,+0987654321,Beta Clan,100
```

### Required Fields
- **name**: Full name of the member
- **github_username**: GitHub username (case-sensitive)
- **title**: Role from the valid roles list

### Optional Fields
- **discord_username**: Discord username with discriminator
- **personal_email**: Contact email address
- **mobile_number**: Phone number
- **clan_name**: Existing clan name (will be matched automatically)
- **bash_points**: Initial points (defaults to 0)

## 🛡️ Security Features

### Access Control
- **Role-based permissions** with organiser-only access
- **Authentication required** for all admin functions
- **Audit logging** for all member changes
- **Data validation** to prevent invalid entries

### Data Protection
- **Input sanitization** to prevent injection attacks
- **Rate limiting** on bulk operations
- **Backup functionality** with export options
- **Error handling** with graceful degradation

## 📱 User Interface Features

### Responsive Design
- **Mobile-friendly** interface for on-the-go management
- **Dark theme** optimized for extended use
- **Intuitive navigation** with breadcrumbs and clear actions
- **Real-time updates** with loading states

### Search and Filtering
- **Advanced search** across multiple fields
- **Role-based filtering** with multi-select options
- **Clan filtering** including "no clan" members
- **Status filtering** for Discord sync status

### Bulk Operations
- **Multi-select functionality** with select-all option
- **Bulk role updates** with confirmation dialogs
- **Bulk Discord sync** with progress tracking
- **Export selected** members for targeted operations

## 🔄 Workflow Examples

### Adding a New Member
1. Navigate to `/admin/members/add`
2. Enter basic information (name, GitHub username, role)
3. Preview GitHub profile for verification
4. Add contact information and clan assignment
5. Save and automatically trigger Discord sync

### Bulk Member Import
1. Download CSV template from `/admin/members/bulk-add`
2. Fill template with member information
3. Upload and validate data
4. Review validation results and fix errors
5. Import valid members with automatic Discord sync

### Managing Discord Roles
1. Access Discord management at `/admin/discord-roles`
2. View sync status for all members
3. Perform individual or bulk synchronization
4. Monitor logs for successful operations
5. Handle failed syncs with error details

### Analyzing Member Data
1. Visit analytics dashboard at `/admin/members/analytics`
2. Switch between different view modes
3. Export data for external analysis
4. Track growth and engagement metrics
5. Identify top performers and active members

## 🚨 Troubleshooting

### Common Issues

**Discord Sync Failures**
- Verify Discord bot token and permissions
- Check Discord server ID configuration
- Ensure member has valid Discord username
- Review Discord API rate limits

**Import Validation Errors**
- Check CSV format matches template exactly
- Verify GitHub usernames exist and are spelled correctly
- Ensure roles match valid role names
- Check for duplicate usernames in CSV

**Permission Issues**
- Verify user has organiser role
- Check authentication token validity
- Ensure proper database permissions
- Review environment variable configuration

### Error Messages

| Error | Cause | Solution |
|-------|--------|----------|
| "Member not found" | Invalid GitHub username | Verify username exists on GitHub |
| "Discord username already exists" | Duplicate Discord username | Check for existing member with same Discord username |
| "Invalid role" | Role not in valid roles list | Use exact role name from valid roles |
| "Failed to sync Discord role" | Discord API error | Check bot permissions and rate limits |
| "Unauthorized" | User lacks organiser permissions | Verify user role in database |

## 🔧 Configuration

### Environment Variables
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Discord
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_server_id

# Optional
GITHUB_TOKEN=your_github_token  # For higher API rate limits
```

### Database Tables
- **members**: Core member information
- **clans**: Clan/team information
- **points**: Points history and activities
- **notifications**: System notifications

## 📈 Analytics Insights

### Key Metrics Tracked
- **Member growth** over time
- **Discord adoption** rates
- **Activity levels** by role and clan
- **Points distribution** across tiers
- **Engagement patterns** and trends

### Available Reports
- **Role distribution** with percentages
- **Clan membership** analysis
- **Top performers** leaderboard
- **Recent activity** timeline
- **Growth trends** with projections

## 🎯 Best Practices

### For Organisers
1. **Regular backups** using export functionality
2. **Monitor Discord sync** status regularly
3. **Use bulk operations** for efficiency
4. **Review analytics** for community insights
5. **Maintain clean data** with validation

### For Data Management
1. **Validate imports** before processing
2. **Use consistent naming** conventions
3. **Keep contact information** up to date
4. **Regular role reviews** and updates
5. **Document changes** in notes fields

### For Discord Integration
1. **Test sync operations** with small batches first
2. **Monitor rate limits** during bulk operations
3. **Keep Discord usernames** updated
4. **Handle suspended members** appropriately
5. **Use CLI tools** for automated operations

## 🚀 Advanced Features

### Automation Capabilities
- **Scheduled sync** operations via CLI
- **Webhook integration** for real-time updates
- **Batch processing** for large operations
- **Error recovery** with retry mechanisms
- **Audit trails** for compliance

### Integration Options
- **GitHub API** for profile information
- **Discord API** for role management
- **Supabase** for data persistence
- **Export formats** for external tools
- **CLI interface** for scripting

This comprehensive member management system provides all the tools needed to effectively manage a growing community with proper role hierarchies, Discord integration, and detailed analytics.
