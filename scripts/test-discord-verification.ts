#!/usr/bin/env npx tsx

/**
 * Test script for enhanced Discord verification
 * Usage: npx tsx scripts/test-discord-verification.ts <discord_username>
 */

import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

// Load environment variables
config({ path: '.env' });

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

// Initialize Discord client
const discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

async function testDiscordVerification(discordUsername: string) {
  try {
    console.log(`🧪 Testing Discord verification for: ${discordUsername}`);
    
    if (!GUILD_ID || !DISCORD_TOKEN) {
      throw new Error('Discord configuration missing');
    }

    // Connect to Discord
    await discord.login(DISCORD_TOKEN);
    
    // Wait for bot to be ready
    await new Promise((resolve) => {
      if (discord.isReady()) {
        resolve(true);
      } else {
        discord.once('ready', () => resolve(true));
      }
    });

    console.log(`✅ Discord bot connected as ${discord.user?.tag}`);

    const guild = await discord.guilds.fetch(GUILD_ID);
    console.log(`📋 Guild: ${guild.name} (${guild.memberCount} members)`);
    
    // Find member by username (case insensitive, check username, globalName, and displayName)
    const members = await guild.members.fetch();
    const cleanUsername = discordUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    console.log(`🔍 Searching for user: ${discordUsername} (cleaned: ${cleanUsername})`);
    
    const member = members.find((m: any) => 
      m.user.username.toLowerCase() === cleanUsername ||
      m.user.globalName?.toLowerCase() === cleanUsername ||
      m.displayName.toLowerCase() === cleanUsername ||
      m.user.username.toLowerCase() === discordUsername.toLowerCase() ||
      m.user.globalName?.toLowerCase() === discordUsername.toLowerCase() ||
      m.displayName.toLowerCase() === discordUsername.toLowerCase()
    );

    if (!member) {
      console.log(`❌ Discord user not found in server: ${discordUsername}`);
      console.log(`📝 Available users (first 10):`);
      const userList = Array.from(members.values()).slice(0, 10);
      userList.forEach(m => {
        console.log(`   - ${m.user.username} (${m.user.globalName || 'no global name'}) [${m.displayName}]`);
      });
      return false;
    }

    // Get current roles
    const currentRoles = member.roles.cache.map((role: any) => role.name);
    const hasBasherRole = currentRoles.includes('basher');
    const hasRookieRole = currentRoles.includes('rookie') || currentRoles.includes('visitor');

    console.log(`✅ Found Discord member:`);
    console.log(`   - Tag: ${member.user.tag}`);
    console.log(`   - ID: ${member.user.id}`);
    console.log(`   - Username: ${member.user.username}`);
    console.log(`   - Global Name: ${member.user.globalName || 'None'}`);
    console.log(`   - Display Name: ${member.displayName}`);
    console.log(`📋 Current roles: ${currentRoles.join(', ')}`);
    console.log(`🎯 Has Basher role: ${hasBasherRole}`);
    console.log(`🆕 Has Rookie/Visitor role: ${hasRookieRole}`);

    return {
      exists: true,
      member,
      currentRoles,
      hasBasherRole,
      hasRookieRole
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await discord.destroy();
  }
}

// Run test
const username = process.argv[2];
if (!username) {
  console.log('Usage: npx tsx scripts/test-discord-verification.ts <discord_username>');
  process.exit(1);
}

testDiscordVerification(username)
  .then(result => {
    if (result) {
      console.log('✅ Discord verification test completed successfully');
    } else {
      console.log('❌ Discord verification test failed');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Test crashed:', error);
    process.exit(1);
  });
