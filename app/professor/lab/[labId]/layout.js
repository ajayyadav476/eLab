"use client"

import { useEffect, useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"

export default function LabLayout({ children }) {

  const { labId } = useParams()
  const router = useRouter()
  const pathname = usePathname()

  const [lab, setLab] = useState(null)

  useEffect(() => {
    loadLab()
  }, [])

  async function loadLab() {

    const { data } = await supabase
      .from("labs")
      .select("*")
      .eq("id", labId)
      .single()

    setLab(data)
  }

  const tabs = [
    { name: "Assignments", path: `/professor/lab/${labId}/assignments` },
    { name: "Study Material", path: `/professor/lab/${labId}/notes` },
    { name: "Notices", path: `/professor/lab/${labId}/notices` },
    { name: "Submissions", path: `/professor/lab/${labId}/submissions` },
    { name: "Members", path: `/professor/lab/${labId}/students` },
    { name: "Other Stuff", path: `/professor/lab/${labId}/other` },
  ]

  return (

    <div className="min-h-screen bg-purple-50">

      {/* Header */}

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 flex justify-between items-center">

        <div>

          <h1 className="text-white text-lg font-bold">
            {lab?.course_name}
          </h1>

          <div className="flex gap-2 mt-2 text-xs">

            <span className="bg-white/20 px-3 py-1 rounded-full text-white">
              {lab?.course_code}
            </span>

            <span className="bg-white/20 px-3 py-1 rounded-full text-white">
              Batch: {lab?.batch}
            </span>

            <span className="bg-white/20 px-3 py-1 rounded-full text-white">
              Lab Code: {lab?.lab_code}
            </span>

          </div>

        </div>

        <button
          onClick={() => router.push("/professor")}
          className="bg-white text-purple-600 px-4 py-2 rounded font-semibold transition transform hover:scale-102 active:scale-95 cursor-pointer"
        >
          ← Back to Dashboard
        </button>

      </div>

      {/* Tabs */}

      <div className="bg-white flex w-full border-b">

  {tabs.map((tab) => {

    const active = pathname === tab.path

    return (
      <div
        key={tab.name}
        onClick={() => router.push(tab.path)}
        className={`flex-1 text-center py-3 cursor-pointer text-sm transition transform active:scale-95 ${
          active
            ? "text-purple-600 border-b-2 border-purple-600 font-semibold"
            : "text-gray-600"
        }`}
      >
          {tab.name}
        </div>
      )
      
    })}
  
        </div>
  
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
  
      </div>
  
    )
  }
