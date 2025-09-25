import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  BarChart2,
  PieChart,
  Activity,
  Crown,
  Shield,
  UserCog,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { createServerSupabase } from '~/utils/supabase.server';
import { isOrganiser } from '~/utils/currentUser';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { MainNav } from '~/components/main-nav';
import { PageTransition } from '~/components/page-transition';
// import type { BasherProfile } from '~/utils/types';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    throw new Response('Unauthorized', { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);

  // Get current user
  const { data: { user } } = await supabase.client.auth.getUser();

  // Fetch all members with clan information
  const { data: members, error: membersError } = await supabase.client
    .from('members')
    .select(`
      *,
      clan:clans(*)
    `)
    .order('created_at', { ascending: false });

  // Fetch all clans
  const { data: clans } = await supabase.client
    .from('clans')
    .select('*')
    .order('clan_name');

  // Fetch recent points activities (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentPointsActivities } = await supabase.client
    .from('points_history')
    .select(`
      *,
      member:members(name, github_username)
    `)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  // Calculate analytics
  const analytics = calculateAnalytics(members || [], clans || [], recentPointsActivities || []);

  return json({
    members: members || [],
    clans: clans || [],
    user,
    analytics,
    organiserStatus
  });
};

function calculateAnalytics(members: any[], clans: any[], recentPointsActivities: any[]) {
  // Basic overview stats
  const totalMembers = members.length;
  const discordLinked = members.filter(m => m.discord_username).length;
  const discordAdoption = totalMembers > 0 ? (discordLinked / totalMembers) * 100 : 0;

  // Role distribution
  const roleDistribution = members.reduce((acc, member) => {
    acc[member.title] = (acc[member.title] || 0) + 1;
    return acc;
  }, {});

  // Clan distribution
  const clanDistribution = members.reduce((acc, member) => {
    const clanName = member.clan?.clan_name || 'No Clan';
    acc[clanName] = (acc[clanName] || 0) + 1;
    return acc;
  }, {});

  // Points distribution
  const pointsDistribution = {
    '0-99': members.filter(m => m.bash_points < 100).length,
    '100-499': members.filter(m => m.bash_points >= 100 && m.bash_points < 500).length,
    '500-999': members.filter(m => m.bash_points >= 500 && m.bash_points < 1000).length,
    '1000-2999': members.filter(m => m.bash_points >= 1000 && m.bash_points < 3000).length,
    '3000+': members.filter(m => m.bash_points >= 3000).length,
  };

  // Member growth over time (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const memberGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const joinedThisMonth = members.filter(m => {
      const joinedDate = new Date(m.joined_date || m.created_at);
      return joinedDate >= monthStart && joinedDate <= monthEnd;
    }).length;

    memberGrowth.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      newMembers: joinedThisMonth,
      totalMembers: members.filter(m => {
        const joinedDate = new Date(m.joined_date || m.created_at);
        return joinedDate <= monthEnd;
      }).length
    });
  }

  // Top performers
  const topPerformers = [...members]
    .sort((a, b) => b.bash_points - a.bash_points)
    .slice(0, 10);

  // Most active members (by recent points) - with null check
  const memberPointsThisWeek = (recentPointsActivities || []).reduce((acc: any, activity: any) => {
    acc[activity.member_id] = (acc[activity.member_id] || 0) + activity.points_added;
    return acc;
  }, {});

  const mostActiveThisWeek = Object.entries(memberPointsThisWeek)
    .map(([memberId, points]) => ({
      member: members.find(m => m.id.toString() === memberId),
      points
    }))
    .filter(item => item.member)
    .sort((a, b) => (b.points as number) - (a.points as number))
    .slice(0, 5);

  return {
    overview: {
      totalMembers: members.length,
      discordLinked,
      discordAdoption: Math.round(discordAdoption),
      totalPoints: members.reduce((sum, m) => sum + m.bash_points, 0),
      averagePoints: members.length > 0 ? Math.round(members.reduce((sum, m) => sum + m.bash_points, 0) / members.length) : 0
    },
    roleDistribution,
    clanDistribution,
    pointsDistribution,
    memberGrowth,
    topPerformers,
    mostActiveThisWeek,
    recentActivities: (recentPointsActivities || []).slice(0, 20)
  };
}

export default function MemberAnalytics() {
  const { members, clans, user, analytics } = useLoaderData<typeof loader>();
  const [selectedView, setSelectedView] = useState<'overview' | 'roles' | 'clans' | 'activity'>('overview');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const chartData = {
    roles: Object.entries(analytics.roleDistribution).map(([role, count]) => ({
      name: role,
      value: count,
      color: getRoleColor(role)
    })),
    clans: Object.entries(analytics.clanDistribution).map(([clan, count]) => ({
      name: clan,
      value: count
    })),
    points: Object.entries(analytics.pointsDistribution).map(([range, count]) => ({
      name: range,
      value: count
    }))
  };

  const exportAnalytics = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      overview: analytics.overview,
      distributions: {
        roles: analytics.roleDistribution,
        clans: analytics.clanDistribution,
        points: analytics.pointsDistribution
      },
      topPerformers: analytics.topPerformers.map((m: any) => ({
        name: m.name,
        role: m.title,
        points: m.bash_points,
        github: m.github_username
      })),
      memberGrowth: analytics.memberGrowth
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `member-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                Back to Members
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Member Analytics
              </h1>
              <p className="text-gray-400 mt-2">
                Comprehensive insights into your community membership
              </p>
            </div>
            <MainNav user={user as any} notifications={[]} unreadCount={0} />
          </div>

          {/* Action Bar */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className="border-gray-600"
              >
                {showSensitiveData ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Sensitive
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Sensitive
                  </>
                )}
              </Button>
              <span className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleString()}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={exportAnalytics}
                variant="outline"
                className="border-gray-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-gray-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-white/5 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.totalMembers}</div>
                    <div className="text-sm text-gray-400">Total Members</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.discordLinked}</div>
                    <div className="text-sm text-gray-400">Discord Linked</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <PieChart className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.discordAdoption}%</div>
                    <div className="text-sm text-gray-400">Discord Adoption</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.totalPoints.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Total Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-8 h-8 text-cyan-400" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.averagePoints}</div>
                    <div className="text-sm text-gray-400">Avg Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics Tabs */}
          <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
            <TabsList className="bg-white/10 border-gray-600">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/20">
                Overview
              </TabsTrigger>
              <TabsTrigger value="roles" className="data-[state=active]:bg-purple-500/20">
                Roles
              </TabsTrigger>
              <TabsTrigger value="clans" className="data-[state=active]:bg-green-500/20">
                Clans
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-orange-500/20">
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member Growth Chart */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Member Growth (6 Months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.memberGrowth.map((month: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{month.month}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-green-400">+{month.newMembers}</span>
                            <span className="text-gray-400">{month.totalMembers} total</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Points Distribution */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-blue-400" />
                      Points Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.pointsDistribution).map(([range, count]: [string, any]) => (
                        <div key={range} className="flex justify-between items-center">
                          <span className="text-sm">{range} points</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(count / analytics.overview.totalMembers) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-400">{String(count)} members</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card className="bg-white/5 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Members with highest bash points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topPerformers.slice(0, 5).map((member: any, index: number) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-sm">
                            #{index + 1}
                          </div>
                          <img
                            src={member.avatar_url || `https://github.com/${member.github_username}.png`}
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-400">{member.title}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-blue-400 font-bold">
                            {member.bash_points.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-400">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Distribution */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-400" />
                      Role Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.roleDistribution).map(([role, count]: [string, any]) => (
                        <div key={role} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge className={`${getRoleColor(role)} text-white`}>
                              {role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getRoleColor(role)}`}
                                style={{
                                  width: `${(count / analytics.overview.totalMembers) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-400">{String(count)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Role Insights */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-cyan-400" />
                      Role Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                        <div className="text-green-400 font-medium">Leadership Ratio</div>
                        <div className="text-sm text-gray-400">
                          {Math.round(
                            (Object.entries(analytics.roleDistribution)
                              .filter(([role]) => ['Organiser', 'Captain Bash', 'Mentor'].includes(role))
                              .reduce((sum, [_, count]) => sum + (count as number), 0) /
                              analytics.overview.totalMembers) * 100
                          )}% of members are in leadership roles
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="text-blue-400 font-medium">Most Common Role</div>
                        <div className="text-sm text-gray-400">
                          {Object.entries(analytics.roleDistribution)
                            .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
                        </div>
                      </div>

                      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <div className="text-purple-400 font-medium">Role Diversity</div>
                        <div className="text-sm text-gray-400">
                          {Object.keys(analytics.roleDistribution).length} different roles
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clans" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clan Distribution */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-400" />
                      Clan Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.clanDistribution)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 10)
                        .map(([clan, count]: [string, any]) => (
                          <div key={clan} className="flex justify-between items-center">
                            <span className="text-sm">{clan}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{
                                    width: `${(count / analytics.overview.totalMembers) * 100}%`
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-400">{String(count)}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Clan Insights */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-orange-400" />
                      Clan Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                        <div className="text-green-400 font-medium">Largest Clan</div>
                        <div className="text-sm text-gray-400">
                          {Object.entries(analytics.clanDistribution)
                            .filter(([clan]) => clan !== 'No Clan')
                            .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                        <div className="text-yellow-400 font-medium">Clan Participation</div>
                        <div className="text-sm text-gray-400">
                          {Math.round(
                            ((analytics.overview.totalMembers - (analytics.clanDistribution['No Clan'] || 0)) /
                              analytics.overview.totalMembers) * 100
                          )}% of members are in clans
                        </div>
                      </div>

                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="text-blue-400 font-medium">Total Clans</div>
                        <div className="text-sm text-gray-400">
                          {Object.keys(analytics.clanDistribution).filter(clan => clan !== 'No Clan').length} active clans
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Active This Week */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-400" />
                      Most Active This Week
                    </CardTitle>
                    <CardDescription>Members who earned the most points recently</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.mostActiveThisWeek.length > 0 ? (
                        analytics.mostActiveThisWeek.map((item: any, index: number) => (
                          <div key={item.member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold text-sm">
                                #{index + 1}
                              </div>
                              <img
                                src={item.member.avatar_url || `https://github.com/${item.member.github_username}.png`}
                                alt={item.member.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <div className="font-medium">{item.member.name}</div>
                                <div className="text-sm text-gray-400">{item.member.title}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-orange-400 font-bold">
                                +{String(item.points)}
                              </div>
                              <div className="text-sm text-gray-400">this week</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          No recent activity data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      Recent Activities
                    </CardTitle>
                    <CardDescription>Latest points transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {analytics.recentActivities.length > 0 ? (
                        analytics.recentActivities.map((activity: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full" />
                              <span>{activity.member?.name || 'Unknown Member'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={activity.points_added > 0 ? 'text-green-400' : 'text-red-400'}>
                                {activity.points_added > 0 ? '+' : ''}{activity.points_added}
                              </span>
                              <span className="text-gray-400 text-xs">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          No recent activities
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}

function getRoleColor(role: string): string {
  const colors: { [key: string]: string } = {
    'Basher': 'bg-blue-500',
    'Captain Bash': 'bg-purple-500',
    'Organiser': 'bg-green-500',
    'Mentor': 'bg-yellow-500',
    'Legacy Basher': 'bg-amber-500',
    'Rookie': 'bg-gray-500',
    'Null Basher': 'bg-red-500',
  };
  return colors[role] || 'bg-gray-500';
}
