import { json, type ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { supabase } from "~/utils/supabase.server"
import type { Member } from "~/types/database"

export const loader = async () => {
  const { data: members } = await supabase.from("members").select("*").order("name")

  return json({ members })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const memberId = formData.get("memberId")
  const points = formData.get("points")
  const action = formData.get("action")

  if (!memberId || !points || !action) {
    return json({ error: "Missing required fields" })
  }

  const currentPoints = await supabase.from("members").select("points").eq("id", memberId).single()

  const newPoints =
    action === "add"
      ? (currentPoints.data?.points || 0) + Number(points)
      : (currentPoints.data?.points || 0) - Number(points)

  const { error } = await supabase.from("members").update({ points: newPoints }).eq("id", memberId)

  if (error) {
    return json({ error: error.message })
  }

  return json({ success: true })
}

export default function ManagePoints() {
  const { members } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Manage Points</h1>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">
              Select Member
            </label>
            <select
              id="memberId"
              name="memberId"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select a member...</option>
              {members?.map((member: Member) => (
                <option key={member.id} value={member.id}>
                  {member.name} (Current: {member.points} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700">
              Points
            </label>
            <input
              type="number"
              id="points"
              name="points"
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              name="action"
              value="add"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add Points
            </button>
            <button
              type="submit"
              name="action"
              value="subtract"
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Subtract Points
            </button>
          </div>
        </Form>

        {actionData?.error && <div className="mt-4 text-red-600">{actionData.error}</div>}
        {actionData?.success && <div className="mt-4 text-green-600">Points updated successfully!</div>}
      </div>
    </div>
  )
}

