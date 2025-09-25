// import type { ActionFunctionArgs } from '@remix-run/node';
// import { json } from '@remix-run/node';
// import { createServerSupabase } from '~/utils/supabase.server';
// import { syncSpecificUser } from '../../scripts/discord-role-sync';
// import { Client, GatewayIntentBits } from 'discord.js';

// interface VerificationRequest {
//   discordId: string;
//   discordUsername: string;
//   discordDiscriminator?: string;
// }

// // Initialize Discord client for verification
// const discord = new Client({
//   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
// });

// // Real Discord username verification - check if user exists in server
// async function verifyDiscordUser(discordUsername: string): Promise<{
//   exists: boolean;
//   member?: any;
//   currentRoles?: string[];
//   hasBasherRole?: boolean;
//   hasRookieRole?: boolean;
//   error?: string;
// }> {
//   try {
//     const GUILD_ID = process.env.DISCORD_GUILD_ID;
//     const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;

//     if (!GUILD_ID || !DISCORD_TOKEN) {
//       return { 
//         exists: false, 
//         error: 'Discord configuration missing' 
//       };
//     }

//     // Ensure Discord bot is connected
//     if (!discord.isReady()) {
//       await discord.login(DISCORD_TOKEN);
      
//       // Wait for bot to be ready
//       await new Promise((resolve) => {
//         if (discord.isReady()) {
//           resolve(true);
//         } else {
//           discord.once('ready', () => resolve(true));
//         }
//       });
//     }

//     const guild = await discord.guilds.fetch(GUILD_ID);
    
//     // Find member by username (case insensitive, check username, globalName, and displayName)
//     const members = await guild.members.fetch();
//     const cleanUsername = discordUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
    
//     const member = members.find((m: any) => 
//       m.user.username.toLowerCase() === cleanUsername ||
//       m.user.globalName?.toLowerCase() === cleanUsername ||
//       m.displayName.toLowerCase() === cleanUsername ||
//       m.user.username.toLowerCase() === discordUsername.toLowerCase() ||
//       m.user.globalName?.toLowerCase() === discordUsername.toLowerCase() ||
//       m.displayName.toLowerCase() === discordUsername.toLowerCase()
//     );

//     if (!member) {
//       return { 
//         exists: false, 
//         error: 'Discord user not found in server. Please ensure you have joined the Discord server.' 
//       };
//     }

//     // Get current roles
//     const currentRoles = member.roles.cache.map((role: any) => role.name);
//     const hasBasherRole = currentRoles.includes('basher');
//     const hasRookieRole = currentRoles.includes('rookie') || currentRoles.includes('visitor');

//     console.log(`✅ Discord user verified: ${member.user.tag}`);
//     console.log(`📋 Current roles: ${currentRoles.join(', ')}`);

//     return {
//       exists: true,
//       member,
//       currentRoles,
//       hasBasherRole,
//       hasRookieRole
//     };

//   } catch (error) {
//     console.error('Discord verification error:', error);
//     return { 
//       exists: false, 
//       error: error instanceof Error ? error.message : 'Discord verification failed' 
//     };
//   }
// }

// // Enhanced role assignment that handles Rookie -> Basher transition
// async function triggerRoleAssignment(discordUsername: string, memberData: any): Promise<{
//   success: boolean;
//   message: string;
//   rolesChanged?: string[];
// }> {
//   try {
//     console.log(`🚀 Starting enhanced role assignment for ${discordUsername}`);
    
//     // First verify the Discord user exists and get their current roles
//     const verification = await verifyDiscordUser(discordUsername);
    
//     if (!verification.exists) {
//       return {
//         success: false,
//         message: verification.error || 'Discord user verification failed'
//       };
//     }

//     // Check eligibility for Basher role
//     const isEligibleForBasher = memberData.title && 
//       ['Basher', 'Captain Bash', 'Organiser', 'Mentor', 'Legacy Basher', 'Rookie'].includes(memberData.title) &&
//       memberData.title !== 'Null Basher';

//     if (!isEligibleForBasher) {
//       return {
//         success: false,
//         message: `User with title '${memberData.title}' is not eligible for Basher role`
//       };
//     }

//     // If user already has Basher role and no Rookie role, they're good
//     if (verification.hasBasherRole && !verification.hasRookieRole) {
//       console.log(`✅ User ${discordUsername} already has correct roles`);
//       return {
//         success: true,
//         message: 'User already has appropriate Discord roles',
//         rolesChanged: []
//       };
//     }

//     // Use the sync function to assign roles properly (handles Rookie -> Basher transition)
//     await syncSpecificUser(discordUsername);
    
//     // Verify the role assignment worked
//     const postVerification = await verifyDiscordUser(discordUsername);
    
//     if (postVerification.exists && postVerification.hasBasherRole) {
//       const rolesChanged = [];
      
//       if (verification.hasRookieRole && !postVerification.hasRookieRole) {
//         rolesChanged.push('Removed Rookie/Visitor role');
//       }
      
//       if (!verification.hasBasherRole && postVerification.hasBasherRole) {
//         rolesChanged.push('Added Basher role');
//       }

//       console.log(`✅ Discord role assignment successful for ${discordUsername}`);
//       return {
//         success: true,
//         message: 'Discord roles updated successfully! Welcome to the terminal!',
//         rolesChanged
//       };
//     } else {
//       return {
//         success: false,
//         message: 'Role assignment completed but verification failed. Please contact an admin.'
//       };
//     }
    
//   } catch (error) {
//     console.error(`❌ Enhanced role assignment failed for ${discordUsername}:`, error);
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : 'Role assignment failed'
//     };
//   }
// }

// export const action = async ({ request }: ActionFunctionArgs) => {
//   if (request.method !== 'POST') {
//     return json({ error: 'Method not allowed' }, { status: 405 });
//   }

//   const response = new Response();
//   const supabase = createServerSupabase(request, response);

//   try {
//     // Get current authenticated user from session
//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser();

//     if (authError || !user) {
//       return json(
//         { 
//           success: false, 
//           error: 'Not authenticated. Please login with GitHub first.' 
//         },
//         { status: 401 }
//       );
//     }

//     // Parse request body
//     const body = await request.json();
//     const { discordId, discordUsername, discordDiscriminator }: VerificationRequest = body;

//     if (!discordId || !discordUsername) {
//       return json(
//         { 
//           success: false, 
//           error: 'Discord ID and username are required' 
//         },
//         { status: 400 }
//       );
//     }

//     // Get GitHub username from authenticated user
//     const githubUsername = user.user_metadata?.user_name || 
//                           user.identities?.find((i: any) => i.provider === 'github')?.identity_data?.user_name;

//     if (!githubUsername) {
//       return json(
//         { 
//           success: false, 
//           error: 'GitHub username not found in session' 
//         },
//         { status: 400 }
//       );
//     }

//     // Check if user exists in members table
//     const { data: existingMember, error: memberError } = await supabase
//       .from('members')
//       .select('id, discord_username, title')
//       .eq('github_username', githubUsername)
//       .single();

//     if (memberError && memberError.code !== 'PGRST116') {
//       console.error('Error checking existing member:', memberError);
//       return json(
//         { 
//           success: false, 
//           error: 'Database error occurred' 
//         },
//         { status: 500 }
//       );
//     }

//     // Check if Discord username is already taken by another user
//     if (existingMember?.discord_username && existingMember.discord_username !== discordUsername) {
//       const { data: conflictMember } = await supabase
//         .from('members')
//         .select('github_username')
//         .eq('discord_username', discordUsername)
//         .neq('github_username', githubUsername)
//         .single();

//       if (conflictMember) {
//         return json(
//           { 
//             success: false, 
//             error: 'This Discord username is already linked to another GitHub account' 
//           },
//           { status: 409 }
//         );
//       }
//     }

//     let member;
    
//     if (existingMember) {
//       // Update existing member with Discord info
//       const { data: updatedMember, error: updateError } = await supabase
//         .from('members')
//         .update({ 
//           discord_username: discordUsername,
//           // Only update title to Basher if they don't already have a role
//           ...(existingMember.title === null && { title: 'Basher' })
//         })
//         .eq('id', existingMember.id)
//         .select()
//         .single();

//       if (updateError) {
//         console.error('Error updating member:', updateError);
//         return json(
//           { 
//             success: false, 
//             error: 'Failed to update member record' 
//           },
//           { status: 500 }
//         );
//       }

//       member = updatedMember;
//     } else {
//       // Create new member record
//       const { data: newMember, error: createError } = await supabase
//         .from('members')
//         .insert({
//           github_username: githubUsername,
//           discord_username: discordUsername,
//           name: user.user_metadata?.full_name || githubUsername,
//           title: 'Basher',
//           bash_points: 0,
//           clan_id: 1, // Default clan - you might want to make this configurable
//           joined_date: new Date().toISOString().split('T')[0],
//         })
//         .select()
//         .single();

//       if (createError) {
//         console.error('Error creating member:', createError);
//         return json(
//           { 
//             success: false, 
//             error: 'Failed to create member record' 
//           },
//           { status: 500 }
//         );
//       }

//       member = newMember;
//     }

//     // Enhanced Discord role assignment with real verification
//     let roleAssignmentResult: { success: boolean; message: string; rolesChanged?: string[] } = { 
//       success: false, 
//       message: '', 
//       rolesChanged: [] 
//     };
    
//     try {
//       // Add a small delay to ensure database transaction is committed
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // First verify Discord user exists in server
//       const discordVerification = await verifyDiscordUser(discordUsername);
      
//       if (!discordVerification.exists) {
//         return json(
//           { 
//             success: false, 
//             error: discordVerification.error || 'Discord username not found in server. Please join the Discord server first.',
//             member: {
//               id: member.id,
//               github_username: member.github_username,
//               discord_username: member.discord_username,
//               title: member.title,
//               bash_points: member.bash_points,
//               clan_id: member.clan_id,
//             },
//           },
//           { status: 400 }
//         );
//       }

//       // Perform enhanced role assignment
//       roleAssignmentResult = await triggerRoleAssignment(discordUsername, member);
      
//     } catch (error) {
//       console.error('Discord role assignment error:', error);
//       roleAssignmentResult = {
//         success: false,
//         message: error instanceof Error ? error.message : 'Unknown error',
//         rolesChanged: []
//       };
//     }
    
//     if (!roleAssignmentResult.success) {
//       console.error(`Discord role assignment failed for ${discordUsername}: ${roleAssignmentResult.message}`);
//       // Return error if role assignment fails - this is critical for verification
//       return json(
//         { 
//           success: false, 
//           error: `Discord verification failed: ${roleAssignmentResult.message}`,
//           member: {
//             id: member.id,
//             github_username: member.github_username,
//             discord_username: member.discord_username,
//             title: member.title,
//             bash_points: member.bash_points,
//             clan_id: member.clan_id,
//           },
//         },
//         { status: 500 }
//       );
//     }

//     // Return success with detailed role information
//     return json({
//       success: true,
//       message: roleAssignmentResult.message,
//       roleAssigned: true,
//       rolesChanged: roleAssignmentResult.rolesChanged,
//       discordVerification: {
//         userExists: true,
//         currentRoles: (await verifyDiscordUser(discordUsername)).currentRoles || []
//       },
//       member: {
//         id: member.id,
//         github_username: member.github_username,
//         discord_username: member.discord_username,
//         title: member.title,
//         bash_points: member.bash_points,
//         clan_id: member.clan_id,
//       },
//     });

//   } catch (error) {
//     console.error('Discord verification error:', error);
//     return json(
//       { 
//         success: false, 
//         error: 'Internal server error' 
//       },
//       { status: 500 }
//     );
//   }
// };

// export const loader = async () => {
//   return json({ error: 'Method not allowed' }, { status: 405 });
// };
