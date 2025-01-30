import { json, type ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import { supabase } from "~/utils/supabase.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const name = formData.get("name")
  const avatarUrl = formData.get("avatarUrl")

  if (!name) {
    return json({ error: "Name is required" })
  }

  const { error } = await supabase.from("members").insert([
    {
      name: name.toString(),
      avatar_url: avatarUrl?.toString(),
      points: 0,
    },
  ])

  if (error) {
    return json({ error: error.message })
  }

  return json({ success: true })
}

export default function AddMember() {
  const actionData = useActionData<typeof action>()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Add New Member</h1>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">
              Avatar URL (optional)
            </label>
            <input
              type="url"
              id="avatarUrl"
              name="avatarUrl"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add Member
          </button>
        </Form>

        {actionData?.error && <div className="mt-4 text-red-600">{actionData.error}</div>}
        {actionData?.success && <div className="mt-4 text-green-600">Member added successfully!</div>}
      </div>
    </div>
  )
}

