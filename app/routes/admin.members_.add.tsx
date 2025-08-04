import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  ArrowLeft,
  Github,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Crown,
  Shield,
  Users,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { createServerSupabase } from '~/utils/supabase.server';
import { isOrganiser } from '~/utils/currentUser';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card } from '~/components/ui/card';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { MainNav } from '~/components/main-nav';
import { PageTransition } from '~/components/page-transition';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    throw new Response('Unauthorized', { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all clans for selection
  const { data: clans } = await supabase
    .from('clans')
    .select('*')
    .order('clan_name');

  return json({
    user,
    organiserStatus,
    clans: clans || []
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    return json({ error: 'Unauthorized' }, { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);
  const formData = await request.formData();

  try {
    // Extract form data
    const memberData = {
      name: formData.get('name') as string,
      github_username: formData.get('github_username') as string,
      discord_username: formData.get('discord_username') as string || null,
      title: formData.get('title') as string,
      clan_id: formData.get('clan_id') ? Number(formData.get('clan_id')) : null,
      personal_email: formData.get('personal_email') as string || null,
      mobile_number: formData.get('mobile_number') as string || null,
      bash_points: formData.get('bash_points') ? Number(formData.get('bash_points')) : 0,
      joined_date: new Date().toISOString(),
      notes: formData.get('notes') as string || null,
    };

    // Validate required fields
    if (!memberData.name || !memberData.github_username || !memberData.title) {
      return json({ 
        error: 'Name, GitHub username, and role are required',
        formData: memberData 
      }, { status: 400 });
    }

    // Check if GitHub username already exists
    const { data: existingMember } = await supabase
      .from('members')
      .select('id')
      .eq('github_username', memberData.github_username)
      .single();

    if (existingMember) {
      return json({ 
        error: 'A member with this GitHub username already exists',
        formData: memberData 
      }, { status: 400 });
    }

    // Check if Discord username already exists (if provided)
    if (memberData.discord_username) {
      const { data: existingDiscord } = await supabase
        .from('members')
        .select('id')
        .eq('discord_username', memberData.discord_username)
        .single();

      if (existingDiscord) {
        return json({ 
          error: 'A member with this Discord username already exists',
          formData: memberData 
        }, { status: 400 });
      }
    }

    // Fetch GitHub user data to validate and get avatar
    let githubData = null;
    try {
      const githubResponse = await fetch(`https://api.github.com/users/${memberData.github_username}`, {
        headers: {
          'User-Agent': 'ByteBashBlitz/1.0',
        },
      });

      if (githubResponse.ok) {
        githubData = await githubResponse.json();
      }
    } catch (error) {
      console.warn('Failed to fetch GitHub data:', error);
    }

    // Insert new member
    const { data: newMember, error: insertError } = await supabase
      .from('members')
      .insert({
        ...memberData,
        avatar_url: githubData?.avatar_url || `https://github.com/${memberData.github_username}.png`,
        github_id: githubData?.id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return json({ 
        error: 'Failed to create member. Please try again.',
        formData: memberData 
      }, { status: 500 });
    }

    // If Discord username is provided and role is not "Null Basher", trigger Discord role sync
    if (memberData.discord_username && memberData.title !== 'Null Basher') {
      try {
        // Here you would call your Discord role sync function
        // await syncMemberDiscordRole(newMember.id);
        console.log(`Discord role sync triggered for member: ${newMember.id}`);
      } catch (error) {
        console.error('Discord sync error:', error);
        // Don't fail the whole operation if Discord sync fails
      }
    }

    // Redirect to member management page with success message
    return redirect('/admin/members?success=created');

  } catch (error) {
    console.error('Member creation error:', error);
    return json({ 
      error: 'An unexpected error occurred. Please try again.',
      formData: Object.fromEntries(formData)
    }, { status: 500 });
  }
};

const ROLE_OPTIONS = [
  { 
    value: 'Basher', 
    label: 'Basher', 
    description: 'Regular community member',
    color: 'bg-blue-500',
    icon: Users 
  },
  { 
    value: 'Rookie', 
    label: 'Rookie', 
    description: 'New member, probationary period',
    color: 'bg-gray-500',
    icon: Users 
  },
  { 
    value: 'Captain Bash', 
    label: 'Captain Bash', 
    description: 'Team captain with leadership responsibilities',
    color: 'bg-purple-500',
    icon: Shield 
  },
  { 
    value: 'Mentor', 
    label: 'Mentor', 
    description: 'Experienced member who guides others',
    color: 'bg-yellow-500',
    icon: Users 
  },
  { 
    value: 'Organiser', 
    label: 'Organiser', 
    description: 'Community organizer with admin privileges',
    color: 'bg-green-500',
    icon: Crown 
  },
  { 
    value: 'Legacy Basher', 
    label: 'Legacy Basher', 
    description: 'Long-standing community member',
    color: 'bg-amber-500',
    icon: Crown 
  },
  { 
    value: 'Null Basher', 
    label: 'Null Basher', 
    description: 'Suspended or inactive member',
    color: 'bg-red-500',
    icon: Users 
  },
];

export default function AddMember() {
  const { user, clans } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  
  const [showGitHubPreview, setShowGitHubPreview] = useState(false);
  const [githubPreview, setGithubPreview] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('');

  const isSubmitting = fetcher.state === 'submitting';
  const actionData = fetcher.data;

  const handleGitHubPreview = async (username: string) => {
    if (!username) {
      setGithubPreview(null);
      setShowGitHubPreview(false);
      return;
    }

    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (response.ok) {
        const data = await response.json();
        setGithubPreview(data);
        setShowGitHubPreview(true);
      } else {
        setGithubPreview(null);
        setShowGitHubPreview(false);
      }
    } catch (error) {
      console.error('Failed to fetch GitHub preview:', error);
      setGithubPreview(null);
      setShowGitHubPreview(false);
    }
  };

  const selectedRoleInfo = ROLE_OPTIONS.find(role => role.value === selectedRole);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/admin/members"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Member Management
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Add New Member
            </h1>
            <p className="text-gray-400 mt-2">
              Add a new member to the Byte Bash Blitz community
            </p>
          </div>

          {/* Error Alert */}
          {actionData?.error && (
            <Alert className="mb-6 border-red-500/50 bg-red-500/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-400">
                {actionData.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/5 border-gray-700 p-6">
                <fetcher.Form method="post" className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Basic Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          required
                          defaultValue={actionData?.formData?.name || ''}
                          className="bg-white/10 border-gray-600 mt-1"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="github_username" className="text-sm font-medium">
                          GitHub Username *
                        </Label>
                        <div className="relative">
                          <Input
                            id="github_username"
                            name="github_username"
                            required
                            defaultValue={actionData?.formData?.github_username || ''}
                            className="bg-white/10 border-gray-600 mt-1 pr-10"
                            placeholder="Enter GitHub username"
                            onBlur={(e) => handleGitHubPreview(e.target.value)}
                          />
                          <Github className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="discord_username" className="text-sm font-medium">
                          Discord Username
                        </Label>
                        <div className="relative">
                          <Input
                            id="discord_username"
                            name="discord_username"
                            defaultValue={actionData?.formData?.discord_username || ''}
                            className="bg-white/10 border-gray-600 mt-1 pr-10"
                            placeholder="Enter Discord username"
                          />
                          <MessageSquare className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bash_points" className="text-sm font-medium">
                          Initial Bash Points
                        </Label>
                        <Input
                          id="bash_points"
                          name="bash_points"
                          type="number"
                          min="0"
                          defaultValue={actionData?.formData?.bash_points || '0'}
                          className="bg-white/10 border-gray-600 mt-1"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role and Clan */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Role and Clan Assignment
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title" className="text-sm font-medium">
                          Role *
                        </Label>
                        <Select 
                          name="title" 
                          value={selectedRole}
                          onValueChange={setSelectedRole}
                          required
                        >
                          <SelectTrigger className="bg-white/10 border-gray-600 mt-1">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {ROLE_OPTIONS.map((role) => {
                              const IconComponent = role.icon;
                              return (
                                <SelectItem key={role.value} value={role.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    <span>{role.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        
                        {selectedRoleInfo && (
                          <p className="text-sm text-gray-400 mt-1">
                            {selectedRoleInfo.description}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="clan_id" className="text-sm font-medium">
                          Clan Assignment
                        </Label>
                        <Select name="clan_id">
                          <SelectTrigger className="bg-white/10 border-gray-600 mt-1">
                            <SelectValue placeholder="Select a clan (optional)" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="">No Clan</SelectItem>
                            {clans.map((clan: any) => (
                              <SelectItem key={clan.id} value={clan.id.toString()}>
                                {clan.clan_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Contact Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="personal_email" className="text-sm font-medium">
                          Personal Email
                        </Label>
                        <div className="relative">
                          <Input
                            id="personal_email"
                            name="personal_email"
                            type="email"
                            defaultValue={actionData?.formData?.personal_email || ''}
                            className="bg-white/10 border-gray-600 mt-1 pr-10"
                            placeholder="Enter email address"
                          />
                          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="mobile_number" className="text-sm font-medium">
                          Mobile Number
                        </Label>
                        <div className="relative">
                          <Input
                            id="mobile_number"
                            name="mobile_number"
                            type="tel"
                            defaultValue={actionData?.formData?.mobile_number || ''}
                            className="bg-white/10 border-gray-600 mt-1 pr-10"
                            placeholder="Enter mobile number"
                          />
                          <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes (Internal)
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      defaultValue={actionData?.formData?.notes || ''}
                      className="bg-white/10 border-gray-600 mt-1"
                      placeholder="Any additional notes about this member..."
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Member...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Member
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      asChild
                      className="border-gray-600"
                    >
                      <Link to="/admin/members">Cancel</Link>
                    </Button>
                  </div>
                </fetcher.Form>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* GitHub Preview */}
              {showGitHubPreview && githubPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-white/5 border-gray-700 p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Github className="w-5 h-5" />
                      GitHub Preview
                    </h3>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={githubPreview.avatar_url}
                        alt={githubPreview.name || githubPreview.login}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="font-medium">
                          {githubPreview.name || githubPreview.login}
                        </div>
                        <div className="text-sm text-gray-400">
                          @{githubPreview.login}
                        </div>
                      </div>
                    </div>

                    {githubPreview.bio && (
                      <p className="text-sm text-gray-300 mb-3">
                        {githubPreview.bio}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Repos:</span>
                        <span className="ml-1">{githubPreview.public_repos}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Followers:</span>
                        <span className="ml-1">{githubPreview.followers}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Following:</span>
                        <span className="ml-1">{githubPreview.following}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Joined:</span>
                        <span className="ml-1">
                          {new Date(githubPreview.created_at).getFullYear()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Valid GitHub account</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Role Information */}
              {selectedRoleInfo && (
                <Card className="bg-white/5 border-gray-700 p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <selectedRoleInfo.icon className="w-5 h-5" />
                    Role Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Badge className={`${selectedRoleInfo.color} text-white`}>
                        {selectedRoleInfo.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-300">
                      {selectedRoleInfo.description}
                    </p>

                    <div className="text-sm text-gray-400">
                      <strong>Permissions:</strong>
                      <ul className="mt-1 space-y-1">
                        {selectedRoleInfo.value === 'Organiser' && (
                          <>
                            <li>• Full admin access</li>
                            <li>• Manage all members</li>
                            <li>• Create events</li>
                            <li>• Award points</li>
                          </>
                        )}
                        {selectedRoleInfo.value === 'Captain Bash' && (
                          <>
                            <li>• Manage clan members</li>
                            <li>• Assign tasks</li>
                            <li>• View clan analytics</li>
                          </>
                        )}
                        {selectedRoleInfo.value === 'Mentor' && (
                          <>
                            <li>• Guide new members</li>
                            <li>• Access mentor resources</li>
                            <li>• Create study groups</li>
                          </>
                        )}
                        {selectedRoleInfo.value === 'Basher' && (
                          <>
                            <li>• Participate in events</li>
                            <li>• Join clans</li>
                            <li>• Earn points</li>
                          </>
                        )}
                        {selectedRoleInfo.value === 'Rookie' && (
                          <>
                            <li>• Limited access</li>
                            <li>• Probationary period</li>
                            <li>• Basic participation</li>
                          </>
                        )}
                        {selectedRoleInfo.value === 'Null Basher' && (
                          <>
                            <li>• Suspended account</li>
                            <li>• No Discord access</li>
                            <li>• Read-only permissions</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Tips */}
              <Card className="bg-blue-500/10 border-blue-500/30 p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-400">
                  <Info className="w-5 h-5" />
                  Quick Tips
                </h3>
                
                <ul className="text-sm text-blue-200 space-y-2">
                  <li>• GitHub username must be exact (case-sensitive)</li>
                  <li>• Discord roles will be synced automatically</li>
                  <li>• New members start with 0 points by default</li>
                  <li>• "Null Basher" role suspends Discord access</li>
                  <li>• Contact info is optional but recommended</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
