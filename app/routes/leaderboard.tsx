import { json } from "@remix-run/node"
import { useLoaderData, useRevalidator } from "@remix-run/react"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { Member } from "~/types/database"

export const loader = async () => {
  return json({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  })
}

export default function Leaderboard() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = useLoaderData<typeof loader>()
  const [members, setMembers] = useState<Member[]>([])
  const revalidator = useRevalidator()

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase.from("members").select("*").order("points", { ascending: false })

      if (data) {
        setMembers(data)
      }
    }

    fetchMembers()

    // Set up real-time subscription
    const channel = supabase
      .channel("members")
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, () => {
        revalidator.revalidate()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, revalidator])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Leaderboard</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {members.map((member, index) => (
            <div key={member.id} className="flex items-center p-6 hover:bg-gray-50">
              <div className="flex-shrink-0 w-12 text-2xl font-bold text-gray-500">#{index + 1}</div>
              <div className="flex-shrink-0 h-12 w-12">
                {member.avatar_url ? (
                  <img
                    className="h-12 w-12 rounded-full"
                    src={member.avatar_url || "/placeholder.svg"}
                    alt={member.name}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-medium text-gray-600">{member.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="text-lg font-medium text-gray-900">{member.name}</div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-semibold text-indigo-600">{member.points} pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

