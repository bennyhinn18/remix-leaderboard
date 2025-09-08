import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

// Color palettes for charts
const COLORS = {
  primary: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
  secondary: ['#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0284C7', '#65A30D', '#EA580C'],
  gradient: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#38BDF8', '#A3E635', '#FB923C']
};

interface MonthlyTrendChartProps {
  data: Array<{
    month: string;
    year: number;
    totalEvents: number;
    totalAttendances: number;
    uniqueAttendees: number;
    averageAttendance: number;
  }>;
}

function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  // Validate data to prevent undefined values
  const validData = data?.filter(item => 
    item && 
    typeof item.totalEvents === 'number' && 
    typeof item.totalAttendances === 'number' &&
    typeof item.uniqueAttendees === 'number' &&
    typeof item.averageAttendance === 'number' &&
    item.month && 
    typeof item.year === 'number'
  ) || [];

  const chartData = validData.map(item => ({
    name: `${item.month} ${item.year}`,
    events: item.totalEvents,
    attendances: item.totalAttendances,
    unique: item.uniqueAttendees,
    average: Math.round(item.averageAttendance)
  }));

  return (
    <Card className="bg-white/5 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          📈 Monthly Attendance Trends
        </CardTitle>
        <CardDescription>Event and attendance patterns over the last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Legend />
            <Bar dataKey="events" fill="#3B82F6" name="Events" />
            <Line 
              type="monotone" 
              dataKey="attendances" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Total Attendances"
            />
            <Line 
              type="monotone" 
              dataKey="unique" 
              stroke="#F59E0B" 
              strokeWidth={2}
              name="Unique Attendees"
            />
          </ComposedChart>
        </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-gray-400">
            No attendance data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AttendanceRateChartProps {
  data: Array<{
    event: {
      title: string;
      date: string;
      type: string;
      point_value: number;
    };
    attendanceCount: number;
    attendanceRate: number;
  }>;
}

function AttendanceRateChart({ data }: AttendanceRateChartProps) {
  const chartData = data
    .slice(0, 15) // Top 15 events
    .map(item => ({
      name: item.event.title.length > 20 ? item.event.title.substring(0, 20) + '...' : item.event.title,
      rate: Math.round(item.attendanceRate),
      count: item.attendanceCount,
      type: item.event.type,
      points: item.event.point_value,
      date: new Date(item.event.date).toLocaleDateString()
    }))
    .sort((a, b) => b.rate - a.rate);

  const getColorByType = (type: string) => {
    switch (type) {
      case 'weeklyBash': return '#3B82F6';
      case 'dailyGathering': return '#10B981';
      case 'custom': return '#F59E0B';
      default: return '#8B5CF6';
    }
  };

  return (
    <Card className="bg-white/5 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          📊 Event Attendance Rates
        </CardTitle>
        <CardDescription>Top performing events by attendance percentage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#9CA3AF" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value, name, props) => [
                name === 'rate' ? `${value}%` : value,
                name === 'rate' ? 'Attendance Rate' : 
                name === 'count' ? 'Attendees' :
                name === 'points' ? 'Points' : name
              ]}
              labelFormatter={(label) => `Event: ${label}`}
            />
            <Bar 
              dataKey="rate" 
              fill="#3B82F6"
              name="Attendance Rate (%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ClanPerformanceChartProps {
  data: Array<{
    clanName: string;
    clanId: number;
    memberCount: number;
    totalAttendances: number;
    averageAttendance: number;
    attendanceRate: number;
  }>;
}

function ClanPerformanceChart({ data }: ClanPerformanceChartProps) {
  const chartData = data
    .filter(clan => clan.memberCount > 0)
    .map(clan => ({
      name: clan.clanName.length > 15 ? clan.clanName.substring(0, 15) + '...' : clan.clanName,
      fullName: clan.clanName,
      rate: Math.round(clan.attendanceRate),
      members: clan.memberCount,
      totalAttendances: clan.totalAttendances,
      avgAttendance: Math.round(clan.averageAttendance)
    }))
    .sort((a, b) => b.rate - a.rate);

  return (
    <Card className="bg-white/5 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          🏆 Clan Performance Comparison
        </CardTitle>
        <CardDescription>Attendance rates and member engagement by clan</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value, name) => [
                name === 'rate' ? `${value}%` : value,
                name === 'rate' ? 'Attendance Rate' : 
                name === 'members' ? 'Members' :
                name === 'totalAttendances' ? 'Total Attendances' :
                name === 'avgAttendance' ? 'Avg per Member' : name
              ]}
              labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
            />
            <Bar 
              dataKey="rate" 
              fill="#10B981"
              name="Attendance Rate (%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface MemberEngagementChartProps {
  data: Array<{
    member: {
      name: string;
      title: string;
      clan_name: string;
    };
    attendanceCount: number;
    attendanceRate: number;
  }>;
}

function MemberEngagementChart({ data }: MemberEngagementChartProps) {
  const topMembers = data.slice(0, 20);
  
  const chartData = topMembers.map((item, index) => ({
    name: item.member.name.length > 15 ? item.member.name.substring(0, 15) + '...' : item.member.name,
    fullName: item.member.name,
    rate: Math.round(item.attendanceRate),
    count: item.attendanceCount,
    title: item.member.title,
    clan: item.member.clan_name,
    rank: index + 1
  }));

  return (
    <Card className="bg-white/5 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          👥 Member Engagement Leaderboard
        </CardTitle>
        <CardDescription>Top 20 members by attendance rate</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={600}>
          <BarChart data={chartData} layout="horizontal" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" domain={[0, 100]} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={10}
              width={75}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value, name) => [
                name === 'rate' ? `${value}%` : value,
                name === 'rate' ? 'Attendance Rate' : 
                name === 'count' ? 'Events Attended' : name
              ]}
              labelFormatter={(label) => {
                const member = chartData.find(d => d.name === label);
                return member ? `${member.fullName} (${member.title})` : label;
              }}
            />
            <Bar 
              dataKey="rate" 
              fill="#8B5CF6"
              name="Attendance Rate (%)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface EventTypesDistributionProps {
  data: Array<{
    event: {
      type: string;
      title: string;
    };
    attendanceCount: number;
    attendanceRate: number;
  }>;
}

function EventTypesDistribution({ data }: EventTypesDistributionProps) {
  // Group by event type
  const typeStats = data.reduce((acc, item) => {
    const type = item.event.type || 'Unknown';
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        totalAttendances: 0,
        events: 0
      };
    }
    acc[type].events += 1;
    acc[type].totalAttendances += item.attendanceCount;
    return acc;
  }, {} as Record<string, { count: number; totalAttendances: number; events: number }>);

  const pieData = Object.entries(typeStats).map(([type, stats], index) => ({
    name: type,
    value: stats.events,
    attendances: stats.totalAttendances,
    avgAttendance: Math.round(stats.totalAttendances / stats.events),
    color: COLORS.primary[index % COLORS.primary.length]
  }));

  const donutData = Object.entries(typeStats).map(([type, stats], index) => ({
    name: type,
    value: stats.totalAttendances,
    events: stats.events,
    color: COLORS.secondary[index % COLORS.secondary.length]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Events by Type */}
      <Card className="bg-white/5 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            📅 Events by Type
          </CardTitle>
          <CardDescription>Distribution of event types</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attendances by Type */}
      <Card className="bg-white/5 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            👥 Attendances by Type
          </CardTitle>
          <CardDescription>Total attendances per event type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

interface WeeklyTrendChartProps {
  data: Array<{
    week: string;
    startDate: string;
    endDate: string;
    totalEvents: number;
    totalAttendances: number;
    uniqueAttendees: number;
  }>;
}

function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const chartData = data.map(item => ({
    name: item.week,
    events: item.totalEvents,
    attendances: item.totalAttendances,
    unique: item.uniqueAttendees,
    period: `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`
  }));

  return (
    <Card className="bg-white/5 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          📊 Weekly Activity Trends
        </CardTitle>
        <CardDescription>Weekly patterns over the last 12 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.name === label);
                return item ? `${label} (${item.period})` : label;
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="attendances" 
              stackId="1"
              stroke="#3B82F6" 
              fill="#3B82F6"
              fillOpacity={0.6}
              name="Total Attendances"
            />
            <Area 
              type="monotone" 
              dataKey="unique" 
              stackId="2"
              stroke="#10B981" 
              fill="#10B981"
              fillOpacity={0.6}
              name="Unique Attendees"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface AttendanceHeatmapProps {
  data: Array<{
    event: {
      title: string;
      date: string;
      type: string;
    };
    attendanceCount: number;
    attendanceRate: number;
  }>;
}

function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  // Group events by month and calculate average attendance
  const monthlyData = data.reduce((acc, item) => {
    const date = new Date(item.event.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        events: [],
        totalAttendances: 0,
        totalEvents: 0
      };
    }
    
    acc[monthKey].events.push(item);
    acc[monthKey].totalAttendances += item.attendanceCount;
    acc[monthKey].totalEvents += 1;
    
    return acc;
  }, {} as Record<string, any>);

  const heatmapData = Object.values(monthlyData).map((month: any) => ({
    name: month.month,
    avgAttendance: Math.round(month.totalAttendances / month.totalEvents),
    totalEvents: month.totalEvents,
    totalAttendances: month.totalAttendances
  }));

  return (
    <Card className="bg-white/5 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          🔥 Monthly Attendance Intensity
        </CardTitle>
        <CardDescription>Average attendance per event by month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={heatmapData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Bar 
              dataKey="avgAttendance" 
              fill="#F59E0B"
              name="Average Attendance"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Export all chart components
export {
  MonthlyTrendChart,
  AttendanceRateChart,
  ClanPerformanceChart,
  MemberEngagementChart,
  EventTypesDistribution,
  WeeklyTrendChart,
  AttendanceHeatmap
};
