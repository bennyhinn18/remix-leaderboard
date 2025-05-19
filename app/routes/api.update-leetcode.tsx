import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createServerSupabase } from "~/utils/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase(request, response);
  
  // Get form data
  const formData = await request.formData();
  const leetcode_username = formData.get("leetcode_username") as string;
  const member_id = formData.get("member_id") as string;
  
  // Validate input
  if (!member_id) {
    return json({ success: false, error: "Member ID is required" }, { status: 400 });
  }
  
  // Update the leetcode_username field
  const { error } = await supabase
    .from("members")
    .update({ leetcode_username })
    .eq("id", member_id);
  
  if (error) {
    console.error("Error updating LeetCode username:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
  
  return json({ success: true });
};
