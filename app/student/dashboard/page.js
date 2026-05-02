"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import StudentSidebar from "../components/StudentSidebar"
import { Search, Plus, LayoutDashboard, Home, Settings } from "lucide-react"

export default function Dashboard() {

  const [labs, setLabs] = useState([])
  const [search, setSearch] = useState("")
  const [labCode, setLabCode] = useState("")

  useEffect(() => {
    loadLabs()
  }, [])

async function loadLabs() {
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  const { data: labsData, error } = await supabase
    .from("lab_members")
    .select(`
      lab_id,
      labs (
        id,
        course_name,
        course_code,
        batch,
        users!labs_professor_fkey (
          name
        )
      )
    `)
    .eq("user_id", user.id)

  console.log(labsData, error)

  setLabs(labsData || [])
}

  async function joinLab() {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: lab } = await supabase
      .from("labs")
      .select("*")
      .eq("lab_code", labCode)
      .single()

    if (!lab) {
      alert("Invalid Lab Code")
      return
    }

    await supabase.from("lab_members").insert([
      {
        lab_id: lab.id,
        user_id: user.id,
        role: "student"
      }
    ])

    setLabCode("")
    loadLabs()
  }

  const filteredLabs = labs.filter((lab) =>
    lab.labs.course_name.toLowerCase().includes(search.toLowerCase()) ||
    lab.labs.course_code.toLowerCase().includes(search.toLowerCase())
  )

  const colors = [
    "bg-purple-100",
    "bg-yellow-100",
    "bg-pink-100",
    "bg-green-100",
    "bg-red-100",
    "bg-orange-100",
    "bg-indigo-200"
  ]

  const menuItems = [
    { label: "Dashboard", icon: <Home size={18} />, link: "/student/dashboard" },
    { label: "Settings", icon: <Settings size={18} />, link: "/student/settings" }
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <StudentSidebar
        items={menuItems.map(item => ({
          ...item,
          icon: <span className="text-white">{item.icon}</span>
        }))}
        bottom={
          <div>
            <p className="text-sm text-white mb-2 font-medium">
              Join Lab
            </p>

            <input
              type="text"
              placeholder="Lab Code"
              value={labCode}
              onChange={(e) => setLabCode(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mb-2 text-black"
            />

            <button
              onClick={joinLab}
              className="w-full bg-white text-green-700 hover:bg-gray-100 py-2 rounded text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
            >
              <Plus size={20} />
              Join Lab
            </button>
          </div>
        }
      />

      {/* Main Area */}
      <div className="flex-1">

        {/* Top Bar */}
        <div className="bg-gradient-to-r from-blue-300 to-green-400 px-8 py-4 flex justify-between items-center border-b">

          {/* Search */}
          <div className="flex items-center gap-2 bg-white/30 backdrop-blur px-4 py-2 rounded-lg shadow-sm">
            <Search size={18} className="text-black" />
            <input
              type="text"
              placeholder="Search labs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-sm text-black placeholder-black/70 bg-transparent"
            />
          </div>

        </div>

        {/* Content */}
        <div className="p-8">

          {/* Title */}
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-700">
              Joined Labs
            </h3>
          </div>

          {/* Lab Cards */}
          <div className="grid grid-cols-3 gap-6">
            {filteredLabs.map((lab, index) => {
              const color = colors[index % colors.length]

              return (
                <Link
                  key={lab.lab_id}
                  href={`/student/labs/${lab.labs.id}`}
                  className="block"
                >
                  <div className={`${color} p-5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200`}>

                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800">
                        {lab.labs.course_name}
                      </h4>

                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        Joined
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm mt-2">
                      {lab.labs.course_code}
                    </p>

                    <p className="text-gray-600 text-sm">
                      Batch: {lab.labs.batch}
                    </p>

                    <p className="text-gray-700 text-sm mt-3">
                      Professor: {lab.labs.users?.name || "—"}
                    </p>

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