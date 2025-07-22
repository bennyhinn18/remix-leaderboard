import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { createServerSupabase } from '~/utils/supabase.server';
import { syncSpecificUser } from '../../scripts/discord-role-sync';

interface VerificationRequest {
  discordId: string;
  discordUsername: string;
  discordDiscriminator?: string;
}

// Direct Discord role assignment using the sync function
async function triggerRoleAssignment(discordUsername: string): Promise<boolean> {
  try {
    console.log(`🚀 Starting role assignment for ${discordUsername}`);
    
    // Call the sync function directly
    await syncSpecificUser(discordUsername);
    
    console.log(`✅ Discord role assigned successfully for ${discordUsername}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Discord role assignment failed for ${discordUsername}:`, error);
    return false;
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);

  try {
    // Get current authenticated user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json(
        { 
          success: false, 
          error: 'Not authenticated. Please login with GitHub first.' 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { discordId, discordUsername, discordDiscriminator }: VerificationRequest = body;

    if (!discordId || !discordUsername) {
      return json(
        { 
          success: false, 
          error: 'Discord ID and username are required' 
        },
        { status: 400 }
      );
    }

    // Get GitHub username from authenticated user
    const githubUsername = user.user_metadata?.user_name || 
                          user.identities?.find((i: any) => i.provider === 'github')?.identity_data?.user_name;

    if (!githubUsername) {
      return json(
        { 
          success: false, 
          error: 'GitHub username not found in session' 
        },
        { status: 400 }
      );
    }

    // Check if user exists in members table
    const { data: existingMember, error: memberError } = await supabase
      .from('members')
      .select('id, discord_username, title')
      .eq('github_username', githubUsername)
      .single();

    if (memberError && memberError.code !== 'PGRST116') {
      console.error('Error checking existing member:', memberError);
      return json(
        { 
          success: false, 
          error: 'Database error occurred' 
        },
        { status: 500 }
      );
    }

    // Check if Discord username is already taken by another user
    if (existingMember?.discord_username && existingMember.discord_username !== discordUsername) {
      const { data: conflictMember } = await supabase
        .from('members')
        .select('github_username')
        .eq('discord_username', discordUsername)
        .neq('github_username', githubUsername)
        .single();

      if (conflictMember) {
        return json(
          { 
            success: false, 
            error: 'This Discord username is already linked to another GitHub account' 
          },
          { status: 409 }
        );
      }
    }

    let member;
    
    if (existingMember) {
      // Update existing member with Discord info
      const { data: updatedMember, error: updateError } = await supabase
        .from('members')
        .update({ 
          discord_username: discordUsername,
          // Only update title to Basher if they don't already have a role
          ...(existingMember.title === null && { title: 'Basher' })
        })
        .eq('id', existingMember.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating member:', updateError);
        return json(
          { 
            success: false, 
            error: 'Failed to update member record' 
          },
          { status: 500 }
        );
      }

      member = updatedMember;
    } else {
      // Create new member record
      const { data: newMember, error: createError } = await supabase
        .from('members')
        .insert({
          github_username: githubUsername,
          discord_username: discordUsername,
          name: user.user_metadata?.full_name || githubUsername,
          title: 'Basher',
          bash_points: 0,
          clan_id: 1, // Default clan - you might want to make this configurable
          joined_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating member:', createError);
        return json(
          { 
            success: false, 
            error: 'Failed to create member record' 
          },
          { status: 500 }
        );
      }

      member = newMember;
    }

    // Trigger Discord role assignment using the working manual sync script
    let roleAssigned = false;
    let roleAssignmentError = '';
    
    try {
      // Add a small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 1000));
      roleAssigned = await triggerRoleAssignment(discordUsername);
    } catch (error) {
      console.error('Discord role assignment error:', error);
      roleAssignmentError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    if (!roleAssigned) {
      console.error(`Discord role assignment failed for ${discordUsername}: ${roleAssignmentError}`);
      // Return error if role assignment fails - this is critical for verification
      return json(
        { 
          success: false, 
          error: 'Discord account linked but role assignment failed. Please try again or contact an admin.',
          member: {
            id: member.id,
            github_username: member.github_username,
            discord_username: member.discord_username,
            title: member.title,
            bash_points: member.bash_points,
            clan_id: member.clan_id,
          },
        },
        { status: 500 }
      );
    }

    // Return success only if both database update and role assignment succeeded
    return json({
      success: true,
      message: 'Discord account linked and basher role assigned successfully! Welcome to the terminal!',
      roleAssigned: true,
      member: {
        id: member.id,
        github_username: member.github_username,
        discord_username: member.discord_username,
        title: member.title,
        bash_points: member.bash_points,
        clan_id: member.clan_id,
      },
    });

  } catch (error) {
    console.error('Discord verification error:', error);
    return json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
};

export const loader = async () => {
  return json({ error: 'Method not allowed' }, { status: 405 });
};
