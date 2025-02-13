import { createServerSupabase } from "~/utils/supabase.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ request }:LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase(request, response);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const username= user?.user_metadata.user_name;

  return redirect(`/profile/${username}`);

}