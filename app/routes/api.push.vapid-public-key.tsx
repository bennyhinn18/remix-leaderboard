import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

// This would come from environment variables in a real application
// You would generate VAPID keys using the web-push library
const VAPID_PUBLIC_KEY =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

export async function loader({ request }: LoaderFunctionArgs) {
  return json({ publicKey: VAPID_PUBLIC_KEY });
}
