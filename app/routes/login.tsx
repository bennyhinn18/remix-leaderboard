import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { Github } from "lucide-react"
import { createServerSupabase } from "~/utils/supabase.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    return redirect("/dashboard")
  }

  return json({}, { headers: response.headers })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.PUBLIC_URL || "http://localhost:3000"}/auth/callback`,
      scopes: "read:org",
    },
  })

  if (error) {
    return json({ error: "Authentication failed" }, { status: 400 })
  }

  return redirect(data.url, {
    headers: response.headers,
  })
}

export default function Login() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to access your account</p>
        </div>
        <Form method="post" className="mt-8 space-y-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Github className="mr-2 h-4 w-4" />
            {isSubmitting ? "Connecting..." : "Continue with GitHub"}
          </button>
          {actionData?.error && <p className="text-red-500 text-center">{actionData.error}</p>}
          <p className="mt-2 text-center text-sm text-gray-600">
            Only members of byte-bash-blitz organization can access this application
          </p>
        </Form>
      </div>
    </div>
  )
}

