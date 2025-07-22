# Discord Role Sync Bot

This Discord bot automatically assigns roles based on terminal roles stored in your Supabase database.

## Setup Instructions

### 1. Install Dependencies
```bash
cd scripts
npm install
```

### 2. Create Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Enable the following bot permissions:
   - Manage Roles
   - View Channels
   - Read Message History

### 3. Invite Bot to Server
Use this URL (replace YOUR_CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268435456&scope=bot
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your actual values
```

### 5. Ensure Discord Roles Exist
Create these roles in your Discord server:
- `basher` (base role for all active members)
- `captain-bash` (for Captain Bash title)
- `organiser` (for Organiser title)
- `mentor` (for Mentor title)
- `visitor` (for Null Basher/suspended members)

## Role Mapping

| Supabase Title | Discord Role |
|----------------|--------------|
| Basher | basher |
| Captain Bash | captain-bash + basher |
| Organiser | organiser + basher |
| Mentor | mentor + basher |
| Legacy Basher | basher |
| Rookie | basher |
| Null Basher | visitor (removes all other roles) |

## Usage

### Run the Bot
```bash
npm start
```

### Development Mode (auto-restart)
```bash
npm run dev
```

### Sync Specific User (for testing)
```bash
npm run sync-user john_doe
```

## Key Features

- **Automatic Sync**: Runs every hour to keep roles updated
- **Smart Username Matching**: Handles Discord username changes and display names
- **Role Cleanup**: Removes inappropriate roles when status changes
- **Null Basher Handling**: Converts suspended members to visitor role
- **Error Handling**: Graceful handling of missing users or roles
- **Logging**: Detailed logs of all role changes

## Database Requirements

Your Supabase `members` table should have:
- `discord_username`: VARCHAR - Discord username of the member
- `title`: ENUM - One of the title_type values (Basher, Captain Bash, etc.)

## Bot Permissions

The bot needs these Discord permissions:
- Manage Roles
- View Channels
- Read Message History

## Troubleshooting

### User Not Found
- Check if `discord_username` in database matches actual Discord username
- Discord usernames are case-insensitive but must match exactly

### Role Not Added
- Ensure the bot's role is higher than the roles it's trying to assign
- Check bot permissions
- Verify role names match exactly (case-sensitive)

### Bot Offline
- Check Discord token is valid
- Ensure bot is invited to the server
- Check environment variables are loaded correctly
