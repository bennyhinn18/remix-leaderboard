import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { requireUser } from '~/utils/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

export default function ProtectedLayout() {
  return <Outlet />;
}
