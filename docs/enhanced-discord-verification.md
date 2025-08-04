# Enhanced Discord Verification System

## Overview

The enhanced Discord verification system provides **real verification** of Discord usernames and proper role management, including automatic transition from Rookie to Basher roles.

## Key Features

### 1. Real Discord Username Verification
- **Actual Server Check**: Verifies the Discord username exists in the server
- **Multiple Name Formats**: Checks username, global name, and display name
- **Case Insensitive**: Handles various capitalization formats
- **Server Membership**: Ensures user has actually joined the Discord server

### 2. Enhanced Role Management
- **Rookie → Basher Transition**: Automatically removes Rookie/Visitor role when assigning Basher
- **Eligibility Checks**: Verifies user is eligible for Basher role based on their title
- **Role Verification**: Confirms role assignment was successful
- **Prevents Conflicts**: Checks for existing role assignments

### 3. Comprehensive Response Data
- **Detailed Status**: Returns verification status, role changes, and current roles
- **Error Context**: Provides specific error messages for debugging
- **Role History**: Shows what roles were added/removed during verification

## API Endpoint: `/api/discord/verify`

### Request
```json
{
  "discordId": "123456789",
  "discordUsername": "username",
  "discordDiscriminator": "1234"
}
```

### Enhanced Response
```json
{
  "success": true,
  "message": "Discord roles updated successfully! Welcome to the terminal!",
  "roleAssigned": true,
  "rolesChanged": [
    "Removed Rookie/Visitor role",
    "Added Basher role"
  ],
  "discordVerification": {
    "userExists": true,
    "currentRoles": ["basher", "member", "@everyone"]
  },
  "member": {
    "id": 123,
    "github_username": "user123",
    "discord_username": "username",
    "title": "Basher",
    "bash_points": 0,
    "clan_id": 1
  }
}
```

### Error Responses
```json
{
  "success": false,
  "error": "Discord username not found in server. Please join the Discord server first.",
  "member": { ... }
}
```

## Verification Process

### 1. Authentication Check
- Validates GitHub authentication
- Retrieves GitHub username from session
- Checks member database record

### 2. Discord Username Validation
- **Server Presence**: Confirms user exists in Discord server
- **Username Matching**: Checks multiple name formats:
  - `user.username` (e.g., "johndoe")
  - `user.globalName` (e.g., "John Doe")
  - `displayName` (e.g., "Johnny")
- **Role Analysis**: Identifies current Discord roles

### 3. Eligibility Assessment
- **Title Check**: Ensures user has eligible title:
  - ✅ Basher, Captain Bash, Organiser, Mentor, Legacy Basher, Rookie
  - ❌ Null Basher (suspended users)
- **Role Requirements**: Determines if Basher role should be assigned

### 4. Role Management
- **Remove Rookie**: If user has Rookie/Visitor role, removes it
- **Assign Basher**: Adds Basher role if eligible
- **Verify Changes**: Confirms role assignment was successful

## Testing

### Manual Testing Script
```bash
# Test Discord username verification
npx tsx scripts/test-discord-verification.ts "discord_username"
```

### Example Test Output
```
🧪 Testing Discord verification for: johndoe
✅ Discord bot connected as BashBot#1234
📋 Guild: ByteBash Community (156 members)
🔍 Searching for user: johndoe (cleaned: johndoe)
✅ Found Discord member:
   - Tag: johndoe#0000
   - ID: 123456789
   - Username: johndoe
   - Global Name: John Doe
   - Display Name: Johnny
📋 Current roles: @everyone, visitor
🎯 Has Basher role: false
🆕 Has Rookie/Visitor role: true
```

## Role Mapping

| Database Title | Discord Role Assignment |
|---------------|------------------------|
| Basher | `basher` (remove rookie/visitor) |
| Captain Bash | `basher` (admin assigns captain-bash manually) |
| Organiser | `basher` (admin assigns organiser manually) |
| Mentor | `basher` (admin assigns mentor manually) |
| Legacy Basher | `basher` |
| Rookie | `basher` (upgrade from rookie) |
| Null Basher | `visitor` (suspended users) |

## Error Handling

### Common Errors
1. **"Discord username not found in server"**
   - User hasn't joined Discord server
   - Username format mismatch
   - Typo in username

2. **"User with title 'Null Basher' is not eligible for Basher role"**
   - Suspended user trying to verify
   - Contact admin for reinstatement

3. **"Discord configuration missing"**
   - Environment variables not set
   - Bot token or guild ID missing

4. **"Role assignment completed but verification failed"**
   - Role assignment might have worked but verification failed
   - Contact admin to check manually

## Environment Variables Required

```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_guild_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## Benefits of Enhanced System

### 1. **Real Verification**
- No more fake Discord usernames
- Ensures users are actually in the server
- Validates server membership

### 2. **Proper Role Progression**
- Seamless Rookie → Basher transition
- Prevents role conflicts
- Maintains clean role hierarchy

### 3. **Better User Experience**
- Clear error messages
- Detailed feedback on role changes
- Transparent verification process

### 4. **Admin Benefits**
- Reduced manual role management
- Automatic role cleanup
- Comprehensive logging

## Integration

The enhanced verification integrates with:
- **Member Management System**: Updates member records
- **Discord Role Sync**: Leverages existing role sync infrastructure
- **Authentication System**: Uses GitHub authentication
- **Database**: Updates member Discord usernames

## Security Considerations

- **Authentication Required**: Only authenticated users can verify
- **Server Membership**: Only server members can get roles
- **Eligibility Checks**: Prevents unauthorized role assignments
- **Audit Trail**: Logs all verification attempts
