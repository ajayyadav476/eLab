"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../../../../../lib/supabaseClient"

export default function CreateAttendance() {

  const { labId } = useParams()

  const [students, setStudents] = useState([])
  const [status, setStatus] = useState({})
  const [sessionId, setSessionId] = useState(null)
  const [allMarked, setAllMarked] = useState(false)

  useEffect(() => {
    init()
  }, [])

  function getRoll(email) {
    return email.split("@")[0]
  }

  function getWeekRange() {
    const now = new Date()
    const day = now.getDay()

    const start = new Date(now)
    start.setDate(now.getDate() - day)

    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0]
    }
  }

  async function init() {

    const { start, end } = getWeekRange()

    // ✅ 1️⃣ Get ALL sessions in this week
    const { data: sessions, error } = await supabase
      .from("attendance_sessions")
      .select("*")
      .eq("lab_id", labId)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true })

    if (error) {
      console.log(error)
      alert("Error loading sessions")
      return
    }

    let session = sessions?.[0]

    // ✅ 2️⃣ If no session → create ONE
    if (!session) {

      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert([{ lab_id: labId, date: today }])
        .select()
        .single()

      if (error) {
        alert("Error creating session")
        return
      }

      session = data
    }

    // ✅ 3️⃣ Set session
    setSessionId(session.id)

    // ✅ 4️⃣ Load students
    const { data: members } = await supabase
      .from("lab_members")
      .select(`user:users(id,name,email)`)
      .eq("lab_id", labId)
      .eq("role", "student")

    const list = (members || []).map((m) => m.user)

    setStudents(list)

    // ✅ 5️⃣ Load attendance records
    const { data: records } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("session_id", session.id)

    const map = {}

    records.forEach((r) => {
      map[r.student_id] = r.status
    })

    setStatus(map)

    if (Object.keys(map).length === list.length) {
      setAllMarked(true)
    }
  }

  function mark(id, value) {

    const updated = {
      ...status,
      [id]: value
    }

    setStatus(updated)

    if (Object.keys(updated).length === students.length) {
      setAllMarked(true)
    }
  }

  function markAllAbsent() {

    const updated = {}

    students.forEach((s) => {
      updated[s.id] = "absent"
    })

    setStatus(updated)
    setAllMarked(true)
  }

  async function save() {

    const rows = students.map((s) => ({
      session_id: sessionId,
      student_id: s.id,
      status: status[s.id] || "absent"
    }))

    const { error } = await supabase
      .from("attendance_records")
      .upsert(rows, {
        onConflict: "session_id,student_id"
      })

    if (error) {
      alert("Error saving attendance")
      return
    }

    alert("Attendance Saved")
  }

  // ✅ Split after marking
  const absent = students.filter((s) => status[s.id] === "absent")
  const present = students.filter((s) => status[s.id] === "present")

  const displayList = allMarked ? [...absent, ...present] : students

  return (

    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden">

      {/* TOP STRIP */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">

        <h2 className="text-xl font-bold text-purple-700">
          Take Attendance
        </h2>

        <div className="flex gap-3">

          <button
            onClick={markAllAbsent}
            className="px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-100 transition transform active:scale-95 cursor-pointer"
          >
            Absent All
          </button>

          <button
            onClick={save}
            className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition transform active:scale-95 cursor-pointer"
          >
            Save
          </button>

        </div>

      </div>

      {/* HEADER */}
      <div className="grid grid-cols-4 bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700">
        <div>Roll No.</div>
        <div>Name</div>
        <div className="text-center">Absent</div>
        <div className="text-center">Present</div>
      </div>

      {/* ROWS */}
      {displayList.map((s) => {

        const state = status[s.id]

        return (

          <div
            key={s.id}
            className="grid grid-cols-4 px-6 py-4 items-center border-t hover:bg-gray-50 transition"
          >

            <div className="font-medium text-gray-800">
              {getRoll(s.email)}
            </div>

            <div className="text-gray-700">
              {s.name}
            </div>

            {/* ABSENT */}
            <div className="flex justify-center">
              <button
                onClick={() => mark(s.id, "absent")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition transform active:scale-98 cursor-pointer ${
                  state === "absent"
                    ? "bg-red-500 text-white shadow"
                    : state === "present"
                    ? "bg-gray-200 text-gray-500"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                Absent
              </button>
            </div>

            {/* PRESENT */}
            <div className="flex justify-center">
              <button
                onClick={() => mark(s.id, "present")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition transform active:scale-98 cursor-pointer ${
                  state === "present"
                    ? "bg-green-500 text-white shadow"
                    : state === "absent"
                    ? "bg-gray-200 text-gray-500"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                Present
              </button>
            </div>

          </div>

        )

      })}

    </div>

  )

}