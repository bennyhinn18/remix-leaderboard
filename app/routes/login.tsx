import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useNavigation,useSearchParams } from "@remix-run/react"
import { motion } from "framer-motion"
import { AlertCircle, Github } from "lucide-react"
import { createServerSupabase } from "~/utils/supabase.server"

export const loader = async ({ request}: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    return redirect("/leaderboard")
  }
  return null
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createServerSupabase(request, response)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.PUBLIC_URL || "https://terminal.bytebashblitz.org"}/auth/callback`,
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
const errorMessages = {
  "no-code": "Authentication code not received",
  "no-token": "Could not retrieve access token",
  'not-member': "Oops! Looks like you're not in our cool kids club.",
  unknown: "An unknown error occurred",
}

export default function Login() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const [searchParams] = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4"
          >
            <Github className="w-12 h-12 text-blue-400" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Welcome to ByteBash Terminal
          </h1>
          <p className="text-gray-400 mt-2">Sign in with your GitHub account to continue</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMessages[error as keyof typeof errorMessages] || "An error occurred"}</p>
          </motion.div>
        )}
        <Form method="post" className="mt-8 space-y-6">
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-3 font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
          >
            <Github className="mr-2 h-4 w-4" />
            {isSubmitting ? "Connecting..." : "Continue with GitHub"}
            </motion.button>
          {actionData?.error && <p className="text-red-500 text-center">{actionData.error}</p>}
        </Form> 
        <p className="mt-6 text-center text-sm text-gray-400">
          Only members of the Byte-Bash-Blitz organization can access this application.
        </p>
      </motion.div>
    </div>
  )
}

