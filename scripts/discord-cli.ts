#!/usr/bin/env ts-node

/**
 * Discord Management CLI Tool
 * 
 * This script provides terminal commands for managing Discord roles and users
 * for the Byte Bash Blitz community.
 * 
 * Usage:
 *   ./discord-cli.ts sync-role <github_username>
 *   ./discord-cli.ts bulk-sync [--dry-run]
 *   ./discord-cli.ts assign-role <discord_username> <role_name>
 *   ./discord-cli.ts remove-role <discord_username> <role_name>
 *   ./discord-cli.ts list-members [--role <role_name>]
 *   ./discord-cli.ts server-stats
 */

import { createClient } from '@supabase/supabase-js';
import { syncSpecificUser } from './discord-role-sync';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Member {
  id: number;
  name: string;
  github_username: string;
  discord_username: string | null;
  title: string;
  bash_points: number;
  clan?: { clan_name: string };
}

class DiscordCLI {
  private static readonly VALID_ROLES = [
    'Organiser',
    'Captain Bash', 
    'Mentor',
    'Legacy Basher',
    'Basher',
    'Rookie',
    'Null Basher'
  ];

  /**
   * Sync Discord role for a specific member by GitHub username
   */
  static async syncRole(githubUsername: string): Promise<void> {
    try {
      console.log(`🔄 Syncing Discord role for ${githubUsername}...`);
      
      // Get member details
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('github_username', githubUsername)
        .single();

      if (error || !member) {
        console.error(`❌ Member not found: ${githubUsername}`);
        return;
      }

      if (!member.discord_username) {
        console.error(`❌ No Discord username set for ${member.name}`);
        return;
      }

      // Call the sync function
      await syncSpecificUser(githubUsername);
      console.log(`✅ Successfully synced Discord role for ${member.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to sync role: ${(error as Error).message}`);
    }
  }

  /**
   * Bulk sync all members with Discord usernames
   */
  static async bulkSync(dryRun: boolean = false): Promise<void> {
    try {
      console.log(`🔄 ${dryRun ? 'Dry run: ' : ''}Starting bulk Discord role sync...`);
      
      // Get all members with Discord usernames
      const { data: members, error } = await supabase
        .from('members')
        .select('*')
        .not('discord_username', 'is', null)
        .neq('title', 'Null Basher');

      if (error || !members) {
        console.error('❌ Failed to fetch members');
        return;
      }

      console.log(`📊 Found ${members.length} members to sync`);
      
      if (dryRun) {
        console.log('📋 Members that would be synced:');
        members.forEach((member) => {
          console.log(`  - ${member.name} (@${member.github_username}) -> ${member.title}`);
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const member of members) {
        try {
          console.log(`🔄 Syncing ${member.name}...`);
          await syncSpecificUser(member.github_username);
          successCount++;
          console.log(`✅ Synced ${member.name}`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to sync ${member.name}: ${(error as Error).message}`);
        }
      }

      console.log(`\n📊 Bulk sync completed:`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Failed: ${errorCount}`);
      
    } catch (error) {
      console.error(`❌ Bulk sync failed: ${(error as Error).message}`);
    }
  }

  /**
   * Assign a role to a Discord user
   */
  static async assignRole(discordUsername: string, roleName: string): Promise<void> {
    try {
      if (!this.VALID_ROLES.includes(roleName)) {
        console.error(`❌ Invalid role: ${roleName}`);
        console.log(`Valid roles: ${this.VALID_ROLES.join(', ')}`);
        return;
      }

      console.log(`🔄 Assigning ${roleName} role to ${discordUsername}...`);
      
      // Get member by Discord username
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('discord_username', discordUsername)
        .single();

      if (error || !member) {
        console.error(`❌ Member not found with Discord username: ${discordUsername}`);
        return;
      }

      // Update member role in database
      const { error: updateError } = await supabase
        .from('members')
        .update({ title: roleName })
        .eq('id', member.id);

      if (updateError) {
        console.error(`❌ Failed to update member role in database: ${updateError.message}`);
        return;
      }

      // Sync Discord role
      await syncSpecificUser(member.github_username);
      console.log(`✅ Successfully assigned ${roleName} role to ${member.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to assign role: ${(error as Error).message}`);
    }
  }

  /**
   * Remove a role from a Discord user (set to Null Basher)
   */
  static async removeRole(discordUsername: string): Promise<void> {
    try {
      console.log(`🔄 Removing role from ${discordUsername}...`);
      
      // Get member by Discord username
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('discord_username', discordUsername)
        .single();

      if (error || !member) {
        console.error(`❌ Member not found with Discord username: ${discordUsername}`);
        return;
      }

      // Update member to Null Basher (suspended)
      const { error: updateError } = await supabase
        .from('members')
        .update({ title: 'Null Basher' })
        .eq('id', member.id);

      if (updateError) {
        console.error(`❌ Failed to update member role in database: ${updateError.message}`);
        return;
      }

      // Note: Null Bashers don't get Discord roles synced
      console.log(`✅ Successfully suspended ${member.name} (set to Null Basher)`);
      
    } catch (error) {
      console.error(`❌ Failed to remove role: ${(error as Error).message}`);
    }
  }

  /**
   * List community members with optional role filter
   */
  static async listMembers(roleFilter?: string): Promise<void> {
    try {
      console.log(`📋 Listing members${roleFilter ? ` with role: ${roleFilter}` : ''}...`);
      
      let query = supabase
        .from('members')
        .select(`
          *,
          clan:clans(clan_name)
        `)
        .order('bash_points', { ascending: false });

      if (roleFilter) {
        query = query.eq('title', roleFilter);
      }

      const { data: members, error } = await query;

      if (error || !members) {
        console.error('❌ Failed to fetch members');
        return;
      }

      console.log(`\n👥 Found ${members.length} members:\n`);
      
      members.forEach((member: any, index: number) => {
        const discordStatus = member.discord_username ? '🟢' : '🔴';
        const clanInfo = member.clan?.clan_name ? ` [${member.clan.clan_name}]` : '';
        
        console.log(
          `${(index + 1).toString().padStart(3, ' ')}. ${member.name.padEnd(25)} ` +
          `| ${member.title.padEnd(15)} | ${member.bash_points.toString().padStart(5)} pts ` +
          `| ${discordStatus} ${member.discord_username || 'No Discord'}${clanInfo}`
        );
      });

      // Summary by role
      const roleCounts = members.reduce((acc: any, member: any) => {
        acc[member.title] = (acc[member.title] || 0) + 1;
        return acc;
      }, {});

      console.log(`\n📊 Summary by role:`);
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`  ${role}: ${count}`);
      });
      
    } catch (error) {
      console.error(`❌ Failed to list members: ${(error as Error).message}`);
    }
  }

  /**
   * Display server statistics
   */
  static async serverStats(): Promise<void> {
    try {
      console.log(`📊 Discord Server Statistics\n`);
      
      // Get member counts by role
      const { data: members, error } = await supabase
        .from('members')
        .select('title, discord_username')
        .not('discord_username', 'is', null);

      if (error || !members) {
        console.error('❌ Failed to fetch member statistics');
        return;
      }

      // Calculate statistics
      const totalMembers = members.length;
      const roleCounts = members.reduce((acc: any, member: any) => {
        acc[member.title] = (acc[member.title] || 0) + 1;
        return acc;
      }, {});

      console.log(`Total Discord-linked members: ${totalMembers}`);
      console.log(`\nRole distribution:`);
      
      Object.entries(roleCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .forEach(([role, count]) => {
          const percentage = ((count as number) / totalMembers * 100).toFixed(1);
          console.log(`  ${role.padEnd(15)}: ${count} (${percentage}%)`);
        });

      // Get members without Discord
      const { data: allMembers } = await supabase
        .from('members')
        .select('id');
      
      const membersWithoutDiscord = (allMembers?.length || 0) - totalMembers;
      
      console.log(`\nMembers without Discord: ${membersWithoutDiscord}`);
      console.log(`Discord adoption rate: ${((totalMembers / (allMembers?.length || 1)) * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error(`❌ Failed to get server stats: ${(error as Error).message}`);
    }
  }

  /**
   * Display help information
   */
  static showHelp(): void {
    console.log(`
🤖 Discord Management CLI Tool

Usage:
  discord-cli.ts <command> [arguments] [options]

Commands:
  sync-role <github_username>           Sync Discord role for a specific member
  bulk-sync [--dry-run]                 Sync all members with Discord usernames
  assign-role <discord_username> <role>  Assign a role to a Discord user
  remove-role <discord_username>        Remove roles from a Discord user (suspend)
  list-members [--role <role_name>]     List community members
  server-stats                          Display Discord server statistics
  help                                  Show this help message

Valid Roles:
  ${this.VALID_ROLES.join(', ')}

Examples:
  ./discord-cli.ts sync-role johndoe
  ./discord-cli.ts bulk-sync --dry-run
  ./discord-cli.ts assign-role "johndoe#1234" "Captain Bash"
  ./discord-cli.ts list-members --role "Organiser"
  ./discord-cli.ts server-stats

Environment Variables Required:
  SUPABASE_URL                 - Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY   - Supabase service role key
  DISCORD_BOT_TOKEN           - Discord bot token
  DISCORD_GUILD_ID            - Discord server ID
`);
  }
}

// CLI argument parsing and execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    DiscordCLI.showHelp();
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'sync-role':
        if (args.length < 2) {
          console.error('❌ GitHub username required');
          console.log('Usage: discord-cli.ts sync-role <github_username>');
          return;
        }
        await DiscordCLI.syncRole(args[1]);
        break;

      case 'bulk-sync':
        const dryRun = args.includes('--dry-run');
        await DiscordCLI.bulkSync(dryRun);
        break;

      case 'assign-role':
        if (args.length < 3) {
          console.error('❌ Discord username and role required');
          console.log('Usage: discord-cli.ts assign-role <discord_username> <role_name>');
          return;
        }
        await DiscordCLI.assignRole(args[1], args[2]);
        break;

      case 'remove-role':
        if (args.length < 2) {
          console.error('❌ Discord username required');
          console.log('Usage: discord-cli.ts remove-role <discord_username>');
          return;
        }
        await DiscordCLI.removeRole(args[1]);
        break;

      case 'list-members':
        const roleIndex = args.indexOf('--role');
        const roleFilter = roleIndex !== -1 && args[roleIndex + 1] ? args[roleIndex + 1] : undefined;
        await DiscordCLI.listMembers(roleFilter);
        break;

      case 'server-stats':
        await DiscordCLI.serverStats();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        DiscordCLI.showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Command failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  });
}

export { DiscordCLI };
