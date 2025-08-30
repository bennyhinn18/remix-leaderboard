import { SupabaseClient } from '@supabase/supabase-js';

// Interfaces from comprehensive analytics (stage 3)
export interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: number;
  created_at: string;
  timestamp: string;
  roll_number: string;
  type: string;
  member_name: string;
  name: string;
  status: string;
  event?: Event;
  member?: Member;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  attendees: number;
  type: string;
  point_value: number;
  clan_id?: number;
  description?: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  roll_number: string;
  clan_name: string;
  clan_id: number;
  title: string;
  bash_points: number;
  avatar_url?: string;
  github_username?: string;
  discord_username?: string;
}

// Interfaces from clan attendance (stage 2)
export interface ClanAttendanceStats {
  clanId: number;
  clanName: string;
  totalAttendances: number;
  uniqueAttendees: number;
  attendanceRate: number;
  weeklyAttendances: WeeklyBashAttendance[];
  topAttenders: Array<{
    memberId: number;
    memberName: string;
    attendanceCount: number;
  }>;
}

export interface WeeklyBashAttendance {
  week: string;
  attendanceCount: number;
  memberIds: number[];
}

// Comprehensive analytics interfaces (stage 3)
export interface AttendanceStats {
  totalEvents: number;
  totalAttendances: number;
  uniqueAttendees: number;
  averageAttendance: number;
  attendanceRate: number;
  topAttenders: Array<{
    member: Member;
    attendanceCount: number;
    attendanceRate: number;
  }>;
  eventStats: Array<{
    event: Event;
    attendanceCount: number;
    attendanceRate: number;
  }>;
  memberStats: Array<{
    member: Member;
    attendanceCount: number;
    attendanceRate: number;
    totalPoints: number;
    streak: number;
  }>;
  clanStats: Array<{
    clanName: string;
    clanId: number;
    memberCount: number;
    totalAttendances: number;
    averageAttendance: number;
    attendanceRate: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    year: number;
    totalEvents: number;
    totalAttendances: number;
    uniqueAttendees: number;
    averageAttendance: number;
  }>;
  weeklyTrends: Array<{
    week: string;
    startDate: string;
    endDate: string;
    totalEvents: number;
    totalAttendances: number;
    uniqueAttendees: number;
  }>;
}

export interface AttendanceFilters {
  startDate?: string;
  endDate?: string;
  eventIds?: string[];
  memberIds?: number[];
  clanIds?: number[];
  eventTypes?: string[];
  eventStatuses?: string[];
  memberTitles?: string[];
  minAttendance?: number;
  maxAttendance?: number;
}

export class AttendanceService {
  // ===== COMPREHENSIVE ANALYTICS METHODS (from stage 3) =====
  
  // Get all attendance records with optional filtering
  static async getAttendanceRecords(supabase: SupabaseClient, filters: AttendanceFilters = {}) {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        event:events(*),
        member:members(*)
      `)
      .order('created_at', { ascending: false });

    // Apply date filters
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Apply event filters
    if (filters.eventIds && filters.eventIds.length > 0) {
      query = query.in('event_id', filters.eventIds);
    }

    // Apply member filters
    if (filters.memberIds && filters.memberIds.length > 0) {
      query = query.in('member_id', filters.memberIds);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Apply additional filters that need to be done post-query
    let filteredData = data || [];

    if (filters.clanIds && filters.clanIds.length > 0) {
      filteredData = filteredData.filter((record: any) => 
        record.member && filters.clanIds!.includes(record.member.clan_id)
      );
    }

    if (filters.eventTypes && filters.eventTypes.length > 0) {
      filteredData = filteredData.filter((record: any) => 
        record.event && filters.eventTypes!.includes(record.event.type)
      );
    }

    if (filters.eventStatuses && filters.eventStatuses.length > 0) {
      filteredData = filteredData.filter((record: any) => 
        record.event && filters.eventStatuses!.includes(record.event.status)
      );
    }

    if (filters.memberTitles && filters.memberTitles.length > 0) {
      filteredData = filteredData.filter((record: any) => 
        record.member && filters.memberTitles!.includes(record.member.title)
      );
    }

    return filteredData as AttendanceRecord[];
  }

  // Get all events
  static async getEvents(supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Event[];
  }

  // Get all members
  static async getMembers(supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Member[];
  }

  // Get all clans
  static async getClans(supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from('clans')
      .select('*')
      .order('clan_name');

    if (error) throw error;
    return data as Array<{ id: number; clan_name: string; }>;
  }

  // Calculate comprehensive attendance statistics
  static async getAttendanceStats(supabase: SupabaseClient, filters: AttendanceFilters = {}): Promise<AttendanceStats> {
    const [attendanceRecords, events, members, clans] = await Promise.all([
      this.getAttendanceRecords(supabase, filters),
      this.getEvents(supabase),
      this.getMembers(supabase),
      this.getClans(supabase)
    ]);

    // Filter events based on filters
    let filteredEvents = events;
    if (filters.startDate || filters.endDate || filters.eventTypes || filters.eventStatuses) {
      filteredEvents = events.filter(event => {
        if (filters.startDate && event.date < filters.startDate) return false;
        if (filters.endDate && event.date > filters.endDate) return false;
        if (filters.eventTypes && filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.type)) return false;
        if (filters.eventStatuses && filters.eventStatuses.length > 0 && !filters.eventStatuses.includes(event.status)) return false;
        return true;
      });
    }

    // Filter members based on filters
    let filteredMembers = members;
    if (filters.memberIds || filters.clanIds || filters.memberTitles) {
      filteredMembers = members.filter(member => {
        if (filters.memberIds && filters.memberIds.length > 0 && !filters.memberIds.includes(member.id)) return false;
        if (filters.clanIds && filters.clanIds.length > 0 && !filters.clanIds.includes(member.clan_id)) return false;
        if (filters.memberTitles && filters.memberTitles.length > 0 && !filters.memberTitles.includes(member.title)) return false;
        return true;
      });
    }

    const totalEvents = filteredEvents.length;
    const totalAttendances = attendanceRecords.length;
    const uniqueAttendees = new Set(attendanceRecords.map(r => r.member_id)).size;
    const averageAttendance = totalEvents > 0 ? totalAttendances / totalEvents : 0;
    const totalPossibleAttendances = filteredMembers.length * totalEvents;
    const attendanceRate = totalPossibleAttendances > 0 ? (totalAttendances / totalPossibleAttendances) * 100 : 0;

    // Calculate top attenders
    const memberAttendanceCounts = attendanceRecords.reduce((acc, record) => {
      acc[record.member_id] = (acc[record.member_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const topAttenders = Object.entries(memberAttendanceCounts)
      .map(([memberId, count]) => {
        const member = members.find(m => m.id === parseInt(memberId));
        if (!member) return null;
        return {
          member,
          attendanceCount: count,
          attendanceRate: totalEvents > 0 ? (count / totalEvents) * 100 : 0
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.attendanceCount - a!.attendanceCount)
      .slice(0, 20) as AttendanceStats['topAttenders'];

    // Calculate event stats
    const eventAttendanceCounts = attendanceRecords.reduce((acc, record) => {
      acc[record.event_id] = (acc[record.event_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventStats = filteredEvents.map(event => {
      const attendanceCount = eventAttendanceCounts[event.id] || 0;
      const possibleAttendees = filteredMembers.length;
      return {
        event,
        attendanceCount,
        attendanceRate: possibleAttendees > 0 ? (attendanceCount / possibleAttendees) * 100 : 0
      };
    }).sort((a, b) => b.attendanceCount - a.attendanceCount);

    // Calculate clan stats
    const clanAttendanceCounts = attendanceRecords.reduce((acc, record) => {
      if (record.member?.clan_id) {
        acc[record.member.clan_id] = (acc[record.member.clan_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    const clanStats = clans.map(clan => {
      const clanMembers = filteredMembers.filter(m => m.clan_id === clan.id);
      const totalAttendances = clanAttendanceCounts[clan.id] || 0;
      const memberCount = clanMembers.length;
      const possibleAttendances = memberCount * totalEvents;
      
      return {
        clanName: clan.clan_name,
        clanId: clan.id,
        memberCount,
        totalAttendances,
        averageAttendance: memberCount > 0 ? totalAttendances / memberCount : 0,
        attendanceRate: possibleAttendances > 0 ? (totalAttendances / possibleAttendances) * 100 : 0
      };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);

    // Calculate monthly trends (last 12 months)
    const monthlyTrends: AttendanceStats['monthlyTrends'] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= monthStart && eventDate <= monthEnd;
      });

      const monthAttendances = attendanceRecords.filter(record => {
        const recordDate = new Date(record.created_at);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });

      const uniqueMonthAttendees = new Set(monthAttendances.map(r => r.member_id)).size;

      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        totalEvents: monthEvents.length,
        totalAttendances: monthAttendances.length,
        uniqueAttendees: uniqueMonthAttendees,
        averageAttendance: monthEvents.length > 0 ? monthAttendances.length / monthEvents.length : 0
      });
    }

    // Calculate weekly trends (last 12 weeks)
    const weeklyTrends: AttendanceStats['weeklyTrends'] = [];
    for (let i = 11; i >= 0; i--) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      const weekEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });

      const weekAttendances = attendanceRecords.filter(record => {
        const recordDate = new Date(record.created_at);
        return recordDate >= startDate && recordDate <= endDate;
      });

      const uniqueWeekAttendees = new Set(weekAttendances.map(r => r.member_id)).size;

      weeklyTrends.push({
        week: `Week ${52 - i}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalEvents: weekEvents.length,
        totalAttendances: weekAttendances.length,
        uniqueAttendees: uniqueWeekAttendees
      });
    }

    // Calculate member stats (similar to topAttenders but with additional fields)
    const memberStats = filteredMembers.map(member => {
      const attendanceCount = memberAttendanceCounts[member.id] || 0;
      const attendanceRate = totalEvents > 0 ? (attendanceCount / totalEvents) * 100 : 0;
      
      // Calculate total points from attended events
      const memberAttendances = attendanceRecords.filter(r => r.member_id === member.id);
      const totalPoints = memberAttendances.reduce((sum, attendance) => {
        const event = events.find(e => e.id === attendance.event_id);
        return sum + (event?.point_value || 0);
      }, 0);
      
      // Calculate streak (consecutive events attended)
      const memberEventAttendances = filteredEvents.map(event => {
        return attendanceRecords.some(r => r.event_id === event.id && r.member_id === member.id);
      }).reverse(); // Most recent first
      
      let streak = 0;
      for (const attended of memberEventAttendances) {
        if (attended) {
          streak++;
        } else {
          break;
        }
      }

      return {
        member,
        attendanceCount,
        attendanceRate,
        totalPoints,
        streak
      };
    }).sort((a, b) => b.attendanceCount - a.attendanceCount);

    return {
      totalEvents,
      totalAttendances,
      uniqueAttendees,
      averageAttendance,
      attendanceRate,
      topAttenders,
      eventStats,
      memberStats,
      clanStats,
      monthlyTrends,
      weeklyTrends
    };
  }

  // Get unique event types
  static async getEventTypes(supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from('events')
      .select('type')
      .order('type');

    if (error) throw error;
    
    const types = [...new Set(data?.map((item: any) => item.type).filter(Boolean))];
    return types;
  }

  // Get unique member titles
  static async getMemberTitles(supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from('members')
      .select('title')
      .order('title');

    if (error) throw error;
    
    const titles = [...new Set(data?.map((item: any) => item.title).filter(Boolean))];
    return titles;
  }

  // Export attendance data
  static async exportAttendanceData(supabase: SupabaseClient, filters: AttendanceFilters = {}, format: 'csv' | 'json' = 'csv') {
    const records = await this.getAttendanceRecords(supabase, filters);
    
    if (format === 'json') {
      return records;
    }

    // Convert to CSV format
    const headers = [
      'Date',
      'Event Title',
      'Event Type',
      'Member Name',
      'Roll Number',
      'Clan',
      'Member Title',
      'Venue',
      'Points Earned'
    ];

    const rows = records.map(record => [
      new Date(record.created_at).toLocaleDateString(),
      record.event?.title || 'Unknown Event',
      record.event?.type || 'Unknown',
      record.member?.name || record.member_name || 'Unknown Member',
      record.roll_number,
      record.member?.clan_name || 'Unknown Clan',
      record.member?.title || 'Unknown Title',
      record.event?.venue || 'Unknown Venue',
      record.event?.point_value || 0
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // ===== CLAN ATTENDANCE METHODS (from stage 2) =====

  // Get weekly bash attendance for clans (Hall of Fame functionality)
  static async getWeeklyBashAttendance(supabase: SupabaseClient): Promise<WeeklyBashAttendance[]> {
    // Get bash events from the last 12 weeks
    const weeklyAttendances: WeeklyBashAttendance[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      // Get bash events for this week
      const { data: weekEvents, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('type', 'Weekly Bash')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (eventsError) continue;

      if (weekEvents && weekEvents.length > 0) {
        // Get attendance for these events
        const { data: weekAttendance, error: attendanceError } = await supabase
          .from('attendance')
          .select('member_id')
          .in('event_id', weekEvents.map(e => e.id));

        if (!attendanceError && weekAttendance) {
          const memberIds = [...new Set(weekAttendance.map(a => a.member_id))];
          weeklyAttendances.push({
            week: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            attendanceCount: memberIds.length,
            memberIds
          });
        }
      }
    }

    return weeklyAttendances;
  }

  // Get clan attendance statistics (Hall of Fame functionality)
  static async getClanAttendanceStats(supabase: SupabaseClient, clanId?: number): Promise<ClanAttendanceStats[]> {
    const clans = clanId 
      ? await supabase.from('clans').select('*').eq('id', clanId)
      : await supabase.from('clans').select('*').order('clan_name');

    if (clans.error || !clans.data) return [];

    const clanStats: ClanAttendanceStats[] = [];

    for (const clan of clans.data) {
      // Get clan members
      const { data: clanMembers, error: membersError } = await supabase
        .from('members')
        .select('id, name')
        .eq('clan_id', clan.id);

      if (membersError || !clanMembers) continue;

      // Get weekly bash events
      const { data: bashEvents, error: eventsError } = await supabase
        .from('events')
        .select('id, date')
        .eq('type', 'Weekly Bash')
        .order('date', { ascending: false })
        .limit(12);

      if (eventsError || !bashEvents) continue;

      // Get attendance for clan members in bash events
      const memberIds = clanMembers.map(m => m.id);
      const eventIds = bashEvents.map(e => e.id);

      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('member_id, event_id, created_at')
        .in('member_id', memberIds)
        .in('event_id', eventIds);

      if (attendanceError || !attendance) continue;

      // Calculate stats
      const totalAttendances = attendance.length;
      const uniqueAttendees = new Set(attendance.map(a => a.member_id)).size;
      const totalPossibleAttendances = clanMembers.length * bashEvents.length;
      const attendanceRate = totalPossibleAttendances > 0 ? (totalAttendances / totalPossibleAttendances) * 100 : 0;

      // Get weekly attendance breakdown
      const weeklyAttendances = await this.getWeeklyBashAttendance(supabase);

      // Calculate top attenders for this clan
      const memberAttendanceCounts = attendance.reduce((acc, record) => {
        acc[record.member_id] = (acc[record.member_id] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const topAttenders = Object.entries(memberAttendanceCounts)
        .map(([memberId, count]) => {
          const member = clanMembers.find(m => m.id === parseInt(memberId));
          if (!member) return null;
          return {
            memberId: member.id,
            memberName: member.name,
            attendanceCount: count
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.attendanceCount - a!.attendanceCount)
        .slice(0, 10) as ClanAttendanceStats['topAttenders'];

      clanStats.push({
        clanId: clan.id,
        clanName: clan.clan_name,
        totalAttendances,
        uniqueAttendees,
        attendanceRate,
        weeklyAttendances,
        topAttenders
      });
    }

    return clanStats.sort((a, b) => b.attendanceRate - a.attendanceRate);
  }

  // Get attendance hall of fame (top performers across all clans)
  static async getAttendanceHallOfFame(supabase: SupabaseClient) {
    // Get all clan stats
    const clanStats = await this.getClanAttendanceStats(supabase);
    
    // Get weekly attendance data
    const weeklyAttendances = await this.getWeeklyBashAttendance(supabase);

    // Calculate overall top performers
    const allTopAttenders = clanStats.flatMap(clan => 
      clan.topAttenders.map(attender => ({
        ...attender,
        clanId: clan.clanId,
        clanName: clan.clanName
      }))
    );

    const globalTopAttenders = allTopAttenders
      .sort((a, b) => b.attendanceCount - a.attendanceCount)
      .slice(0, 20);

    return {
      clanStats,
      weeklyAttendances,
      globalTopAttenders,
      totalClans: clanStats.length,
      totalWeeks: weeklyAttendances.length
    };
  }
}