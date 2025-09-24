import { createSupabaseServerClient } from '~/utils/supabase.server';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createSupabaseServerClient(request);

  const {
    data: { user },
  } = await supabase.client.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const username = user?.user_metadata.user_name;

  return redirect(`/profile/${username}`);
};
