import { Client, GatewayIntentBits } from 'discord.js';

// Single Discord client instance for role assignments
let discordClient: Client | null = null;

// Initialize Discord client if not already done
async function getDiscordClient(): Promise<Client | null> {
  if (!discordClient) {
    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    
    if (!token || !guildId) {
      console.error('Discord bot token or guild ID not configured');
      return null;
    }

    discordClient = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
    });

    try {
      await discordClient.login(token);
      console.log('Discord bot connected for role assignment');
    } catch (error) {
      console.error('Failed to connect Discord bot:', error);
      discordClient = null;
      return null;
    }
  }

  return discordClient;
}

// Find Discord member by username
async function findDiscordMember(guild: any, discordUsername: string) {
  try {
    const members = await guild.members.fetch();
    const cleanUsername = discordUsername.toLowerCase().trim();
    
    const member = members.find((m: any) => 
      m.user.username.toLowerCase() === cleanUsername ||
      m.user.globalName?.toLowerCase() === cleanUsername ||
      m.displayName?.toLowerCase() === cleanUsername
    );
    
    return member || null;
  } catch (error) {
    console.error(`Error finding Discord member ${discordUsername}:`, error);
    return null;
  }
}

// Check if bot can manage a role
async function canManageRole(botMember: any, role: any): Promise<boolean> {
  try {
    const botHighestRole = botMember.roles.highest;
    
    if (botHighestRole.position <= role.position) {
      console.log(`Bot role position ${botHighestRole.position} is not higher than target role position ${role.position}`);
      return false;
    }

    if (role.managed) {
      console.log(`Role '${role.name}' is managed by integration and cannot be assigned`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking role permissions:', error);
    return false;
  }
}

// Main function to assign Discord role
export async function assignDiscordRole(discordUsername: string, title: string | null): Promise<boolean> {
  try {
    const client = await getDiscordClient();
    if (!client) {
      console.error('Discord client not available');
      return false;
    }

    const guildId = process.env.DISCORD_GUILD_ID;
    if (!guildId) {
      console.error('Discord guild ID not configured');
      return false;
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`Guild ${guildId} not found`);
      return false;
    }

    // Find the Discord member
    const member = await findDiscordMember(guild, discordUsername);
    if (!member) {
      console.error(`Discord member ${discordUsername} not found in server`);
      return false;
    }

    // Get bot member for permission checking
    const botMember = await guild.members.fetch(client.user!.id);
    if (!botMember.permissions.has('ManageRoles')) {
      console.error('Bot does not have Manage Roles permission');
      return false;
    }

    // Determine target role based on title
    let targetRoleName: string;
    if (title === null || title === 'Null Basher') {
      targetRoleName = 'visitor';
    } else {
      targetRoleName = 'basher';
    }

    // Find roles in guild
    const targetRole = guild.roles.cache.find(role => role.name.toLowerCase() === targetRoleName.toLowerCase());
    const newcomerRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'newcomer');

    if (!targetRole) {
      console.error(`Target role '${targetRoleName}' not found in guild`);
      return false;
    }

    // Check if bot can manage the target role
    if (!await canManageRole(botMember, targetRole)) {
      console.error(`Bot cannot manage role '${targetRole.name}'`);
      return false;
    }

    // Remove newcomer role if present
    if (newcomerRole && member.roles.cache.has(newcomerRole.id)) {
      if (await canManageRole(botMember, newcomerRole)) {
        await member.roles.remove(newcomerRole);
        console.log(`Removed 'newcomer' role from ${member.user.tag}`);
      }
    }

    // Add target role if not already present
    if (!member.roles.cache.has(targetRole.id)) {
      await member.roles.add(targetRole);
      console.log(`Added '${targetRole.name}' role to ${member.user.tag}`);
    } else {
      console.log(`${member.user.tag} already has '${targetRole.name}' role`);
    }

    return true;

  } catch (error) {
    console.error('Error assigning Discord role:', error);
    return false;
  }
}

// Function to verify user and assign role (for manual testing)
export async function verifyAndAssignRole(discordUsername: string, githubUsername: string): Promise<boolean> {
  console.log(`Starting verification for Discord: ${discordUsername}, GitHub: ${githubUsername}`);
  
  // For now, assume all verified users get 'Basher' title
  // In a real implementation, you'd fetch from database
  const success = await assignDiscordRole(discordUsername, 'Basher');
  
  if (success) {
    console.log(`✅ Successfully verified and assigned role to ${discordUsername}`);
  } else {
    console.log(`❌ Failed to verify and assign role to ${discordUsername}`);
  }
  
  return success;
}

// Cleanup function
export function disconnectDiscordClient() {
  if (discordClient) {
    discordClient.destroy();
    discordClient = null;
    console.log('Discord client disconnected');
  }
}
