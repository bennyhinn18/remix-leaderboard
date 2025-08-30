import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams, Form, Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Filter, 
  Download, 
  RefreshCw,
  ArrowLeft,
  CalendarDays,
  School,
  Trophy,
  Target,
  PieChart,
  Activity,
  Clock,
  MapPin,
  Award,
  Zap,
  Hash,
  X
} from 'lucide-react';

import { AttendanceService, type AttendanceFilters, type Member } from '~/services/attendance.server';
import { createServerSupabase } from '~/utils/supabase.server';
import { isOrganiser } from '~/utils/currentUser';
import { MainNav } from '~/components/main-nav';
import { PageTransition } from '~/components/page-transition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  MonthlyTrendChart,
  AttendanceRateChart,
  ClanPerformanceChart,
  MemberEngagementChart,
  EventTypesDistribution,
  WeeklyTrendChart,
  AttendanceHeatmap
} from '~/components/attendance-charts';

export async function loader({ request }: LoaderFunctionArgs) {
  const organiserStatus = await isOrganiser(request);
  
  if (!organiserStatus) {
    throw new Response('Unauthorized', { status: 403 });
  }

  const response = new Response();
  const supabase = createServerSupabase(request, response);

  // Create attendance service instance
  const attendanceService = new AttendanceService(supabase);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Parse search parameters for filtering
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  const filters: AttendanceFilters = {
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    eventIds: searchParams.getAll('eventIds').filter(Boolean),
    memberIds: searchParams.getAll('memberIds').map(id => parseInt(id)).filter(id => !isNaN(id)),
    clanIds: searchParams.getAll('clanIds').map(id => parseInt(id)).filter(id => !isNaN(id)),
    eventTypes: searchParams.getAll('eventTypes').filter(Boolean),
    eventStatuses: searchParams.getAll('eventStatuses').filter(Boolean),
    memberTitles: searchParams.getAll('memberTitles').filter(Boolean),
  };

  try {
    const [
      attendanceStats,
      events,
      members,
      clans,
      eventTypes,
      memberTitles,
      attendanceRecords
    ] = await Promise.all([
      attendanceService.getAttendanceStats(filters),
      attendanceService.getEvents(),
      attendanceService.getMembers(),
      attendanceService.getClans(),
      attendanceService.getEventTypes(),
      attendanceService.getMemberTitles(),
      attendanceService.getAttendanceRecords(filters)
    ]);

    return json({
      user,
      attendanceStats,
      events,
      members,
      clans,
      eventTypes,
      memberTitles,
      attendanceRecords,
      filters
    });
  } catch (error) {
    console.error('Error loading attendance data:', error);
    throw new Response('Failed to load attendance data', { status: 500 });
  }
}

export default function AttendanceDashboard() {
  const { 
    user, 
    attendanceStats, 
    events, 
    members, 
    clans, 
    eventTypes, 
    memberTitles,
    attendanceRecords,
    filters 
  } = useLoaderData<typeof loader>();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedView, setSelectedView] = useState<'overview' | 'events' | 'members' | 'clans' | 'trends'>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Update search params when filters change
  const updateFilters = (newFilters: Partial<AttendanceFilters>) => {
    const params = new URLSearchParams(searchParams);
    
    // Clear existing filter params
    ['startDate', 'endDate', 'eventIds', 'memberIds', 'clanIds', 'eventTypes', 'eventStatuses', 'memberTitles'].forEach(key => {
      params.delete(key);
    });

    // Add new filter params
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.set(key, value.toString());
        }
      }
    });

    setSearchParams(params);
  };

  const exportData = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const response = await fetch(`/admin/attendance/export?${searchParams.toString()}&format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-data-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'ongoing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'upcoming': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTitleColor = (title: string) => {
    switch (title) {
      case 'Organiser': return 'bg-red-500/20 text-red-400';
      case 'Captain Bash': return 'bg-purple-500/20 text-purple-400';
      case 'Mentor': return 'bg-blue-500/20 text-blue-400';
      case 'Legacy Basher': return 'bg-yellow-500/20 text-yellow-400';
      case 'Basher': return 'bg-green-500/20 text-green-400';
      case 'Rookie': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
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
                Attendance Analytics Dashboard
              </h1>
              <p className="text-gray-400 mt-2">
                Comprehensive insights into event attendance and member participation
              </p>
            </div>
            <MainNav user={user as any} notifications={[]} unreadCount={0} />
          </div>

          {/* Action Bar */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="border-gray-600"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
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
            <div className="flex items-center gap-2">
              <Button
                onClick={() => exportData('csv')}
                disabled={isExporting}
                variant="outline"
                className="border-gray-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => exportData('json')}
                disabled={isExporting}
                variant="outline"
                className="border-gray-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="bg-white/5 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Advanced Filters
                </CardTitle>
                <CardDescription>
                  Filter attendance data by date range, events, members, clans, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="get" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        type="date"
                        id="startDate"
                        name="startDate"
                        defaultValue={filters.startDate}
                        className="bg-white/10 border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        type="date"
                        id="endDate"
                        name="endDate"
                        defaultValue={filters.endDate}
                        className="bg-white/10 border-gray-600"
                      />
                    </div>

                    {/* Event Type Filter */}
                    <div className="space-y-2">
                      <Label>Event Types</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {eventTypes.map(type => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`eventType-${type}`}
                              name="eventTypes"
                              value={type}
                              defaultChecked={filters.eventTypes?.includes(type)}
                            />
                            <Label htmlFor={`eventType-${type}`} className="text-sm">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Event Status Filter */}
                    <div className="space-y-2">
                      <Label>Event Status</Label>
                      <div className="space-y-2">
                        {['upcoming', 'ongoing', 'completed', 'cancelled'].map(status => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`eventStatus-${status}`}
                              name="eventStatuses"
                              value={status}
                              defaultChecked={filters.eventStatuses?.includes(status)}
                            />
                            <Label htmlFor={`eventStatus-${status}`} className="text-sm capitalize">
                              {status}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Member Title Filter */}
                    <div className="space-y-2">
                      <Label>Member Titles</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {memberTitles.map(title => (
                          <div key={title} className="flex items-center space-x-2">
                            <Checkbox
                              id={`memberTitle-${title}`}
                              name="memberTitles"
                              value={title}
                              defaultChecked={filters.memberTitles?.includes(title)}
                            />
                            <Label htmlFor={`memberTitle-${title}`} className="text-sm">
                              {title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clan Filter */}
                    <div className="space-y-2">
                      <Label>Clans</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {clans.map(clan => (
                          <div key={clan.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`clan-${clan.id}`}
                              name="clanIds"
                              value={clan.id.toString()}
                              defaultChecked={filters.clanIds?.includes(clan.id)}
                            />
                            <Label htmlFor={`clan-${clan.id}`} className="text-sm">
                              {clan.clan_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setSearchParams('')}>
                      Clear All
                    </Button>
                    <Button type="submit">
                      Apply Filters
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="bg-white/5 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold">{attendanceStats.totalEvents}</div>
                    <div className="text-sm text-gray-400">Total Events</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold">{attendanceStats.totalAttendances}</div>
                    <div className="text-sm text-gray-400">Total Attendances</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold">{attendanceStats.uniqueAttendees}</div>
                    <div className="text-sm text-gray-400">Unique Attendees</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold">{Math.round(attendanceStats.averageAttendance)}</div>
                    <div className="text-sm text-gray-400">Avg per Event</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-cyan-400" />
                  <div>
                    <div className="text-2xl font-bold">{Math.round(attendanceStats.attendanceRate)}%</div>
                    <div className="text-sm text-gray-400">Attendance Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics Tabs */}
          <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
            <TabsList className="bg-white/10 border-gray-600 mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/20">
                Overview
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-green-500/20">
                Events Analysis
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-purple-500/20">
                Members Analysis
              </TabsTrigger>
              <TabsTrigger value="clans" className="data-[state=active]:bg-yellow-500/20">
                Clans Analysis
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-cyan-500/20">
                Trends & Patterns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Monthly Trends Chart */}
                <MonthlyTrendChart data={attendanceStats.monthlyTrends} />
                
                {/* Event Types Distribution */}
                <EventTypesDistribution data={attendanceStats.eventStats} />
                
                {/* Attendance Heatmap */}
                <AttendanceHeatmap data={attendanceStats.eventStats} />

                {/* Recent Attendance Records */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-400" />
                      Recent Attendance Records
                    </CardTitle>
                    <CardDescription>Latest attendance entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {attendanceRecords.slice(0, 15).map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={record.member?.avatar_url || `https://github.com/${record.member?.github_username}.png`}
                              alt={record.member?.name || 'Member'}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="font-medium">{record.member?.name || record.member_name}</div>
                              <div className="text-sm text-gray-400">{record.event?.title}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {new Date(record.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(record.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-green-400" />
                      Quick Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="text-blue-400 font-medium">Most Active Event</div>
                        <div className="text-sm text-gray-400">
                          {attendanceStats.eventStats[0]?.event.title || 'No events yet'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {attendanceStats.eventStats[0]?.attendanceCount || 0} attendees
                        </div>
                      </div>
                      
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                        <div className="text-green-400 font-medium">Top Attender</div>
                        <div className="text-sm text-gray-400">
                          {attendanceStats.topAttenders[0]?.member.name || 'No data'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {attendanceStats.topAttenders[0]?.attendanceCount || 0} events attended
                        </div>
                      </div>
                      
                      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <div className="text-purple-400 font-medium">Best Performing Clan</div>
                        <div className="text-sm text-gray-400">
                          {attendanceStats.clanStats[0]?.clanName || 'No data'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {Math.round(attendanceStats.clanStats[0]?.attendanceRate || 0)}% attendance rate
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Event Performance Chart */}
                <AttendanceRateChart data={attendanceStats.eventStats} />

                {/* Event Performance Table */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-green-400" />
                      Event Performance Analysis
                    </CardTitle>
                    <CardDescription>
                      Detailed breakdown of attendance for each event
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-2">Event</th>
                            <th className="text-left py-3 px-2">Date</th>
                            <th className="text-left py-3 px-2">Type</th>
                            <th className="text-left py-3 px-2">Status</th>
                            <th className="text-left py-3 px-2">Venue</th>
                            <th className="text-right py-3 px-2">Attendees</th>
                            <th className="text-right py-3 px-2">Rate</th>
                            <th className="text-right py-3 px-2">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceStats.eventStats.map((eventStat) => (
                            <tr key={eventStat.event.id} className="border-b border-gray-800 hover:bg-white/5">
                              <td className="py-3 px-2">
                                <div>
                                  <div className="font-medium">{eventStat.event.title}</div>
                                  {eventStat.event.description && (
                                    <div className="text-xs text-gray-400 truncate max-w-xs">
                                      {eventStat.event.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <div>
                                  <div>{new Date(eventStat.event.date).toLocaleDateString()}</div>
                                  <div className="text-xs text-gray-400">{eventStat.event.time}</div>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <Badge variant="outline" className="text-xs">
                                  {eventStat.event.type}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getEventStatusColor(eventStat.event.status)}`}
                                >
                                  {eventStat.event.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  {eventStat.event.venue}
                                </div>
                              </td>
                              <td className="text-right py-3 px-2 font-mono">
                                {eventStat.attendanceCount}
                              </td>
                              <td className="text-right py-3 px-2">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-green-500 h-2 rounded-full"
                                      style={{
                                        width: `${Math.min(eventStat.attendanceRate, 100)}%`
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm w-12">
                                    {Math.round(eventStat.attendanceRate)}%
                                  </span>
                                </div>
                              </td>
                              <td className="text-right py-3 px-2">
                                <div className="flex items-center justify-end gap-1">
                                  <Award className="w-3 h-3 text-yellow-400" />
                                  <span className="font-mono text-yellow-400">
                                    {eventStat.event.point_value}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Member Engagement Chart */}
                <MemberEngagementChart data={attendanceStats.memberStats} />

                {/* All Members Table */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      All Members Performance
                    </CardTitle>
                    <CardDescription>
                      Complete member list with attendance statistics - click on a member to view detailed analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-2">Member</th>
                            <th className="text-left py-3 px-2">Contact</th>
                            <th className="text-left py-3 px-2">Clan</th>
                            <th className="text-right py-3 px-2">Events</th>
                            <th className="text-right py-3 px-2">Rate</th>
                            <th className="text-right py-3 px-2">Points</th>
                            <th className="text-right py-3 px-2">Streak</th>
                            <th className="text-center py-3 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceStats.memberStats.map((memberStat) => (
                            <tr key={memberStat.member.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
                                    {memberStat.member.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium">{memberStat.member.name}</div>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getTitleColor(memberStat.member.title)}`}
                                    >
                                      {memberStat.member.title}
                                    </Badge>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-400">{memberStat.member.email}</div>
                                  {memberStat.member.discord_username ? (
                                    <div className="flex items-center gap-1">
                                      <Hash className="w-3 h-3 text-blue-400" />
                                      <span className="text-blue-400 text-xs">
                                        {memberStat.member.discord_username}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 text-xs">No Discord</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                {memberStat.member.clan_name ? (
                                  <Badge variant="outline" className="text-xs">
                                    {memberStat.member.clan_name}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-500 text-xs">No clan</span>
                                )}
                              </td>
                              <td className="text-right py-3 px-2 font-mono">
                                {memberStat.attendanceCount}
                              </td>
                              <td className="text-right py-3 px-2">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{
                                        width: `${Math.min(memberStat.attendanceRate, 100)}%`
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm w-12">
                                    {Math.round(memberStat.attendanceRate)}%
                                  </span>
                                </div>
                              </td>
                              <td className="text-right py-3 px-2">
                                <div className="flex items-center justify-end gap-1">
                                  <Award className="w-3 h-3 text-yellow-400" />
                                  <span className="font-mono text-yellow-400">
                                    {memberStat.totalPoints}
                                  </span>
                                </div>
                              </td>
                              <td className="text-right py-3 px-2">
                                <div className="flex items-center justify-end gap-1">
                                  <Zap className="w-3 h-3 text-orange-400" />
                                  <span className="font-mono text-orange-400">
                                    {memberStat.streak}
                                  </span>
                                </div>
                              </td>
                              <td className="text-center py-3 px-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMember(memberStat.member);
                                    setShowMemberModal(true);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Attenders */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Top Attendees
                    </CardTitle>
                    <CardDescription>
                      Members with highest attendance rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attendanceStats.topAttenders.slice(0, 20).map((attender, index) => (
                        <div 
                          key={attender.member.id} 
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                          onClick={() => {
                            setSelectedMember(attender.member);
                            setShowMemberModal(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-sm">
                              #{index + 1}
                            </div>
                            <img
                              src={attender.member.avatar_url || `https://github.com/${attender.member.github_username}.png`}
                              alt={attender.member.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="font-medium">{attender.member.name}</div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getTitleColor(attender.member.title)}`}
                                >
                                  {attender.member.title}
                                </Badge>
                                <span className="text-xs text-gray-400">{attender.member.clan_name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-green-400 font-bold">
                              {attender.attendanceCount}
                            </div>
                            <div className="text-xs text-gray-400">
                              {Math.round(attender.attendanceRate)}% rate
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clans" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Clan Performance Chart */}
                <ClanPerformanceChart data={attendanceStats.clanStats} />

                {/* Clan Performance */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="w-5 h-5 text-purple-400" />
                      Clan Attendance Performance
                    </CardTitle>
                    <CardDescription>
                      Attendance statistics by clan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {attendanceStats.clanStats.map((clanStat) => (
                        <div key={clanStat.clanId} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{clanStat.clanName}</h3>
                              <p className="text-sm text-gray-400">
                                {clanStat.memberCount} members
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-purple-400">
                                {Math.round(clanStat.attendanceRate)}%
                              </div>
                              <div className="text-sm text-gray-400">attendance rate</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400">Total Attendances</div>
                              <div className="font-mono text-green-400">
                                {clanStat.totalAttendances}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400">Avg per Member</div>
                              <div className="font-mono text-blue-400">
                                {Math.round(clanStat.averageAttendance)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400">Performance</div>
                              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(clanStat.attendanceRate, 100)}%`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Weekly Trend Chart */}
                <WeeklyTrendChart data={attendanceStats.weeklyTrends} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Trends */}
                  <Card className="bg-white/5 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Monthly Attendance Trends
                      </CardTitle>
                      <CardDescription>Last 12 months attendance patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {attendanceStats.monthlyTrends.map((trend, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                            <div>
                              <span className="font-medium">
                                {trend.month} {trend.year}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <div className="text-blue-400">{trend.totalEvents}</div>
                                <div className="text-xs text-gray-400">events</div>
                              </div>
                              <div className="text-center">
                                <div className="text-green-400">{trend.totalAttendances}</div>
                                <div className="text-xs text-gray-400">attendances</div>
                              </div>
                              <div className="text-center">
                                <div className="text-purple-400">{trend.uniqueAttendees}</div>
                                <div className="text-xs text-gray-400">unique</div>
                              </div>
                              <div className="text-center">
                                <div className="text-yellow-400">{Math.round(trend.averageAttendance)}</div>
                                <div className="text-xs text-gray-400">avg</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weekly Trends */}
                  <Card className="bg-white/5 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        Weekly Attendance Trends
                      </CardTitle>
                      <CardDescription>Last 12 weeks attendance patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {attendanceStats.weeklyTrends.map((trend, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                            <div>
                              <span className="font-medium">{trend.week}</span>
                              <div className="text-xs text-gray-400">
                                {new Date(trend.startDate).toLocaleDateString()} - {new Date(trend.endDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <div className="text-blue-400">{trend.totalEvents}</div>
                                <div className="text-xs text-gray-400">events</div>
                              </div>
                              <div className="text-center">
                                <div className="text-green-400">{trend.totalAttendances}</div>
                                <div className="text-xs text-gray-400">attendances</div>
                              </div>
                              <div className="text-center">
                                <div className="text-purple-400">{trend.uniqueAttendees}</div>
                                <div className="text-xs text-gray-400">unique</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Member Detail Modal */}
      <Dialog open={showMemberModal} onOpenChange={setShowMemberModal}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              {selectedMember?.name} - Attendance Analytics
            </DialogTitle>
            <DialogDescription>
              Detailed attendance analysis and visualization for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-6">
              {/* Member Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/5 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold">
                        {selectedMember.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedMember.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTitleColor(selectedMember.title)}`}
                        >
                          {selectedMember.title}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-gray-700">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {attendanceStats.memberStats.find(m => m.member.id === selectedMember.id)?.attendanceCount || 0}
                      </div>
                      <div className="text-sm text-gray-400">Events Attended</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-gray-700">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.round(attendanceStats.memberStats.find(m => m.member.id === selectedMember.id)?.attendanceRate || 0)}%
                      </div>
                      <div className="text-sm text-gray-400">Attendance Rate</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Member-specific charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member's Event Attendance Timeline */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Event Participation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {attendanceRecords
                        .filter(record => record.member_id === selectedMember.id)
                        .slice(0, 10)
                        .map((record) => {
                          const event = events.find(e => e.id === record.event_id);
                          return event ? (
                            <div key={record.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                              <div>
                                <div className="font-medium text-sm">{event.title}</div>
                                <div className="text-xs text-gray-400">
                                  {new Date(event.date).toLocaleDateString()} • {event.type}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {record.status}
                                </Badge>
                                {event.point_value && (
                                  <div className="flex items-center gap-1">
                                    <Award className="w-3 h-3 text-yellow-400" />
                                    <span className="text-xs text-yellow-400">{event.point_value}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null;
                        })}
                    </div>
                  </CardContent>
                </Card>

                {/* Member Statistics */}
                <Card className="bg-white/5 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Member Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Points Earned</span>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="font-mono text-yellow-400">
                            {attendanceStats.memberStats.find(m => m.member.id === selectedMember.id)?.totalPoints || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Streak</span>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-orange-400" />
                          <span className="font-mono text-orange-400">
                            {attendanceStats.memberStats.find(m => m.member.id === selectedMember.id)?.streak || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Clan</span>
                        <span className="text-white">
                          {selectedMember.clan_name || 'No clan'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Discord</span>
                        <span className="text-blue-400">
                          {selectedMember.discord_username || 'Not linked'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email</span>
                        <span className="text-gray-300 text-sm">
                          {selectedMember.email}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
