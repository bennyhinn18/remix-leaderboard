import type { LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { supabase } from "~/utils/supabase.server"
import { createUserSession } from "~/utils/session.server"
import { logger } from "~/utils/logger.server"

async function checkOrgMembership(accessToken: string) {
  logger.debug("Checking organization membership")

  try {
    const response = await fetch("https://api.github.com/user/orgs", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      logger.error("GitHub API error", {
        status: response.status,
        statusText: response.statusText,
      })
      return false
    }

    const orgs = await response.json()
    logger.debug("Retrieved organizations", {
      count: orgs.length,
      orgs: orgs.map((org: any) => org.login),
    })

    const isMember = orgs.some((org: any) => org.login === "byte-bash-blitz")
    logger.info("Organization membership check complete", { isMember })
    return isMember
  } catch (error) {
    logger.error("Error checking organization membership", { error })
    return false
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  logger.info("Auth callback initiated")
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  if (!code) {
    logger.warn("No code parameter found in callback URL")
    return redirect("/login")
  }

  try {
    logger.debug("Exchanging code for session")
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !session) {
      logger.error("Session exchange failed", { error })
      return redirect("/login?error=auth")
    }

    logger.debug("Session obtained successfully", {
      userId: session.user.id,
      hasProviderToken: !!session.provider_token,
    })

    // Check organization membership
    const isMember = await checkOrgMembership(session.provider_token || "")

    if (!isMember) {
      logger.warn("User not in required organization")
      await supabase.auth.signOut()
      return redirect("/login?error=not-member")
    }

    logger.info("Authentication successful, creating session")
    return createUserSession(session.access_token, session.refresh_token, "/dashboard")
  } catch (error) {
    logger.error("Unexpected error in auth callback", { error })
    return redirect("/login?error=unexpected")
  }
}

export default function AuthCallback() {
  return <div>Processing authentication...</div>
}

