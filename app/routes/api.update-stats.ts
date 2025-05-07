import { json, type ActionFunctionArgs } from "@remix-run/node";
import { updateMemberStats } from "~/utils/update-stats.server";

export async function action({ request }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  const response = new Response();
  // Check API token
  const authHeader = request.headers.get("Authorization");
  const expectedToken = process.env.UPDATE_TOKEN;
  
  if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Update stats
  try {
    await updateMemberStats(request, response);
    return json({ success: true });
  } catch (error) {
    console.error("Error updating stats:", error);
    return json({ error: "Failed to update stats" }, { status: 500 });
  }
}