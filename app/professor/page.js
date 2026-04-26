"use client"
import { LayoutDashboard, PlusCircle, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "../../lib/supabaseClient"

export default function ProfessorDashboard() {
  const [labs, setLabs] = useState([])
  const [userName, setUserName] = useState("")

  useEffect(() => {
    loadLabs()
  }, [])

  async function loadLabs() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserName(user.user_metadata?.full_name || "Professor")

    const { data, error } = await supabase
      .from("lab_members")
      .select(`
        lab_id,
        role,
        labs:labs (
          id,
          course_name,
          course_code,
          batch,
          lab_code
        )
      `)
      .eq("user_id", user.id)

    if (error) {
      console.log("ERROR:", error)
      return
    }

    setLabs(data || [])
  }

  const colors = [
    "bg-purple-100",
    "bg-pink-100",
    "bg-green-100",
    "bg-yellow-100",
    "bg-blue-100",
    "bg-red-100"
  ]

  return (
    <div className="flex h-screen bg-blue-50">

      {/* Sidebar */}
<div className="w-56 bg-gradient-to-b from-purple-500 to-pink-600 border-r flex flex-col">
  
  {/* Header */}
  <div className="p-4 border-b">
    <h1 className="text-xl font-semibold text-indigo-600">
      e<span className="text-black">Lab</span>
    </h1>
  </div>

  {/* Menu */}
  <div className="p-3 space-y-2">

    <div className="flex items-center gap-2 px-3 py-2 rounded bg-indigo-100 text-black font-medium cursor-pointer transition transform active:scale-95">
      <LayoutDashboard size={18} />
      Dashboard
    </div>

    <Link href="/professor/create-lab">
      <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-black font-medium transition transform active:scale-95">
        <PlusCircle size={18} />
        Create Lab
      </div>
    </Link>

    <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-black font-medium transition transform active:scale-95">
      <Settings size={18} />
      Settings
    </div>

  </div>

</div>
      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">
            My Labs
          </h2>

          <div className="flex items-center gap-3">
            <span className="text-sm text-white">
              {userName}
            </span>

            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold">
              {userName?.charAt(0)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">

          {labs.length === 0 && (
            <p className="text-gray-600">No labs found</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            {labs.map((item, index) => {
              const lab = item.labs

              if (!lab) return null

              const color = colors[index % colors.length]

              return (
                <Link
                  key={item.lab_id || index}
                  href={`/professor/lab/${lab.id}/assignments`}
                >
                  <div className={`${color} p-4 rounded-xl cursor-pointer hover:shadow-md transition`}>

                    <div className="text-md font-semibold text-gray-800">
                      {lab.course_name}
                    </div>

                    <div className="text-sm text-gray-700 mt-1">
                      {lab.course_code}
                    </div>

                    <div className="text-sm text-gray-700">
                      Batch: {lab.batch}
                    </div>

                    <div className="border-t mt-3 pt-2 text-sm text-gray-700">
                      Lab Code:{" "}
                      <span className="font-medium">
                        {lab.lab_code}
                      </span>
                    </div>

                    {/* TA badge */}
                    {item.role === "ta" && (
                      <span className="inline-block mt-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        TA
                      </span>
                    )}

                  </div>
                </Link>
              )
            })}

          </div>
        </div>
      </div>
    </div>
  )
}