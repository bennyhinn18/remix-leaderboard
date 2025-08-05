import type { ActionData, Member } from '~/types/admin';

// Fix for admin.members.add.tsx - add proper ActionData typing
export default function AdminMembersAdd() {
  const { user, allMembers, domains } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  // ... rest of component
}

// Fix for admin.members.bulk-add.tsx - add proper types for validation
interface ValidationResults {
  valid: Array<{ row: number; data: any }>;
  errors: Array<{ row: number; data?: any; message: string }>;
  warnings: Array<{ row: number; data?: any; message: string }>;
}

interface ImportResults {
  successful: any[];
  errors: Array<{ data: any; error: string }>;
}

// Fix for admin.discord-roles.tsx - add proper typing
export default function AdminDiscordRoles() {
  const { user, members, stats } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  // ... rest of component
}

// Fix for admin.members.analytics.tsx - add proper typing
export default function AdminMembersAnalytics() {
  const { user, members, analytics } = useLoaderData<typeof loader>();
  // ... rest of component
}
