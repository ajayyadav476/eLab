"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, usePathname } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"
import { BookOpen, FileText, Bell, Folder, Home } from "lucide-react"

export default function LabLayout({ children }) {
  const { labId } = useParams()
  const pathname = usePathname()
  const [lab, setLab] = useState(null)

  useEffect(() => {
    if (!labId) return
    loadLab()
  }, [labId])

  async function loadLab() {
    const { data } = await supabase
      .from("labs")
      .select(`
        course_name,
        professor:users!labs_professor_fkey (
          name
        )
      `)
      .eq("id", labId)
      .single()

    setLab(data)
  }

  function tabStyle(path) {
    const active = pathname.includes(path)

    return `
      flex-1 flex items-center justify-center gap-2 py-3 font-medium transition
      ${active
        ? "bg-white text-blue-700 border-b-4 border-blue-600"
        : "bg-blue-100 text-gray-700 hover:bg-blue-200"}
    `
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-300 to-green-400 px-10 py-6 border-b flex justify-between items-center shadow-sm">

        <div>
          <h1 className="text-3xl font-bold text-black">
            {lab?.course_name || "Loading..."}
          </h1>

          <p className="text-black/80 mt-1">
            Professor: Dr. {lab?.professor?.name || "..."}
          </p>
        </div>

        <Link href="/student/dashboard">
          <button className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer active:scale-95">
            <Home size={18} />
            Home
          </button>
        </Link>

      </div>

      {/* TABS */}
      <div className="flex w-full border-b bg-blue-100">

        <Link
          href={`/student/labs/${labId}/assignments`}
          className={tabStyle("assignments")}
        >
          <FileText size={18} />
          Assignments
        </Link>

        <Link
          href={`/student/labs/${labId}/notes`}
          className={tabStyle("notes")}
        >
          <BookOpen size={18} />
          Study Material
        </Link>

        <Link
          href={`/student/labs/${labId}/notices`}
          className={tabStyle("notices")}
        >
          <Bell size={18} />
          Notices
        </Link>

        <Link
          href={`/student/labs/${labId}/mystuff`}
          className={tabStyle("mystuff")}
        >
          <Folder size={18} />
          My Stuff
        </Link>

      </div>

      {/* PAGE CONTENT */}
      <div className="p-10">
        {children}
      </div>

    </div>
  )
}