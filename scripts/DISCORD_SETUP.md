# Discord Server Setup for Terminal Verification

## Required Roles

Create these roles in your Discord server (in this hierarchy order, from top to bottom):

### 1. **BashEye** (Bot Role)
- **Permissions**: Manage Roles, View Channels, Send Messages
- **Position**: Must be above all roles it manages

### 2. **Admin/Organiser Roles** (Manually assigned)
- `organiser` - For community organizers
- `mentor` - For mentors
- `captain-bash` - For team captains

### 3. **Verified Member Role** (Bot managed)
- `basher` - Assigned after terminal verification
- **Color**: Green/Blue (indicates verified status)

### 4. **Unverified Roles** (Bot managed)
- `newcomer` - Default role for new members
- `visitor` - For suspended/former members

## Channel Structure

### **Public Channels** (Everyone can see)
```
📢 WELCOME & INFO
├── 📋 rules
├── 📝 announcements  
└── 🎯 verification-guide

🆘 SUPPORT
└── 💬 help
```

### **Newcomer Channels** (newcomer role access)
```
🚪 VERIFICATION
├── ✅ verify-here (instructions + bot commands)
└── 🔗 terminal-login (link to your website)
```

### **Basher Channels** (basher role access)
```
💬 COMMUNITY
├── 💭 general-chat
├── 🎮 gaming
└── 📸 media-share

🛠️ DEVELOPMENT  
├── 💻 coding-help
├── 🚀 project-showcase
├── 📚 resources
└── 🐛 debugging

🎉 EVENTS
├── 📅 upcoming-events
├── 🏆 competitions
└── 🎊 event-photos
```

### **Leadership Channels** (organiser/mentor access)
```
👑 LEADERSHIP
├── 🔧 admin-commands
├── 📊 analytics
└── 🎯 planning
```

## Channel Permissions Setup

### For `newcomer` role:
- ✅ View: Welcome & Info, Support, Verification channels
- ❌ Cannot access: Basher channels, Leadership channels

### For `basher` role:
- ✅ View: All public channels + Community + Development + Events
- ❌ Cannot access: Leadership channels

### For `organiser`/`mentor` roles:
- ✅ View: All channels including Leadership
- ✅ Manage messages, manage roles (limited)

## Verification Flow

1. **New Member Joins**
   ```
   User joins server → Bot assigns "newcomer" role → Limited access
   ```

2. **Welcome Message**
   ```
   Bot sends DM with verification instructions OR user sees #verification-guide
   ```

3. **Verification Process Options**
   ```
   Option A: User → Terminal Website (/discord/verify) → Step-by-step verification
   Option B: User → Profile page → Discord link button → Quick modal verification
   ```

4. **Account Linking**
   ```
   User authenticated with GitHub OAuth → Enters Discord username → API links accounts
   ```

5. **Automatic Role Assignment**
   ```
   Bot removes "newcomer" + adds "basher" → Full community access
   ```

6. **Status Updates**
   ```
   Database updated with discord_username → Role sync maintained automatically
   ```

## Verification Components

### 1. Full Verification Page (`/discord/verify`)

Complete step-by-step verification interface with:
- User authentication check (GitHub OAuth)
- Discord server join instructions
- Username linking form
- Real-time verification status
- Success confirmation with next steps

**Features:**
- Progress indicator (3 steps)
- Error handling and validation
- Mobile-responsive design
- Animated transitions
- Direct Discord server link

### 2. Discord Link Button Component

Embeddable component for any page with multiple variants:

```tsx
// Card variant - for profile pages
<DiscordLinkButton 
  variant="card" 
  isLinked={!!member?.discord_username} 
  discordUsername={member?.discord_username} 
/>

// Minimal variant - for compact spaces
<DiscordLinkButton 
  variant="minimal" 
  isLinked={!!member?.discord_username} 
/>

// Default variant - standalone button
<DiscordLinkButton 
  isLinked={!!member?.discord_username}
  discordUsername={member?.discord_username} 
/>
```

**Features:**
- Modal-based interface
- Real-time status updates
- Error handling
- Success animations
- Automatic page refresh on completion

### 3. API Integration (`/api/discord/verify`)

Backend endpoint that handles the verification:

```typescript
POST /api/discord/verify
{
  "discordId": "user_discord_id",        // Optional for now
  "discordUsername": "user_discord_name"  // Required
}
```

**Process:**
1. Validates user session (GitHub OAuth)
2. Gets GitHub username from authenticated user
3. Creates/updates member record in database
4. Links Discord username to GitHub account
5. Triggers bot role assignment
6. Returns success/error response

**Security:**
- Requires valid user session
- Input validation and sanitization
- Rate limiting protection
- Error logging for monitoring

## Bot Commands (for testing)

```bash
# Verify a user manually (for testing)
npm run verify-user john_doe

# Sync existing user
npm run sync-user john_doe

# Check bot setup
npm run diagnostic
```

## Testing the Verification System

### End-to-End Testing

1. **Setup Test Accounts**
   ```bash
   # Create test Discord account
   # Create test GitHub account
   # Link GitHub to test account in Terminal
   ```

2. **Test Full Verification Flow**
   ```bash
   # Join Discord server with test account (should get newcomer role)
   # Login to Terminal with test GitHub account
   # Go to /discord/verify page
   # Complete verification process
   # Check Discord role assignment
   # Verify database record update
   ```

3. **Test Component Integration**
   ```bash
   # Test Discord link button on profile page
   # Test modal verification interface
   # Test error handling (invalid username, network issues)
   # Test success states and animations
   ```

### API Testing

Test the verification endpoint directly:

```bash
# Test successful verification
curl -X POST http://localhost:3000/api/discord/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"discordUsername":"testuser123"}'

# Expected response:
{
  "success": true,
  "message": "Discord account linked successfully",
  "role": "basher"
}
```

### Bot Testing

```bash
# Run bot in development mode with logging
cd scripts
npm run discord-sync

# Test role assignment manually
npm run verify-user testuser123

# Check bot connectivity
npm run diagnostic
```

### Database Verification

Check that records are properly created/updated:

```sql
-- Check member record creation
SELECT * FROM members WHERE github_username = 'test-github-user';

-- Verify discord_username linking
SELECT github_username, discord_username, title 
FROM members 
WHERE discord_username = 'testuser123';
```

### Common Test Scenarios

1. **New User Verification**
   - User not in database → Creates new member record
   - Discord role: newcomer → basher

2. **Existing User Linking**
   - User in database, no discord_username → Updates record
   - Discord role: newcomer → basher

3. **Suspended User**
   - User in database with title = null → Role assignment
   - Discord role: newcomer → visitor

4. **Error Handling**
   - Invalid Discord username → Error message
   - User not authenticated → Redirect to login
   - Bot offline → Graceful error handling
   - Network issues → Retry mechanisms

## Verification Guide Channel Content

Create a channel called `#verification-guide` with this content:

```markdown
# 🔐 Account Verification Required

Welcome to **ByteBashBlitz Terminal**! To access our community channels, you need to verify your account.

## 📋 Steps to Verify:

1. **Visit Terminal Website**
   🔗 [Basher Terminal Login](https://your-website.com/verify)

2. **Connect Discord Account**
   🔗 Link your Discord account on the website

3. **Complete Profile**
   📝 Fill out your terminal profile

4. **Automatic Role Assignment**
   🤖 Our bot will automatically give you the `basher` role!

## ❓ Need Help?

- Ask in #help channel
- DM any @organiser or @mentor
- Check #rules for community guidelines

## 🎯 What You'll Get Access To:

✅ General chat and community channels
✅ Development discussions and project showcase  
✅ Event announcements and participation
✅ Resource sharing and coding help
✅ Gaming and social channels

---
*Having trouble? Make sure you're using the same Discord account!*
```

This setup creates a professional verification system similar to Microsoft's approach! 🚀
