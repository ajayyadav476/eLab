"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../../../../lib/supabaseClient"

export default function AttendancePage() {

  const { labId } = useParams()

  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [sessionId, setSessionId] = useState(null)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    initAttendance()
  }, [])

  function getRoll(email) {
    return email.split("@")[0]
  }

  async function initAttendance() {

    // 1️⃣ Get or create session

    let { data: session } = await supabase
      .from("attendance_sessions")
      .select("*")
      .eq("lab_id", labId)
      .eq("date", today)
      .single()

    if (!session) {
      const { data } = await supabase
        .from("attendance_sessions")
        .insert([{ lab_id: labId, date: today }])
        .select()
        .single()

      session = data
    }

    setSessionId(session.id)

    // 2️⃣ Get students

    const { data: members } = await supabase
      .from("lab_members")
      .select(`
        user:users(id, name, email)
      `)
      .eq("lab_id", labId)
      .eq("role", "student")

    const studentsList = members.map((m) => m.user)

    setStudents(studentsList)

    // 3️⃣ Load existing attendance

    const { data: records } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("session_id", session.id)

    const map = {}

    records.forEach((r) => {
      map[r.student_id] = r.status
    })

    setAttendance(map)
  }

  function mark(studentId, status) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status
    }))
  }

  async function saveAttendance() {

    const records = students.map((s) => ({
      session_id: sessionId,
      student_id: s.id,
      status: attendance[s.id] || "absent"
    }))

    const { error } = await supabase
      .from("attendance_records")
      .upsert(records, {
        onConflict: "session_id,student_id"
      })

    if (!error) {
      alert("Attendance saved")
    }
  }

  return (

    <div>

      <h2 className="text-lg font-bold mb-6 text-gray-800">
        Attendance ({today})
      </h2>

      <div className="bg-white border rounded-xl overflow-hidden">

        {/* Header */}

        <div className="grid grid-cols-4 bg-purple-50 p-3 text-sm font-semibold">
          <div>Roll No</div>
          <div>Name</div>
          <div>Present</div>
          <div>Absent</div>
        </div>

        {/* Rows */}

        {students.map((s) => (

          <div
            key={s.id}
            className="grid grid-cols-4 p-3 border-t text-sm items-center"
          >

            <div>{getRoll(s.email)}</div>

            <div>{s.name}</div>

            <div>
              <input
                type="radio"
                checked={attendance[s.id] === "present"}
                onChange={() => mark(s.id, "present")}
              />
            </div>

            <div>
              <input
                type="radio"
                checked={attendance[s.id] === "absent"}
                onChange={() => mark(s.id, "absent")}
              />
            </div>

          </div>

        ))}

      </div>

      {/* Save Button */}

      <button
        onClick={saveAttendance}
        className="mt-6 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
      >
        Save Attendance
      </button>

    </div>

  )

}