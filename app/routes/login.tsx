"use client"

import type { ActionFunction } from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { json, redirect,useEffect } from "@remix-run/node"
import { supabase } from "~/utils/supabase.server"
import { getUserSession } from "~/utils/session.server"
import { logger } from "~/utils/logger.server"
import { Github } from "lucide-react"

export const loader = async ({ request }: { request: Request }) => {
  logger.debug("Login page loader called")
  const user = await getUserSession(request)
  if (user) {
    logger.debug("User already logged in, redirecting to dashboard", { userId: user.id })
    return redirect("/dashboard")
  }
  return null
}

export const action: ActionFunction = async ({ request }) => {
  logger.info("Starting GitHub authentication")

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "read:org",
        redirectTo: `${process.env.PUBLIC_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      logger.error("Supabase OAuth error", { error })
      return json({ error: "Authentication failed" }, { status: 400 })
    }

    logger.info("OAuth URL generated successfully")
    return json({ url: data.url })
  } catch (error) {
    logger.error("Unexpected error during authentication", { error })
    return json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export default function Login() {
  const actionData = useActionData()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  // Use useEffect to handle client-side redirect
  useEffect(() => {
    if (actionData?.url) {
      logger.debug("Redirecting to GitHub OAuth URL", { url: actionData.url })
      window.location.href = actionData.url
    }
  }, [actionData])

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

