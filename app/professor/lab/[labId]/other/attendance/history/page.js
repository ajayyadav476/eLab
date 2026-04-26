"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../../../../../lib/supabaseClient"

export default function AttendanceHistory() {

  const { labId } = useParams()
  const router = useRouter()

  const [sessions, setSessions] = useState([])

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {

    const { data } = await supabase
      .from("attendance_sessions")
      .select("*")
      .eq("lab_id", labId)
      .order("date", { ascending: false })

    setSessions(data || [])
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  function getDay(d) {
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "long"
    })
  }

  async function deleteSession(id) {

    const confirmDelete = confirm("Delete this session?")

    if (!confirmDelete) return

    await supabase
      .from("attendance_sessions")
      .delete()
      .eq("id", id)

    loadSessions()
  }

  return (

    <div className="max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold text-purple-700">
          Attendance History
        </h1>

        <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm">
          {sessions.length} Sessions
        </span>

      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-4 px-6 py-3 bg-gray-100 text-sm font-semibold text-purple-700">
          <div>Session No.</div>
          <div>Date</div>
          <div>Day</div>
          <div className="text-center">Actions</div>
        </div>

        {/* ROWS */}
        {sessions.map((s, index) => (

          <div
            key={s.id}
            className="grid grid-cols-4 px-6 py-4 border-t items-center"
          >

            {/* SESSION NUMBER */}
            <div>
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-semibold">
                {sessions.length - index}
              </span>
            </div>

            {/* DATE */}
            <div className="font-medium text-gray-800">
              {formatDate(s.date)}
            </div>

            {/* DAY */}
            <div>
              <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm">
                {getDay(s.date)}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-center gap-3">

              {/* EDIT */}
              <button
                onClick={() =>
                  router.push(`/professor/lab/${labId}/other/attendance/${s.id}`)
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition transform active:scale-95 cursor-pointer"
              >
                Edit
              </button>

              {/* DELETE */}
              <button
                onClick={() => deleteSession(s.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition transform active:scale-95 cursor-pointer"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}