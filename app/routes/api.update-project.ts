import { json } from "@remix-run/node";
import { createServerSupabase } from "~/utils/supabase.server";

import type { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = createServerSupabase(request, response);

  const formData = await request.json();
  const { projectId, memberName, status } = formData;

  const { error } = await supabase
    .from("projects")
    .update({
      member_name: memberName,
      status: status,
    })
    .eq("id", projectId);

  if (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }

  return json({ success: true });
}