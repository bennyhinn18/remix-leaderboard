import { useAsyncValue } from "@remix-run/react";
import { User, ChevronRight, Calendar } from "lucide-react";
import { Badge } from "~/components/ui/badge";

// Types for the API data
interface Member {
  name: string;
  avatar_url?: string;
}

interface Activity {
  id: string;
  member?: Member;
  points: number;
  description: string;
  updated_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  created_by?: string;
}

interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
}

// Component to display Recent Activities data once it resolves
export function RecentActivitiesData() {
  const recentActivities = useAsyncValue() as Activity[];
  
  return (
    <>
      {recentActivities && recentActivities.length > 0 ? (
        recentActivities.map((activity: Activity) => (
          <div 
            key={activity.id}
            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
              {activity.member?.avatar_url ? (
                <img 
                  src={activity.member.avatar_url} 
                  alt={activity.member.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">
                  {activity.member?.name || "Unknown User"}
                </span>
                <span className={`${
                  activity.points > 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {activity.points > 0 ? "+" : ""}{activity.points} points
                </span>
              </div>
              <p className="text-sm text-gray-400 truncate">
                {activity.description}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(activity.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400 py-6">
          No recent activity to display
        </div>
      )}
    </>
  );
}

// Component to display Announcements data once it resolves
export function AnnouncementsData({ onAnnouncementClick }: { onAnnouncementClick: (announcement: Announcement) => void }) {
  const announcements = useAsyncValue() as Announcement[];
  
  return (
    <>
      {announcements && announcements.length > 0 ? (
        announcements.map((announcement: Announcement) => (
          <div 
            key={announcement.id}
            className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => onAnnouncementClick(announcement)}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{announcement.title}</h3>
              <Badge variant="outline" className={`text-xs ${
                announcement.category === 'Important' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-blue-500/10 text-blue-400'
              }`}>
                {announcement.category}
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
              {announcement.content}
            </p>
            <div className="text-xs flex justify-between items-center mt-2">
              <span className="text-gray-500">
                {new Date(announcement.created_at).toLocaleDateString()}
              </span>
              <span className="text-blue-400 text-xs flex items-center">
                Read more <ChevronRight className="w-3 h-3 ml-1" />
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400 py-6">
          No announcements to display
        </div>
      )}
    </>
  );
}

// Component to display Upcoming Events data once it resolves
export function UpcomingEventsData() {
  const upcomingEvents = useAsyncValue() as Event[];
  
  return (
    <>
      {upcomingEvents && upcomingEvents.length > 0 ? (
        upcomingEvents.map((event: Event) => (
          <div 
            key={event.id}
            className="p-3 bg-white/5 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{event.title}</h3>
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400">
                {event.type}
              </Badge>
            </div>
            <div className="text-sm text-gray-400 mt-2 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(event.date).toLocaleDateString()} at {event.time}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {event.location}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400 py-6">
          No upcoming events
        </div>
      )}
    </>
  );
}
