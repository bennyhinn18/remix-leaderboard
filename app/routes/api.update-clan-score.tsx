import { json } from '@remix-run/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const action = async () => {
  const { error } = await supabase.rpc('update_clan_scores');
  if (error) {
    return json({ success: false, message: error.message }, { status: 500 });
  }

  return json({ success: true });
};
