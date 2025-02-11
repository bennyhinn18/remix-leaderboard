import type { LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { userInfo } from "node:os"
import { createServerSupabase } from "~/utils/supabase.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  return json(
    {
      user: user,
    },
    {
      headers: response.headers,
    },
  )



   


}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.user_metadata.full_name || user.email}!</h1>
        <p className="text-gray-600">You are successfully logged in as a member of the byte-bash-blitz organization.</p>
      </div>
    </div>
  )
}

