import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { requireUser } from "~/utils/session.server"
import { logger } from "~/utils/logger.server"

export const loader = async ({ request }: { request: Request }) => {
  logger.debug("Dashboard loader called")

  try {
    const user = await requireUser(request)
    logger.info("User loaded dashboard", {
      userId: user.id,
      email: user.email,
    })
    return json({ user })
  } catch (error) {
    logger.error("Error loading dashboard", { error })
    throw error
  }
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.user_metadata.full_name || user.email}!</h1>
        <p className="text-gray-600">You are successfully logged in as a member of the byte-bash-blitz organization.</p>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(
              {
                userId: user.id,
                email: user.email,
                metadata: user.user_metadata,
                lastSignIn: user.last_sign_in_at,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  )
}

