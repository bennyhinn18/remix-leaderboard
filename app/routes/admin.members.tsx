import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  Crown,
  MessageSquare,
  ArrowLeft,
  MoreVertical,
  Mail,
  Phone,
  Github,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  UserCog,
  FileText,
  Activity,
  BarChart2,
  Award
} from 'lucide-react';
import { createServerSupabase } from '~/utils/supabase.server';
import { isOrganiser, getCurrentUser } from '~/utils/currentUser';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { MainNav } from '~/components/main-nav';
import { PageTransition } from '~/components/page-transition';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const organiserStatus = await isOrganiser(request);
    
    if (!organiserStatus) {
      throw new Response('Unauthorized', { status: 403 });
    }

    const response = new Response();
    const supabase = createServerSupabase(request, response);

    // Get current user with member data
    const currentUser = await getCurrentUser(request);
    
    // Get full user data from members table for MainNav
    let userData = null;
    if (currentUser?.member_id) {
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('id', currentUser.member_id)
        .single();
      
      userData = member;
    }
    
    // Provide fallback user data if not found
    if (!userData && currentUser) {
      userData = {
        id: currentUser.id,
        name: 'Unknown User',
        title: currentUser.title,
        basherNo: 'N/A',
        clanName: 'No Clan',
        basherLevel: 'Unknown'
      };
    }
    
    // Provide fallback user data if not found
    if (!userData && currentUser) {
      userData = {
        id: currentUser.id,
        name: 'Unknown User',
        title: currentUser.title,
        basherNo: 'N/A',
        clanName: 'No Clan',
        basherLevel: 'Unknown'
      };
    }

    // Fetch all members with clan information
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select(`
        *,
        clans!clan_id (
          id,
          clan_name
        )
      `)
      .order('joined_date', { ascending: false });
    
    if (membersError) {
      console.error('Members fetch error:', membersError);
    }

    // Fetch all clans for role assignment
    const { data: clans, error: clansError } = await supabase
      .from('clans')
      .select('*')
      .order('clan_name');

    if (clansError) {
      console.error('Clans fetch error:', clansError);
    }

    // Get Discord role sync status (mock for now - you'd implement actual Discord API calls)
    const discordSyncStatus = {
      lastSync: new Date().toISOString(),
      totalMembers: members?.length || 0,
      syncedMembers: members?.filter(m => m?.discord_username).length || 0,
      pendingSync: members?.filter(m => !m?.discord_username && m?.title !== 'Null Basher').length || 0
    };

    return json({
      members: members || [],
      clans: clans || [],
      user: userData,
      organiserStatus,
      discordSyncStatus
    });
  } catch (error) {
    console.error('Loader error:', error);
    return json({
      members: [],
      clans: [],
      user: null,
      organiserStatus: false,
      discordSyncStatus: {
        lastSync: new Date().toISOString(),
        totalMembers: 0,
        syncedMembers: 0,
        pendingSync: 0
      }
    }, { status: 500 });
  }
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
      case 'update_member': {
        const memberId = formData.get('memberId');
        const clanIdValue = formData.get('clan_id');
        const updates = {
          name: formData.get('name'),
          title: formData.get('title'),
          clan_id: clanIdValue && clanIdValue !== 'none' ? Number(clanIdValue) : null,
          discord_username: formData.get('discord_username'),
          personal_email: formData.get('personal_email'),
          mobile_number: formData.get('mobile_number'),
          bash_points: formData.get('bash_points') ? Number(formData.get('bash_points')) : 0,
        };

        const { error } = await supabase
          .from('members')
          .update(updates)
          .eq('id', memberId);

        if (error) throw error;

        // Trigger Discord role sync if needed
        if (updates.discord_username || updates.title) {
          // You would call your Discord role sync function here
          // await syncMemberDiscordRole(memberId);
        }

        return json({ success: true, message: 'Member updated successfully' });
      }

      case 'delete_member': {
        const memberId = formData.get('memberId');
        
        const { error } = await supabase
          .from('members')
          .delete()
          .eq('id', memberId);

        if (error) throw error;

        return json({ success: true, message: 'Member deleted successfully' });
      }

      case 'bulk_update_roles': {
        const memberIds = JSON.parse(formData.get('memberIds') as string);
        const newTitle = formData.get('newTitle');
        const newClanIdValue = formData.get('newClanId');
        const newClanId = newClanIdValue && newClanIdValue !== 'none' ? Number(newClanIdValue) : null;

        const updates: any = {};
        if (newTitle) updates.title = newTitle;
        if (newClanIdValue) updates.clan_id = newClanId;

        const { error } = await supabase
          .from('members')
          .update(updates)
          .in('id', memberIds);

        if (error) throw error;

        return json({ success: true, message: `Updated ${memberIds.length} members successfully` });
      }

      case 'sync_discord_roles': {
        const memberIds = JSON.parse(formData.get('memberIds') as string);
        
        // Here you would implement Discord role synchronization
        // For now, we'll just simulate it
        let successCount = 0;
        let errorCount = 0;

        for (const memberId of memberIds) {
          try {
            // Simulate Discord API call
            // await syncMemberDiscordRole(memberId);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }

        return json({ 
          success: true, 
          message: `Discord sync completed: ${successCount} successful, ${errorCount} failed`,
          syncResults: { successCount, errorCount }
        });
      }

      case 'export_members': {
        const { data: members } = await supabase
          .from('members')
          .select(`
            id, name, github_username, discord_username, title, bash_points,
            personal_email, mobile_number, joined_date,
            clan:clans(clan_name)
          `);

        return json({ 
          success: true, 
          data: members,
          message: 'Members data exported successfully'
        });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Member management error:', error);
    return json({ error: 'An error occurred' }, { status: 500 });
  }
};

const ROLE_OPTIONS = [
  { value: 'Basher', label: 'Basher', color: 'bg-blue-500' },
  { value: 'Captain Bash', label: 'Captain Bash', color: 'bg-purple-500' },
  { value: 'Organiser', label: 'Organiser', color: 'bg-green-500' },
  { value: 'Mentor', label: 'Mentor', color: 'bg-yellow-500' },
  { value: 'Legacy Basher', label: 'Legacy Basher', color: 'bg-amber-500' },
  { value: 'Rookie', label: 'Rookie', color: 'bg-gray-500' },
  { value: 'Null Basher', label: 'Null Basher', color: 'bg-red-500' },
];

interface Member {
  id: number;
  name: string;
  github_username: string;
  discord_username?: string;
  title: string;
  bash_points: number;
  personal_email?: string;
  mobile_number?: string;
  joined_date: string;
  clans?: { id: number; clan_name: string; };
  avatar_url?: string;
}

export default function MemberManagement() {
  const loaderData = useLoaderData<typeof loader>();
  const { members = [], clans = [], user, discordSyncStatus = {} } = loaderData || {};
  const fetcher = useFetcher();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [clanFilter, setClanFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  // Filter members based on search and filters
  const filteredMembers = (members || []).filter((member: Member) => {
    if (!member) return false;
    
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.github_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.discord_username?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesRole = roleFilter === 'all' || member.title === roleFilter;
    const matchesClan = clanFilter === 'all' || 
                       (clanFilter === 'none' && !member.clans) ||
                       member.clans?.id.toString() === clanFilter;

    return matchesSearch && matchesRole && matchesClan;
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

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowEditDialog(true);
  };

  const handleDeleteMember = (member: Member) => {
    setDeletingMember(member);
    setShowDeleteConfirm(true);
  };

  const handleBulkAction = (action: string) => {
    if (selectedMembers.length === 0) return;
    
    switch (action) {
      case 'update_roles':
        setShowBulkDialog(true);
        break;
      case 'sync_discord':
        const formData = new FormData();
        formData.append('action', 'sync_discord_roles');
        formData.append('memberIds', JSON.stringify(selectedMembers));
        fetcher.submit(formData, { method: 'post' });
        break;
      case 'export':
        handleExportMembers();
        break;
    }
  };

  const handleExportMembers = async () => {
    const formData = new FormData();
    formData.append('action', 'export_members');
    fetcher.submit(formData, { method: 'post' });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Organiser':
        return <Crown className="w-4 h-4" />;
      case 'Captain Bash':
        return <Shield className="w-4 h-4" />;
      case 'Mentor':
        return <UserCog className="w-4 h-4" />;
      case 'Legacy Basher':
        return <Crown className="w-4 h-4 text-amber-500" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getDiscordStatus = (member: Member) => {
    if (!member.discord_username) {
      return { status: 'not_linked', icon: XCircle, color: 'text-red-500' };
    }
    if (member.title === 'Null Basher') {
      return { status: 'suspended', icon: AlertTriangle, color: 'text-yellow-500' };
    }
    return { status: 'synced', icon: CheckCircle, color: 'text-green-500' };
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Member Management
              </h1>
              <p className="text-gray-400 mt-2">
                Manage community members, roles, and Discord integration
              </p>
            </div>
            <MainNav user={user as any} notifications={[]} unreadCount={0} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold">{members?.length || 0}</div>
                  <div className="text-sm text-gray-400">Total Members</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold">{discordSyncStatus?.syncedMembers || 0}</div>
                  <div className="text-sm text-gray-400">Discord Linked</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{discordSyncStatus?.pendingSync || 0}</div>
                  <div className="text-sm text-gray-400">Pending Sync</div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="text-2xl font-bold">
                    {(members || []).filter((m: Member) => m && ['Organiser', 'Captain Bash', 'Mentor'].includes(m.title)).length}
                  </div>
                  <div className="text-sm text-gray-400">Leadership</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Bar */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-gray-600"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/10 border-gray-600">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Roles</SelectItem>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={clanFilter} onValueChange={setClanFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/10 border-gray-600">
                    <SelectValue placeholder="Filter by clan" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Clans</SelectItem>
                    <SelectItem value="none">No Clan</SelectItem>
                    {clans.map((clan: any) => (
                      <SelectItem key={clan.id} value={clan.id.toString()}>
                        {clan.clan_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  asChild
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Link to="/admin/members/add">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Link>
                </Button>

                <Button 
                  asChild
                  variant="outline"
                  className="border-gray-600"
                >
                  <Link to="/admin/members/bulk-add">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Import
                  </Link>
                </Button>

                <Button 
                  asChild
                  variant="outline"
                  className="border-gray-600"
                >
                  <Link to="/admin/achievements">
                    <Award className="w-4 h-4 mr-2" />
                    Achievements
                  </Link>
                </Button>

                <Button 
                  asChild
                  variant="outline"
                  className="border-gray-600"
                >
                  <Link to="/admin/discord-roles">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Discord Roles
                  </Link>
                </Button>

                <Button 
                  asChild
                  variant="outline"
                  className="border-gray-600"
                >
                  <Link to="/admin/members/analytics">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Analytics
                  </Link>
                </Button>

                <Button
                  onClick={() => handleExportMembers()}
                  variant="outline"
                  className="border-gray-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedMembers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-blue-400">
                    {selectedMembers.length} member(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleBulkAction('update_roles')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Update Roles
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleBulkAction('sync_discord')}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Discord
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
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-4">Member</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Clan</th>
                    <th className="text-left p-4">Points</th>
                    <th className="text-left p-4">Discord</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Joined</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member: Member) => {
                    const discordStatus = getDiscordStatus(member);
                    const StatusIcon = discordStatus.icon;
                    
                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-700/50 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={() => handleSelectMember(member.id)}
                            className="rounded"
                          />
                        </td>
                        
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={member.avatar_url || `https://github.com/${member.github_username || 'unknown'}.png`}
                              alt={member.name || 'Unknown User'}
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = 'https://github.com/identicons/github.png';
                              }}
                            />
                            <div>
                              <div className="font-medium">{member.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-400 flex items-center gap-1">
                                <Github className="w-3 h-3" />
                                {member.github_username || 'unknown'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <Badge
                            className={`${ROLE_OPTIONS.find(r => r.value === member.title)?.color || 'bg-gray-500'} text-white`}
                          >
                            <span className="flex items-center gap-1">
                              {getRoleIcon(member.title)}
                              {member.title || 'Member'}
                            </span>
                          </Badge>
                        </td>

                        <td className="p-4">
                          <span className="text-sm">
                            {member.clans?.clan_name || (
                              <span className="text-gray-500">No clan</span>
                            )}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-mono text-blue-400">
                            {(member.bash_points || 0).toLocaleString()}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${discordStatus.color}`} />
                            {member.discord_username ? (
                              <span className="text-sm">{member.discord_username}</span>
                            ) : (
                              <span className="text-sm text-gray-500">Not linked</span>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">
                            {member.personal_email && (
                              <a
                                href={`mailto:${member.personal_email}`}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                            {member.mobile_number && (
                              <a
                                href={`tel:${member.mobile_number}`}
                                className="text-green-400 hover:text-green-300"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                            {member.github_username && (
                              <a
                                href={`https://github.com/${member.github_username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-300"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="text-sm text-gray-400">
                            {member.joined_date ? new Date(member.joined_date).toLocaleDateString() : 'Unknown'}
                          </span>
                        </td>

                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-600">
                              <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {member.github_username && (
                                <>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/profile/${member.github_username}`}>
                                      <FileText className="w-4 h-4 mr-2" />
                                      View Profile
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/profile/${member.github_username}/points-history`}>
                                      <Activity className="w-4 h-4 mr-2" />
                                      Points History
                                    </Link>
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMember(member)}
                                className="text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No members found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </Card>

          {/* Edit Member Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Member</DialogTitle>
              </DialogHeader>
              
              {editingMember && (
                <fetcher.Form method="post" className="space-y-4">
                  <input type="hidden" name="action" value="update_member" />
                  <input type="hidden" name="memberId" value={editingMember.id} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingMember.name}
                        className="bg-white/10 border-gray-600"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Role</Label>
                      <Select name="title" defaultValue={editingMember.title}>
                        <SelectTrigger className="bg-white/10 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {ROLE_OPTIONS.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="clan_id">Clan</Label>
                      <Select name="clan_id" defaultValue={editingMember.clans?.id?.toString() || 'none'}>
                        <SelectTrigger className="bg-white/10 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="none">No Clan</SelectItem>
                          {clans.map((clan: any) => (
                            <SelectItem key={clan.id} value={clan.id.toString()}>
                              {clan.clan_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bash_points">Bash Points</Label>
                      <Input
                        id="bash_points"
                        name="bash_points"
                        type="number"
                        defaultValue={editingMember.bash_points}
                        className="bg-white/10 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="discord_username">Discord Username</Label>
                      <Input
                        id="discord_username"
                        name="discord_username"
                        defaultValue={editingMember.discord_username || ''}
                        className="bg-white/10 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="personal_email">Email</Label>
                      <Input
                        id="personal_email"
                        name="personal_email"
                        type="email"
                        defaultValue={editingMember.personal_email || ''}
                        className="bg-white/10 border-gray-600"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="mobile_number">Mobile Number</Label>
                      <Input
                        id="mobile_number"
                        name="mobile_number"
                        defaultValue={editingMember.mobile_number || ''}
                        className="bg-white/10 border-gray-600"
                      />
                    </div>
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
                      Save Changes
                    </Button>
                  </DialogFooter>
                </fetcher.Form>
              )}
            </DialogContent>
          </Dialog>

          {/* Bulk Update Dialog */}
          <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Bulk Update Members</DialogTitle>
              </DialogHeader>
              
              <fetcher.Form method="post" className="space-y-4">
                <input type="hidden" name="action" value="bulk_update_roles" />
                <input type="hidden" name="memberIds" value={JSON.stringify(selectedMembers)} />
                
                <div>
                  <Label htmlFor="newTitle">New Role (optional)</Label>
                  <Select name="newTitle">
                    <SelectTrigger className="bg-white/10 border-gray-600">
                      <SelectValue placeholder="Select new role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="newClanId">New Clan (optional)</Label>
                  <Select name="newClanId">
                    <SelectTrigger className="bg-white/10 border-gray-600">
                      <SelectValue placeholder="Select new clan" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="none">No Clan</SelectItem>
                      {clans.map((clan: any) => (
                        <SelectItem key={clan.id} value={clan.id.toString()}>
                          {clan.clan_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBulkDialog(false)}
                    className="border-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowBulkDialog(false)}
                  >
                    Update {selectedMembers.length} Members
                  </Button>
                </DialogFooter>
              </fetcher.Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
              </DialogHeader>
              
              <p>
                Are you sure you want to delete <strong>{deletingMember?.name}</strong>? 
                This action cannot be undone.
              </p>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (deletingMember) {
                      const formData = new FormData();
                      formData.append('action', 'delete_member');
                      formData.append('memberId', deletingMember.id.toString());
                      fetcher.submit(formData, { method: 'post' });
                      setShowDeleteConfirm(false);
                      setDeletingMember(null);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
}
