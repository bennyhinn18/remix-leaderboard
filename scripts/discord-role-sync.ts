import { Client, GatewayIntentBits } from 'discord.js';
import { createClient } from '@supabase/supabase-js';

// Discord and Supabase configuration
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

// Initialize clients
const discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

// Role mapping from Supabase title_type to Discord role names
// Bot assigns roles based on terminal authentication status
const ROLE_MAPPING = {
  'Basher': 'basher',
  'Captain Bash': 'basher',  // Bot assigns basher, admin manually assigns captain-bash
  'Organiser': 'basher',     // Bot assigns basher, admin manually assigns organiser
  'Mentor': 'basher',        // Bot assigns basher, admin manually assigns mentor
  'Legacy Basher': 'basher',
  'Rookie': 'basher',
  'Null Basher': 'visitor'   // Special case - suspended/left members
};

// Default role for new members (before terminal verification)
const DEFAULT_ROLE = 'visitor';  // Role that only gives access to welcome/verification channels

// Roles that should be removed when someone becomes Null Basher
const COMMUNITY_ROLES = ['basher', 'captain-bash', 'organiser', 'mentor'];

interface UserData {
  discord_username: string;
  title: 'Basher' | 'Captain Bash' | 'Organiser' | 'Mentor' | 'Legacy Basher' | 'Rookie' | 'Null Basher';
}

async function syncUserRoles() {
  try {
    // Fetch users with terminal roles from Supabase
    const { data: users, error } = await supabase
      .from('members')
      .select('discord_username, title')
      .not('discord_username', 'is', null)
      .not('title', 'is', null);

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return;
    }

    const guild = await discord.guilds.fetch(GUILD_ID!);
    
    for (const user of users as UserData[]) {
      try {
        // Find Discord member by username
        const member = await findMemberByUsername(guild, user.discord_username);
        
        if (!member) {
          console.log(`Discord user not found: ${user.discord_username}`);
          continue;
        }

        const targetRoleName = ROLE_MAPPING[user.title];
        
        if (!targetRoleName) {
          console.log(`No role mapping found for title: ${user.title}`);
          continue;
        }

        // Special handling for Null Basher (suspended/left members)
        if (user.title === 'Null Basher') {
          await handleNullBasher(member, guild);
          continue;
        }

        // Handle active community members
        await handleActiveMember(member, guild, targetRoleName);

      } catch (memberError) {
        console.error(`Error processing user ${user.discord_username}:`, memberError);
      }
    }

    console.log('Role sync completed successfully');
  } catch (error) {
    console.error('Error in syncUserRoles:', error);
  }
}

async function findMemberByUsername(guild: any, discordUsername: string) {
  try {
    // Try to find member by username (without discriminator)
    const members = await guild.members.fetch();
    
    // Clean the username for comparison (remove any # and numbers)
    const cleanUsername = discordUsername.replace(/#\d{4}$/, '').toLowerCase();
    
    // Find member by username or display name
    const member = members.find((m: any) => 
      m.user.username.toLowerCase() === cleanUsername ||
      m.user.globalName?.toLowerCase() === cleanUsername ||
      m.displayName.toLowerCase() === cleanUsername
    );
    
    return member || null;
  } catch (error) {
    console.error(`Error finding member ${discordUsername}:`, error);
    return null;
  }
}

async function canManageRole(botMember: any, role: any, targetMember: any): Promise<boolean> {
  try {
    // Check if bot's highest role is higher than the role we want to manage
    const botHighestRole = botMember.roles.highest;
    if (botHighestRole.position <= role.position) {
      console.log(`Bot role '${botHighestRole.name}' (${botHighestRole.position}) is not higher than target role '${role.name}' (${role.position})`);
      return false;
    }

    // Check if target member's highest role is lower than bot's highest role
    const memberHighestRole = targetMember.roles.highest;
    if (memberHighestRole.position >= botHighestRole.position) {
      console.log(`Cannot manage ${targetMember.user.tag} - their highest role '${memberHighestRole.name}' (${memberHighestRole.position}) is >= bot's highest role '${botHighestRole.name}' (${botHighestRole.position})`);
      return false;
    }

    // Check if the role is manageable (not @everyone and not higher than bot)
    if (role.managed) {
      console.log(`Role '${role.name}' is managed by an integration and cannot be assigned manually`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error checking role permissions:`, error);
    return false;
  }
}

async function handleNullBasher(member: any, guild: any) {
  try {
    // Check bot permissions first
    const botMember = await guild.members.fetch(discord.user!.id);
    if (!botMember.permissions.has('ManageRoles')) {
      console.error(`Bot doesn't have 'Manage Roles' permission in ${guild.name}`);
      return;
    }

    // Remove the basher role (admins can manually remove other roles if needed)
    const basherRole = guild.roles.cache.find((r: any) => r.name === 'basher');
    if (basherRole && member.roles.cache.has(basherRole.id)) {
      if (await canManageRole(botMember, basherRole, member)) {
        await member.roles.remove(basherRole);
        console.log(`Removed 'basher' role from suspended user ${member.user.tag}`);
      } else {
        console.log(`Cannot remove 'basher' role from ${member.user.tag} - insufficient permissions`);
      }
    }

    // Add visitor role
    const visitorRole = guild.roles.cache.find((role: any) => role.name === 'visitor');
    if (visitorRole && !member.roles.cache.has(visitorRole.id)) {
      if (await canManageRole(botMember, visitorRole, member)) {
        await member.roles.add(visitorRole);
        console.log(`Added 'visitor' role to suspended user ${member.user.tag}`);
      } else {
        console.log(`Cannot add 'visitor' role to ${member.user.tag} - insufficient permissions`);
      }
    }

  } catch (error) {
    console.error(`Error handling Null Basher ${member.user.tag}:`, error);
  }
}

async function handleActiveMember(member: any, guild: any, targetRoleName: string) {
  try {
    console.log(`🔧 Processing active member: ${member.user.tag}`);
    
    // Check bot permissions first
    const botMember = await guild.members.fetch(discord.user!.id);
    if (!botMember.permissions.has('ManageRoles')) {
      console.error(`❌ Bot doesn't have 'Manage Roles' permission in ${guild.name}`);
      throw new Error("Bot lacks 'Manage Roles' permission");
    }
    console.log(`✅ Bot has 'Manage Roles' permission`);

    // Remove newcomer role (they've now verified with terminal)
    const newcomerRole = guild.roles.cache.find((role: any) => role.name === DEFAULT_ROLE);
    if (newcomerRole && member.roles.cache.has(newcomerRole.id)) {
      console.log(`🗑️ Removing '${DEFAULT_ROLE}' role from verified user`);
      if (await canManageRole(botMember, newcomerRole, member)) {
        await member.roles.remove(newcomerRole);
        console.log(`✅ Removed '${DEFAULT_ROLE}' role from verified user ${member.user.tag}`);
      } else {
        console.log(`⚠️ Cannot remove '${DEFAULT_ROLE}' role from ${member.user.tag} - insufficient permissions`);
      }
    } else {
      console.log(`ℹ️ User doesn't have '${DEFAULT_ROLE}' role or role not found`);
    }

    // Remove visitor role if they have it (they're now active again)
    const visitorRole = guild.roles.cache.find((role: any) => role.name === 'visitor');
    if (visitorRole && member.roles.cache.has(visitorRole.id)) {
      console.log(`🗑️ Removing 'visitor' role from reactivated user`);
      if (await canManageRole(botMember, visitorRole, member)) {
        await member.roles.remove(visitorRole);
        console.log(`✅ Removed 'visitor' role from reactivated user ${member.user.tag}`);
      } else {
        console.log(`⚠️ Cannot remove 'visitor' role from ${member.user.tag} - insufficient permissions`);
      }
    } else {
      console.log(`ℹ️ User doesn't have 'visitor' role or role not found`);
    }

    // Only assign the basher role (admins will manually assign specific roles like captain-bash, organiser, mentor)
    const basherRole = guild.roles.cache.find((role: any) => role.name === 'basher');
    if (!basherRole) {
      console.error(`❌ 'basher' role not found in Discord server`);
      throw new Error("'basher' role not found in Discord server");
    }
    console.log(`✅ Found 'basher' role (ID: ${basherRole.id})`);

    if (member.roles.cache.has(basherRole.id)) {
      console.log(`ℹ️ User ${member.user.tag} already has 'basher' role`);
    } else {
      console.log(`🎯 Adding 'basher' role to ${member.user.tag}`);
      if (await canManageRole(botMember, basherRole, member)) {
        await member.roles.add(basherRole);
        console.log(`✅ Terminal verification successful! Added 'basher' role to ${member.user.tag}`);
      } else {
        console.error(`❌ Cannot add 'basher' role to ${member.user.tag} - insufficient permissions`);
        throw new Error(`Cannot add 'basher' role to ${member.user.tag} - insufficient permissions`);
      }
    }

  } catch (error) {
    console.error(`❌ Error handling active member ${member.user.tag}:`, error);
    throw error;
  }
}

// Function to manually sync a specific user (useful for testing)
async function syncSpecificUser(discordUsername: string) {
  try {
    console.log(`🔍 Looking up user in database: ${discordUsername}`);
    
    // Ensure Discord bot is ready
    if (!discord.isReady()) {
      console.log(`🔗 Discord bot not ready, connecting...`);
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
    }
    
    const { data: user, error } = await supabase
      .from('members')
      .select('discord_username, title, github_username, name')
      .eq('discord_username', discordUsername)
      .single();

    if (error) {
      console.error(`❌ Database error for ${discordUsername}:`, error);
      if (error.code === 'PGRST116') {
        console.error(`❌ User ${discordUsername} not found in database. Please verify they have completed the registration process.`);
      }
      throw error;
    }

    if (!user) {
      console.error(`❌ User ${discordUsername} not found in database`);
      throw new Error(`User ${discordUsername} not found in database`);
    }

    console.log(`✅ Found user in database:`, {
      discord_username: user.discord_username,
      title: user.title,
      github_username: user.github_username,
      name: user.name
    });

    console.log(`🔗 Connecting to Discord guild: ${GUILD_ID}`);
    const guild = await discord.guilds.fetch(GUILD_ID!);
    
    console.log(`👤 Looking for Discord member: ${discordUsername}`);
    const member = await findMemberByUsername(guild, discordUsername);
    
    if (!member) {
      console.error(`❌ Discord user not found in server: ${discordUsername}`);
      console.error(`   Make sure the user has joined the Discord server and the username is correct.`);
      throw new Error(`Discord user not found: ${discordUsername}`);
    }

    console.log(`✅ Found Discord member: ${member.user.tag} (ID: ${member.user.id})`);

    const targetRoleName = ROLE_MAPPING[user.title as keyof typeof ROLE_MAPPING];
    console.log(`🎯 Target role for title '${user.title}': ${targetRoleName}`);

    if (user.title === 'Null Basher') {
      console.log(`⚠️ Handling Null Basher (suspended user): ${member.user.tag}`);
      await handleNullBasher(member, guild);
    } else {
      console.log(`🚀 Handling active member: ${member.user.tag}`);
      await handleActiveMember(member, guild, targetRoleName);
    }

    console.log(`✅ Successfully synced user ${member.user.tag}`);
  } catch (error) {
    console.error(`❌ Error syncing specific user ${discordUsername}:`, error);
    throw error;
  }
}

// Handle new members joining the server
async function handleNewMember(member: any) {
  try {
    const guild = member.guild;
    const botMember = await guild.members.fetch(discord.user!.id);
    
    // Assign newcomer role to new members
    const newcomerRole = guild.roles.cache.find((role: any) => role.name === DEFAULT_ROLE);
    if (newcomerRole) {
      if (await canManageRole(botMember, newcomerRole, member)) {
        await member.roles.add(newcomerRole);
        console.log(`🆕 New member ${member.user.tag} joined! Assigned '${DEFAULT_ROLE}' role`);
        
        // Send welcome message with verification instructions
        await sendWelcomeMessage(member);
      } else {
        console.log(`Cannot assign '${DEFAULT_ROLE}' role to new member ${member.user.tag}`);
      }
    } else {
      console.log(`'${DEFAULT_ROLE}' role not found for new member ${member.user.tag}`);
    }
  } catch (error) {
    console.error(`Error handling new member ${member.user.tag}:`, error);
  }
}

// Send welcome message with verification instructions
async function sendWelcomeMessage(member: any) {
  try {
    const welcomeEmbed = {
      color: 0x00ff00,
      title: '🎉 Welcome to ByteBashBlitz Terminal!',
      description: `Welcome ${member.user.username}! To access our community channels, you need to verify your account with our Basher Terminal.`,
      fields: [
        {
          name: '🔐 How to Verify',
          value: '1. Visit our Basher Terminal website\n2. Connect your Discord account\n3. Complete the verification process\n4. You\'ll automatically get the `basher` role!'
        },
        {
          name: '📚 Current Access',
          value: 'You currently have access to:\n• Welcome channels\n• Verification guide\n• General announcements'
        },
        {
          name: '🎯 After Verification',
          value: 'Once verified, you\'ll unlock:\n• Basher channels\n• Community events\n• Project showcase\n• And much more!'
        }
      ],
      footer: {
        text: 'Need help? Ask in the #help channel!'
      }
    };

    await member.send({ embeds: [welcomeEmbed] });
    console.log(`Sent welcome message to ${member.user.tag}`);
  } catch (error) {
    console.log(`Could not send welcome message to ${member.user.tag}:`, (error as Error).message);
  }
}

// Manual verification command (for testing or admin use)
async function verifyUser(discordUsername: string, adminUserId?: string) {
  try {
    // Check if admin is authorized (optional)
    if (adminUserId) {
      const guild = await discord.guilds.fetch(GUILD_ID!);
      const adminMember = await guild.members.fetch(adminUserId);
      const hasPermission = adminMember.permissions.has('ManageRoles') || 
                           adminMember.roles.cache.some((role: any) => 
                             ['organiser', 'mentor', 'admin'].includes(role.name.toLowerCase())
                           );
      
      if (!hasPermission) {
        console.log(`User ${adminMember.user.tag} attempted verification but lacks permissions`);
        return false;
      }
    }

    // Add user to database with basher role
    const { error } = await supabase
      .from('members')
      .upsert({ 
        discord_username: discordUsername, 
        title: 'Basher',
        name: discordUsername // You might want to get actual name
      }, { 
        onConflict: 'discord_username' 
      });

    if (error) {
      console.error('Error adding user to database:', error);
      return false;
    }

    // Sync the user's roles
    await syncSpecificUser(discordUsername);
    return true;
    
  } catch (error) {
    console.error('Error in manual verification:', error);
    return false;
  }
}

// Bot ready event
discord.once('ready', () => {
  console.log(`Bot logged in as ${discord.user?.tag}`);
  
  console.log('\n🤖 BASHER TERMINAL VERIFICATION BOT READY');
  console.log('Workflow:');
  console.log('1. New members get "newcomer" role (limited access)');
  console.log('2. Members verify through Basher Terminal website');
  console.log('3. Bot assigns "basher" role after verification');
  console.log('4. Admins manually assign leadership roles\n');
  
  // // Run sync immediately and then every hour
  // syncUserRoles();
  // setInterval(syncUserRoles, 60 * 60 * 1000); // Every hour
});

// Handle new members joining
discord.on('guildMemberAdd', handleNewMember);

// Export for manual testing
export { syncSpecificUser, verifyUser, handleNewMember };

// Login to Discord
discord.login(DISCORD_TOKEN);
