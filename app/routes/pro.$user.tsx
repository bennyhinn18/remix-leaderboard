import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ProfileInfo } from "~/components/profile-info";
import { initSupabase } from "~/utils/supabase.client";
import { createServerSupabase } from "~/utils/supabase.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  const { data: member, error } = await supabase
    .from("members")
    .select("*")
    .eq("github_username", params.user)
    .single();

  if (error || !member) {
    return json({ member: null, SUPABASE_URL: process.env.SUPABASE_URL, SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY });
  }

  return json({
    member,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  });
};

export default function Profile() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, member } = useLoaderData<typeof loader>();
  interface Profile {
    avatar_url: string;
    title: string;
    joinedDate: Date;
    basherLevel: string;
    bashPoints: number;
    clanName: string;
    basherNo: string;
    projects: number;
    certifications: number;
    internships: number;
    courses: number;
    resume_url: string;
    portfolio_url: string;
    domains: string[];
    streaks: {
      github: number;
      leetcode: number;
      duolingo: number;
      discord: number;
      books: number;
    };
    hobbies: string[];
    testimonial: string;
    gpa: number;
    socials: { platform: string; url: string }[];
    attendance: number;
  }

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !member) return; // Exit early if no member

    const fetchProfile = async () => {
      try {
        // Fetch GitHub contributions
        const githubResponse = await fetch(`https://api.github.com/users/${member.github_username}/events/public`);
        const githubEvents = await githubResponse.json();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const contributions = Array.isArray(githubEvents)
          ? githubEvents.filter(
              (event: any) =>
                new Date(event.created_at) > thirtyDaysAgo &&
                ["PushEvent", "CreateEvent", "PullRequestEvent"].includes(event.type)
            )
          : [];
            console.log("dup username = ",member.duolingo_username)
        // Fetch Duolingo streak
        const duolingoResponse = await fetch(
          `https://www.duolingo.com/2017-06-30/users?username=${member.duolingo_username}&fields=streak,streakData%7BcurrentStreak,previousStreak%7D%7D`
        );
        const duolingoData = await duolingoResponse.json();
        const userData = duolingoData.users?.[0] || {};
        const duolingo_streak = Math.max(
          userData.streak ?? 0,
          userData.streakData?.currentStreak?.length ?? 0,
          userData.streakData?.previousStreak?.length ?? 0
        );

        setProfile({
          ...member,
          avatar_url: member.avatar_url || "/default-avatar.png", // Provide default avatar
          title: member.title || "Basher",
          joinedDate: new Date(member.joined_date || Date.now()),
          basherLevel: member.bash_points >= 2500 ? "Diamond" : member.bash_points >= 2400 ? "Platinum" : "Gold",
          bashPoints: member.bash_points || 0,
          clanName: member.clan_name || "Byte Basher",
          basherNo: member.basher_no || "BBT2023045",
          projects: member.stats?.projects || 0,
          certifications: member.stats?.certifications || 0,
          internships: member.stats?.internships || 0,
          courses: member.stats?.courses || 0,
          resume_url: member.resume_url || "",
          portfolio_url: member.portfolio_url || "",
          domains: [...(member.primary_domain || []), ...(member.secondary_domain || [])],
          streaks: {
            github: contributions.length,
            leetcode: 15,
            duolingo: duolingo_streak,
            discord: 60,
            books: 12,
          },
          hobbies: member.hobbies || [],
          testimonial: member.testimony || "No testimonial available.",
          gpa: member.gpa || 0,
          socials: [
            { platform: "github", url: `https://github.com/${member.github_username}` },
            { platform: "linkedin", url: member.linkedin_url || "#" },
            { platform: "instagram", url: member.instagram_username ? `https://instagram.com/${member.instagram_username}` : "#" },
          ],
          attendance: member.weekly_bash_attendance || 0,
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, [SUPABASE_URL, SUPABASE_ANON_KEY, member]);

  if (!profile) return <p>Loading...</p>; // Prevent rendering ProfileInfo with null data

  return <ProfileInfo profile={profile} />;
}
