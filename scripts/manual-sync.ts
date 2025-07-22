// Manual sync script for testing specific users
import { syncSpecificUser } from './discord-role-sync';
import { config } from 'dotenv';

// Load environment variables
config();

// Usage: npx tsx manual-sync.ts <discord_username>
const discordUsername = process.argv[2];

if (!discordUsername) {
  console.error('Please provide a Discord username');
  console.log('Usage: npx tsx manual-sync.ts <discord_username>');
  console.log('Example: npx tsx manual-sync.ts john_doe');
  process.exit(1);
}

console.log(`Starting manual sync for Discord user: ${discordUsername}`);

syncSpecificUser(discordUsername).then(() => {
  console.log(`✅ Manual sync completed successfully for ${discordUsername}`);
  process.exit(0);
}).catch((error) => {
  console.error(`❌ Manual sync failed for ${discordUsername}:`, error);
  process.exit(1);
});
