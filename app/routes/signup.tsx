import { useEffect, useState } from "react"
import type { ActionFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useActionData, Form, Link } from "@remix-run/react"
import { createServerClient, parse, serialize } from "@supabase/ssr"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import iconImage from "~/assets/bashers.png"
import { Eye, EyeOff } from "lucide-react"

export const action: ActionFunction = async ({ request }) => {
  const response = new Response()

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get: (key: string) => parse(request.headers.get("Cookie") || "")[key],
      set: (key: any, value: any, options: any) => {
        response.headers.append("Set-Cookie", serialize(key, value, options))
      },
      remove: (key: any, options: any) => {
        response.headers.append("Set-Cookie", serialize(key, "", options))
      },
    },
  })

  const formData = await request.formData()
  const email = formData.get("email")
  const password = formData.get("password")
  const confirmPassword = formData.get("confirmPassword")
  const username = formData.get("username")
  const acceptTerms = formData.get("acceptTerms")

  // Validation
  if (!email || !password || !confirmPassword || !username) {
    return json({ error: "All fields are required" })
  }

  if (password !== confirmPassword) {
    return json({ error: "Passwords do not match" })
  }

  if (!acceptTerms) {
    return json({ error: "You must accept the terms and conditions" })
  }

  // Create user
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: email as string,
    password: password as string,
    options: {
      data: {
        username: username as string,
      },
    },
  })

  if (signUpError) {
    return json({ error: signUpError.message })
  }

  if (data?.user) {
    // Create profile in profiles table
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        username: username as string,
        email: email as string,
      },
    ])

    if (profileError) {
      return json({ error: profileError.message })
    }

    return redirect("/", {
      headers: response.headers,
    })
  }

  return json({ error: "An unexpected error occurred" })
}

export default function SignUp() {
  const actionData = useActionData<typeof action>()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (actionData?.error) {
      setIsLoading(false)
    }
  }, [actionData])

  return (
    <div className="min-h-screen bg-[#15596d] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center">
          <div className="space-y-2 relative w-32 h-32">
            <img src={iconImage || "/placeholder.svg"} alt="SportsDot Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-medium text-center text-[#27bffe]">Create Account</h2>

          <Form method="post" onSubmit={() => setIsLoading(true)} className="space-y-6">
            {actionData?.error && (
              <div
                className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg relative"
                role="alert"
              >
                <span className="block sm:inline">{actionData.error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="Choose a username"
                  className="h-12 rounded-2xl bg-background dark:bg-[#4A4A62]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  className="h-12 rounded-2xl bg-background dark:bg-[#4A4A62]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Create a password"
                    className="h-12 rounded-2xl bg-background dark:bg-[#4A4A62] pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Confirm your password"
                    className="h-12 rounded-2xl bg-background dark:bg-[#4A4A62] pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="acceptTerms" name="acceptTerms" className="border-[#27bffe]" required />
              <Label htmlFor="acceptTerms" className="text-sm font-medium leading-none cursor-pointer">
                I accept the{" "}
                <Link to="/terms" className="text-[#27bffe] hover:text-[#27bffe]/90">
                  terms and conditions
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium bg-[#001435] hover:bg-[#001435]/90 text-white rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center space-x-1">
              <span className="text-sm text-muted-foreground">Already have an account?</span>
              <Link to="/login" className="text-sm font-medium text-[#27bffe] hover:text-[#27bffe]/90">
                Login
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}

