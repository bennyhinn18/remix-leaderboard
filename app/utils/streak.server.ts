/* Server-side streak utilities for Remix */
type DayCount = Record<string, number>;

export type Streak = {
  start: string;
  end: string;
  length: number;
};

export type StreakStats = {
  mode: "daily" | "weekly";
  totalContributions: number;
  firstContribution: string;
  currentStreak: Streak;
  longestStreak: Streak;
  excludedDays?: string[];
};

const GITHUB_GRAPHQL = "https://api.github.com/graphql";

function assertEnv() {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not set");
  }
}

async function gh<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  assertEnv();
  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "streak-stats-remix",
      Accept: "application/vnd.github.v4.idl",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    const msg = json?.errors?.map((e: any) => e.message).join("; ") || `GitHub GraphQL error (${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}

function ymd(d: Date): string {
  // Format as YYYY-MM-DD in UTC
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISODateUTC(iso: string): Date {
  // Force UTC date (no timezone shift)
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDaysUTC(iso: string, delta: number): string {
  const d = parseISODateUTC(iso);
  d.setUTCDate(d.getUTCDate() + delta);
  return ymd(d);
}

function getPreviousSunday(dateISO: string): string {
  const d = parseISODateUTC(dateISO);
  const day = d.getUTCDay(); // 0=Sun
  d.setUTCDate(d.getUTCDate() - day);
  return ymd(d);
}

function normalizeDays(days: string[]): string[] {
  const valid = new Set(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  return days
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.length > 3 ? s.slice(0, 3) : s))
    .map((s) => s[0]?.toUpperCase() + s.slice(1).toLowerCase())
    .filter((s) => valid.has(s));
}

function dayAbbr(iso: string): string {
  const d = parseISODateUTC(iso);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
}

function isExcludedDay(iso: string, excludedDays: string[]): boolean {
  if (!excludedDays?.length) return false;
  return excludedDays.includes(dayAbbr(iso));
}

/* Fetch the user's account creation year (fallback if no starting_year passed) */
export async function getUserCreatedYear(login: string): Promise<number> {
  const query = `
    query($login: String!) {
      user(login: $login) {
        createdAt
      }
    }
  `;
  const data = await gh<{ data: { user: { createdAt: string } | null } }>(query, { login });
  const createdAt = data.data.user?.createdAt;
  if (!createdAt) throw new Error("Could not find a user with that name.");
  return new Date(createdAt).getUTCFullYear();
}

/* Fetch contribution calendar day counts for a year range (inclusive) */
export async function getContributionDates(
  login: string,
  startingYear?: number
): Promise<DayCount> {
  const now = new Date();
  const thisYear = now.getUTCFullYear();
  const startYear = startingYear ?? (await getUserCreatedYear(login));

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const contributions: DayCount = {};
  for (let year = startYear; year <= thisYear; year++) {
    const from = `${year}-01-01T00:00:00Z`;
    // include tomorrow for the current year (mirrors PHP's "tomorrow if already contributed")
    const to =
      year === thisYear
        ? addDaysUTC(ymd(now), 1) + "T23:59:59Z"
        : `${year}-12-31T23:59:59Z`;

    const resp = await gh<{
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
            };
          };
        } | null;
      };
    }>(query, { login, from, to });

    const weeks = resp.data.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];
    for (const w of weeks) {
      for (const day of w.contributionDays) {
        // Store only up to today; include tomorrow if count > 0
        const today = ymd(new Date());
        const isTomorrow = day.date === addDaysUTC(today, 1);
        if (day.date <= today || (isTomorrow && day.contributionCount > 0)) {
          contributions[day.date] = day.contributionCount;
        }
      }
    }
  }

  return Object.fromEntries(Object.entries(contributions).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/* Daily streak logic (ported from PHP getContributionStats) */
export function getDailyContributionStats(
  contributions: DayCount,
  excludedDays: string[] = []
): StreakStats {
  const dates = Object.keys(contributions);
  if (dates.length === 0) throw new Error("No contributions found.");

  const today = dates[dates.length - 1];
  const first = dates[0];

  const stats: StreakStats = {
    mode: "daily",
    totalContributions: 0,
    firstContribution: "",
    longestStreak: { start: first, end: first, length: 0 },
    currentStreak: { start: first, end: first, length: 0 },
    excludedDays,
  };

  for (const date of dates) {
    const count = contributions[date];
    stats.totalContributions += count;

    if (count > 0 || (stats.currentStreak.length > 0 && isExcludedDay(date, excludedDays))) {
      stats.currentStreak.length += 1;
      stats.currentStreak.end = date;
      if (stats.currentStreak.length === 1) {
        stats.currentStreak.start = date;
      }
      if (!stats.firstContribution) {
        // Note: this will only be set when first entering the streak branch (i.e., first non-zero day)
        stats.firstContribution = date;
      }
      if (stats.currentStreak.length > stats.longestStreak.length) {
        stats.longestStreak = { ...stats.currentStreak };
      }
    } else if (date !== today) {
      // reset streak but not for "today"
      stats.currentStreak = { start: today, end: today, length: 0 };
    }
  }

  return stats;
}

/* Weekly streak logic (ported from PHP getWeeklyContributionStats) */
export function getWeeklyContributionStats(contributions: DayCount): StreakStats {
  const dates = Object.keys(contributions);
  if (dates.length === 0) throw new Error("No contributions found.");

  const thisWeek = getPreviousSunday(dates[dates.length - 1]);
  const firstWeek = getPreviousSunday(dates[0]);

  const stats: StreakStats = {
    mode: "weekly",
    totalContributions: 0,
    firstContribution: "",
    longestStreak: { start: firstWeek, end: firstWeek, length: 0 },
    currentStreak: { start: firstWeek, end: firstWeek, length: 0 },
  };

  // aggregate by week (sum counts per Sunday bucket)
  const weeks: Record<string, number> = {};
  for (const date of dates) {
    const count = contributions[date];
    const week = getPreviousSunday(date);
    weeks[week] = (weeks[week] ?? 0) + (count > 0 ? count : 0);
    if (!stats.firstContribution && count > 0) {
      stats.firstContribution = date;
    }
  }

  const weekKeys = Object.keys(weeks).sort();
  for (const week of weekKeys) {
    const count = weeks[week];
    stats.totalContributions += count;

    if (count > 0) {
      stats.currentStreak.length += 1;
      stats.currentStreak.end = week;
      if (stats.currentStreak.length === 1) {
        stats.currentStreak.start = week;
      }
      if (stats.currentStreak.length > stats.longestStreak.length) {
        stats.longestStreak = { ...stats.currentStreak };
      }
    } else if (week !== thisWeek) {
      // reset streak but not for "this week"
      stats.currentStreak = { start: thisWeek, end: thisWeek, length: 0 };
    }
  }

  return stats;
}

/* Public API: compute streaks for a user and return only streak objects */
export async function computeStreaksForUser(params: {
  user: string;
  mode?: "daily" | "weekly";
  excludeDays?: string; // comma-separated, e.g., "Sun,Sat"
  startingYear?: number;
}): Promise<{ currentStreak: Streak; longestStreak: Streak }> {
  const { user, mode = "daily", excludeDays, startingYear } = params;

  const contributions = await getContributionDates(user, startingYear);

  if (mode === "weekly") {
    const stats = getWeeklyContributionStats(contributions);
    return { currentStreak: stats.currentStreak, longestStreak: stats.longestStreak };
  }

  const excluded = normalizeDays((excludeDays ?? "").split(","));
  const stats = getDailyContributionStats(contributions, excluded);
  return { currentStreak: stats.currentStreak, longestStreak: stats.longestStreak };
}