import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { supabase } from "./supabase.server"
import { logger } from "./logger.server"

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "sb_auth",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cr3t"], // Replace with your actual secret
    secure: process.env.NODE_ENV === "production",
  },
})

export async function createUserSession(accessToken: string, refreshToken: string, redirectTo: string) {
  logger.info("Creating user session", { redirectTo })
  const session = await sessionStorage.getSession()
  session.set("accessToken", accessToken)
  session.set("refreshToken", refreshToken)

  logger.debug("Session created successfully")
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  })
}

export async function getUserSession(request: Request) {
  logger.debug("Getting user session from request")
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))
  const accessToken = session.get("accessToken")

  if (!accessToken) {
    logger.debug("No access token found in session")
    return null
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken)

    if (error) {
      logger.error("Error getting user from Supabase", { error })
      return null
    }

    if (!user) {
      logger.debug("No user found with access token")
      return null
    }

    logger.debug("User session retrieved successfully", { userId: user.id })
    return user
  } catch (error) {
    logger.error("Unexpected error in getUserSession", { error })
    return null
  }
}

export async function requireUser(request: Request) {
  logger.debug("Requiring user session")
  const user = await getUserSession(request)
  if (!user) {
    logger.warn("No user session found, redirecting to login")
    throw redirect("/login")
  }
  logger.debug("User session verified", { userId: user.id })
  return user
}

export async function logout(request: Request) {
  logger.info("Logging out user")
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  })
}

