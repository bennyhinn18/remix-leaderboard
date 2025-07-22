# Quick Discord Setup for Role Assignment

## 🚨 Issue: Discord Role Not Assigned

The verification page shows success, but no Discord role is assigned because the Discord bot environment variables are not configured.

## ⚡ Quick Fix Steps

### 1. Set Environment Variables

Add these to your `.env` file in the root directory:

```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here

# Existing Supabase config (already set)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Get Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Create new application or select existing one
3. Go to "Bot" section
4. Copy the bot token (keep it secret!)
5. Add it to your `.env` file

### 3. Get Discord Server ID

1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click your Discord server
3. Select "Copy Server ID"
4. Add it to your `.env` file

### 4. Invite Bot to Server

1. In Discord Developer Portal, go to OAuth2 → URL Generator
2. Select scopes: `bot`
3. Select permissions: `Manage Roles`, `View Channels`, `Send Messages`
4. Use generated URL to invite bot to your server
5. **IMPORTANT**: Position bot role above "basher", "visitor", and "newcomer" roles

### 5. Test Role Assignment

Once environment variables are set:

```bash
# Test the manual role assignment
cd scripts
npm run assign-role your_discord_username

# Expected output:
# ✅ Connected as BotName#1234
# 👤 Found Discord member: YourName#1234
# ✅ Added 'basher' role
```

## 🔄 Alternative: Manual Role Assignment

If you want to manually assign roles while the bot is being set up:

1. **In Discord Server:**
   - Right-click the user
   - Select "Roles"
   - Remove "newcomer" role
   - Add "basher" role

2. **Verify Database:**
   ```sql
   SELECT github_username, discord_username, title 
   FROM members 
   WHERE discord_username = 'their_discord_username';
   ```

## 🤖 Automatic Role Assignment Flow

Once properly configured, this is how it works:

```
User submits /discord/verify
    ↓
API updates database with discord_username
    ↓
API calls assignDiscordRole() function
    ↓
Bot removes "newcomer" role
    ↓
Bot adds "basher" role
    ↓
User gets full server access
```

## 🐛 Common Issues

### Bot Can't Assign Roles
- **Check**: Bot has "Manage Roles" permission
- **Check**: Bot role is above target roles in hierarchy
- **Check**: Bot is online and connected

### User Not Found
- **Check**: Discord username spelling
- **Check**: User is actually in the Discord server
- **Check**: User hasn't changed their username recently

### Database Issues
- **Check**: GitHub OAuth is working
- **Check**: Member record exists in database
- **Check**: discord_username field is properly updated

## 🔧 Quick Debug Commands

```bash
# Check if bot connects
cd scripts
npm run diagnostic

# Manually assign role
npm run assign-role username

# Sync all users (when bot is working)
npm run start
```

## 📞 Need Help?

1. **Environment Setup**: Make sure all variables in `.env` are correct
2. **Discord Permissions**: Bot needs proper role hierarchy
3. **Manual Assignment**: Assign roles manually while debugging
4. **Check Logs**: Look for error messages in terminal when testing

The verification system will work perfectly once the Discord bot is properly configured! 🚀
