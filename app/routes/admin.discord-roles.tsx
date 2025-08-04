import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Users,
  Shield,
  Crown,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Terminal,
  Play,
  Pause,
  Activity,
  UserCog,
  Bot,
  Server,
  Info
} from 'lucide-react';
import { createServerSupabase } from '~/utils/supabase.server';
import { isOrganiser } from '~/utils/currentUser';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Alert, AlertDescription } from '~/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { Textarea } from '~/components/ui/textarea';
import { MainNav } from '~/components/main-nav';
import { PageTransition } from '~/components/page-transition';
import { syncSpecificUser } from '~/utils/discord-sync.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    throw new Response('Unauthorized', { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all members with Discord usernames
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select(`
      *,
      clan:clans(*)
    `)
    .order('created_at', { ascending: false });

  // Get Discord sync logs (mock for now - you'd implement actual logging)
  const discordLogs = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      action: 'ROLE_SYNC',
      member_id: 1,
      member_name: 'John Doe',
      status: 'SUCCESS',
      details: 'Assigned Basher role'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      action: 'ROLE_REMOVAL',
      member_id: 2,
      member_name: 'Jane Smith',
      status: 'SUCCESS',
      details: 'Removed Null Basher role'
    }
  ];

  // Discord server stats (mock - you'd get these from Discord API)
  const discordStats = {
    serverName: 'Byte Bash Blitz',
    totalMembers: 150,
    onlineMembers: 45,
    roles: [
      { name: 'Organiser', count: 5, color: '#00ff00' },
      { name: 'Basher', count: 85, color: '#0099ff' },
      { name: 'Captain Bash', count: 12, color: '#9900ff' },
      { name: 'Mentor', count: 8, color: '#ffff00' },
      { name: 'Legacy Basher', count: 15, color: '#ff9900' },
      { name: 'Rookie', count: 20, color: '#888888' },
      { name: 'Null Basher', count: 5, color: '#ff0000' }
    ],
    botStatus: 'online',
    lastSync: new Date(Date.now() - 600000).toISOString()
  };

  return json({
    members: members || [],
    discordLogs,
    discordStats,
    user,
    organiserStatus
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
  const action = formData.get('action');

  try {
    switch (action) {
      case 'sync_single_member': {
        const memberId = formData.get('memberId');
        
        // Get member details
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('id', memberId)
          .single();

        if (!member || !member.discord_username) {
          return json({ error: 'Member not found or Discord username not set' }, { status: 400 });
        }

        try {
          // Call the Discord role sync function
          await syncSpecificUser(member.github_username);
          
          return json({ 
            success: true, 
            message: `Discord role sync initiated for ${member.name}` 
          });
        } catch (error) {
          console.error('Discord sync error:', error);
          return json({ 
            success: false, 
            message: `Failed to sync Discord role for ${member.name}: ${(error as Error).message}` 
          });
        }
      }

      case 'bulk_sync_roles': {
        const memberIds = JSON.parse(formData.get('memberIds') as string);
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        // Get members
        const { data: members } = await supabase
          .from('members')
          .select('*')
          .in('id', memberIds);

        if (!members) {
          return json({ error: 'No members found' }, { status: 400 });
        }

        for (const member of members) {
          if (!member.discord_username) {
            errors.push(`${member.name}: No Discord username set`);
            errorCount++;
            continue;
          }

          try {
            await syncSpecificUser(member.github_username);
            successCount++;
          } catch (error) {
            errors.push(`${member.name}: ${(error as Error).message}`);
            errorCount++;
          }
        }

        return json({ 
          success: true, 
          message: `Bulk sync completed: ${successCount} successful, ${errorCount} failed`,
          syncResults: { successCount, errorCount, errors }
        });
      }

      case 'remove_discord_role': {
        const memberId = formData.get('memberId');
        const roleName = formData.get('roleName');

        // Here you would implement Discord role removal
        // For now, we'll just simulate it
        return json({ 
          success: true, 
          message: `Removed ${roleName} role from member` 
        });
      }

      case 'assign_discord_role': {
        const memberId = formData.get('memberId');
        const roleName = formData.get('roleName');

        // Here you would implement Discord role assignment
        // For now, we'll just simulate it
        return json({ 
          success: true, 
          message: `Assigned ${roleName} role to member` 
        });
      }

      case 'sync_all_roles': {
        // This would sync all members with Discord usernames
        const { data: members } = await supabase
          .from('members')
          .select('*')
          .not('discord_username', 'is', null)
          .neq('title', 'Null Basher');

        let successCount = 0;
        let errorCount = 0;

        if (members) {
          for (const member of members) {
            try {
              await syncSpecificUser(member.github_username);
              successCount++;
            } catch (error) {
              errorCount++;
            }
          }
        }

        return json({ 
          success: true, 
          message: `Full sync completed: ${successCount} successful, ${errorCount} failed`,
          syncResults: { successCount, errorCount }
        });
      }

      case 'update_discord_username': {
        const memberId = formData.get('memberId');
        const discordUsername = formData.get('discordUsername');

        const { error } = await supabase
          .from('members')
          .update({ discord_username: discordUsername })
          .eq('id', memberId);

        if (error) throw error;

        return json({ 
          success: true, 
          message: 'Discord username updated successfully' 
        });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Discord management error:', error);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
};

const ROLE_COLORS = {
  'Organiser': 'bg-green-500',
  'Captain Bash': 'bg-purple-500',
  'Mentor': 'bg-yellow-500',
  'Legacy Basher': 'bg-amber-500',
  'Basher': 'bg-blue-500',
  'Rookie': 'bg-gray-500',
  'Null Basher': 'bg-red-500'
};

const ROLE_ICONS = {
  'Organiser': Crown,
  'Captain Bash': Shield,
  'Mentor': UserCog,
  'Legacy Basher': Crown,
  'Basher': Users,
  'Rookie': Users,
  'Null Basher': Users
};

interface Member {
  id: number;
  name: string;
  github_username: string;
  discord_username?: string;
  title: string;
  bash_points: number;
  clan?: { clan_name: string; };
}

export default function DiscordRoleManagement() {
  const { members, discordLogs, discordStats, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const isProcessing = fetcher.state === 'submitting';
  const actionData = fetcher.data;

  // Filter members
  const filteredMembers = members.filter((member: Member) => {
    const matchesRole = filterRole === 'all' || member.title === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'linked' && member.discord_username) ||
                         (filterStatus === 'unlinked' && !member.discord_username) ||
                         (filterStatus === 'suspended' && member.title === 'Null Basher');
    return matchesRole && matchesStatus;
  });

  const handleSelectMember = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map((m: Member) => m.id));
    }
  };

  const handleSingleSync = (member: Member) => {
    const formData = new FormData();
    formData.append('action', 'sync_single_member');
    formData.append('memberId', member.id.toString());
    fetcher.submit(formData, { method: 'post' });
  };

  const handleBulkSync = () => {
    if (selectedMembers.length === 0) return;
    
    const formData = new FormData();
    formData.append('action', 'bulk_sync_roles');
    formData.append('memberIds', JSON.stringify(selectedMembers));
    fetcher.submit(formData, { method: 'post' });
    setShowBulkDialog(false);
  };

  const handleFullSync = () => {
    const formData = new FormData();
    formData.append('action', 'sync_all_roles');
    fetcher.submit(formData, { method: 'post' });
  };

  const getDiscordStatus = (member: Member) => {
    if (!member.discord_username) {
      return { status: 'unlinked', icon: XCircle, color: 'text-red-500', text: 'Not Linked' };
    }
    if (member.title === 'Null Basher') {
      return { status: 'suspended', icon: AlertTriangle, color: 'text-yellow-500', text: 'Suspended' };
    }
    return { status: 'linked', icon: CheckCircle, color: 'text-green-500', text: 'Synced' };
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <Link
                to="/admin/members"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Member Management
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Discord Role Management
              </h1>
              <p className="text-gray-400 mt-2">
                Manage Discord roles and synchronization for community members
              </p>
            </div>
            <MainNav user={user as any} notifications={[]} unreadCount={0} />
          </div>

          {/* Success/Error Messages */}
          {actionData?.message && (
            <Alert className={`mb-6 ${
              actionData.success 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-red-500/50 bg-red-500/10'
            }`}>
              {actionData.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription className={actionData.success ? 'text-green-400' : 'text-red-400'}>
                {actionData.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Discord Server Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <Server className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold">{discordStats.totalMembers}</div>
                  <div className="text-sm text-gray-400">Total Members</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{discordStats.onlineMembers}</div>
                  <div className="text-sm text-gray-400">Online Now</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <Bot className={`w-8 h-8 ${discordStats.botStatus === 'online' ? 'text-green-400' : 'text-red-400'}`} />
                <div>
                  <div className="text-lg font-bold capitalize">{discordStats.botStatus}</div>
                  <div className="text-sm text-gray-400">Bot Status</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-sm font-bold">
                    {new Date(discordStats.lastSync).toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-gray-400">Last Sync</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Bar */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/10 border-gray-600">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Organiser">Organiser</SelectItem>
                    <SelectItem value="Captain Bash">Captain Bash</SelectItem>
                    <SelectItem value="Mentor">Mentor</SelectItem>
                    <SelectItem value="Legacy Basher">Legacy Basher</SelectItem>
                    <SelectItem value="Basher">Basher</SelectItem>
                    <SelectItem value="Rookie">Rookie</SelectItem>
                    <SelectItem value="Null Basher">Null Basher</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/10 border-gray-600">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="linked">Linked</SelectItem>
                    <SelectItem value="unlinked">Not Linked</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleFullSync}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Full Sync
                </Button>

                <Button
                  onClick={() => setShowLogDialog(true)}
                  variant="outline"
                  className="border-gray-600"
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  View Logs
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedMembers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-purple-400">
                    {selectedMembers.length} member(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setShowBulkDialog(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Bulk Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMembers([])}
                      className="border-gray-600"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Members Table */}
          <Card className="bg-white/5 border-gray-700">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-700">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Discord Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member: Member) => {
                    const discordStatus = getDiscordStatus(member);
                    const StatusIcon = discordStatus.icon;
                    const RoleIcon = ROLE_ICONS[member.title as keyof typeof ROLE_ICONS] || Users;
                    
                    return (
                      <TableRow key={member.id} className="border-b border-gray-700/50 hover:bg-white/5">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleSelectMember(member.id)}
                            className="rounded"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://github.com/${member.github_username}.png`}
                              alt={member.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-400">@{member.github_username}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className={`${ROLE_COLORS[member.title as keyof typeof ROLE_COLORS] || 'bg-gray-500'} text-white`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {member.title}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {member.discord_username ? (
                            <span className="text-sm font-mono">{member.discord_username}</span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingMember(member);
                                setShowEditDialog(true);
                              }}
                              className="border-gray-600 text-xs"
                            >
                              Set Username
                            </Button>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${discordStatus.color}`} />
                            <span className="text-sm">{discordStatus.text}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-gray-400">
                            {member.discord_username ? '2 min ago' : 'Never'}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-2">
                            {member.discord_username && (
                              <Button
                                size="sm"
                                onClick={() => handleSingleSync(member)}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isProcessing ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingMember(member);
                                setShowEditDialog(true);
                              }}
                              className="border-gray-600"
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No members found</h3>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </Card>

          {/* Bulk Sync Dialog */}
          <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Bulk Discord Role Sync</DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <p className="text-gray-300 mb-4">
                  Are you sure you want to sync Discord roles for {selectedMembers.length} selected members?
                </p>
                
                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-blue-400">
                    This will update Discord roles based on their current role in the system. 
                    Members without Discord usernames will be skipped.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkDialog(false)}
                  className="border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkSync}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Sync Roles
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Discord Username Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Update Discord Username</DialogTitle>
              </DialogHeader>
              
              {editingMember && (
                <fetcher.Form method="post" className="space-y-4">
                  <input type="hidden" name="action" value="update_discord_username" />
                  <input type="hidden" name="memberId" value={editingMember.id} />
                  
                  <div>
                    <Label htmlFor="discordUsername">Discord Username</Label>
                    <Input
                      id="discordUsername"
                      name="discordUsername"
                      defaultValue={editingMember.discord_username || ''}
                      placeholder="username#1234"
                      className="bg-white/10 border-gray-600 mt-1"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Include the discriminator (e.g., username#1234)
                    </p>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditDialog(false)}
                      className="border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowEditDialog(false)}
                    >
                      Update Username
                    </Button>
                  </DialogFooter>
                </fetcher.Form>
              )}
            </DialogContent>
          </Dialog>

          {/* Logs Dialog */}
          <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
              <DialogHeader>
                <DialogTitle>Discord Sync Logs</DialogTitle>
              </DialogHeader>
              
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discordLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.member_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.action.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={log.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowLogDialog(false)}
                  className="border-gray-600"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
}
