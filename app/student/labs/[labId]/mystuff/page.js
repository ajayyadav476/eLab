"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function MyStuffPage() {

  const { labId } = useParams()

  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percent: 0
  })

  useEffect(() => {
    if (!labId) return
    loadAttendance()
  }, [labId])

  async function loadAttendance() {

    const { data: { user } } = await supabase.auth.getUser()

    const { data: sessions } = await supabase
      .from("attendance_sessions")
      .select("id")
      .eq("lab_id", labId)

    const sessionIds = sessions?.map(s => s.id) || []

    const { data: records } = await supabase
      .from("attendance_records")
      .select("status")
      .eq("student_id", user.id)
      .in("session_id", sessionIds)

    const total = sessionIds.length
    const present = records?.filter(r => r.status === "present").length || 0
    const absent = total - present
    const percent = total ? ((present / total) * 100).toFixed(1) : 0

    setStats({ total, present, absent, percent })
  }

  const isGood = stats.percent >= 75

  return (
    <div className="max-w-6xl mx-auto space-y-8">

            <h1 className="text-3xl font-bold text-center text-gray-800">
                Attendance Report
            </h1>

      {/* TOP CARDS */}
      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Sessions</p>
          <h2 className="text-3xl font-bold text-black mt-2">{stats.total}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Present</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">{stats.present}</h2>
          <p className="text-xs text-gray-500 mt-1">Classes attended</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Absent</p>
          <h2 className="text-3xl font-bold text-red-500 mt-2">{stats.absent}</h2>
          <p className="text-xs text-gray-500 mt-1">Classes missed</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Attendance %</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {stats.percent}%
          </h2>
          <p className="text-xs text-gray-500 mt-1">Min required: 75%</p>
        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-2 gap-6">

        {/* DONUT */}
        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between">

          <div>
            <h3 className="text-lg font-semibold mb-4 text-black">
              Attendance Split
            </h3>

            <div className="space-y-2 text-sm">
              <p className="text-green-600">● Present: {stats.present}</p>
              <p className="text-red-500">● Absent: {stats.absent}</p>
              <p className="text-gray-500">● Total: {stats.total}</p>
            </div>
          </div>

          {/* DONUT GRAPH */}
          <div className="relative w-36 h-36">

            <div
              className="w-full h-full rounded-full"
              style={{
                background: `conic-gradient(
                  #16a34a ${stats.percent}%,
                  #ef4444 ${stats.percent}% 100%
                )`
              }}
            />

            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-black">
                {stats.percent}%
              </span>
            </div>

          </div>

        </div>

        {/* STATUS */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between">

          <h3 className="text-lg font-semibold text-black">
            Status
          </h3>

          <div className="mt-6 space-y-4">

            {/* Status Badge */}
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium
                ${isGood
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}>
                {isGood ? "On Track" : "Low Attendance"}
            </div>

            {/* Percentage Display */}
            <p className="text-2xl font-bold text-gray-800 text-center">
                {stats.percent}%
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-3 rounded">
                <div
                className={`h-3 rounded ${
                    isGood ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: `${stats.percent}%` }}
                />
            </div>

            </div>

        </div>

      </div>

    </div>
  )
}