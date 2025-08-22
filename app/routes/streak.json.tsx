import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { computeStreaksForUser } from "~/utils/github.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const user = url.searchParams.get("user") || "";
  const mode = (url.searchParams.get("mode") as "daily" | "weekly") || "daily";
  const excludeDays = url.searchParams.get("exclude_days") || "";
  const startingYearParam = url.searchParams.get("starting_year");
  const startingYear = startingYearParam ? Number(startingYearParam) : undefined;

  if (!user) {
    return json({ error: "Missing ?user" }, { status: 400 });
  }

  try {
    const result = await computeStreaksForUser({ user, mode, excludeDays, startingYear });
    // Only return streaks as requested
    return json(result, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch (e: any) {
    return json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}