import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { createServerSupabase } from "~/utils/supabase.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return redirect("/login")
  }
 
  return json(
    {
      user: session.user,
    },
    {
      headers: response.headers,
    },
  )



   


}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.user_metadata.full_name || user.email}!</h1>
        <p className="text-gray-600">You are successfully logged in as a member of the byte-bash-blitz organization.</p>
      </div>
    </div>
  )
}

