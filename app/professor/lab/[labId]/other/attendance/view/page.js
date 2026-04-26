"use client"
import * as XLSX from "xlsx"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../../../../../lib/supabaseClient"
import { Download } from "lucide-react"

export default function ViewAttendance() {

  const { labId } = useParams()

  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [records, setRecords] = useState({})


  useEffect(() => {
    loadData()
  }, [])

  function getRoll(email) {
    return email.split("@")[0]
  }

async function downloadAttendance() {
  if (!students.length || !sessions.length) return

  const data = students.map((stu) => {
    const row = {
      "Roll No.": getRoll(stu.email),
      Name: stu.name
    }

    // session columns (same as UI)
    sessions.forEach((s) => {
      const status = records[stu.id]?.[s.id]
      row[formatDate(s.date)] = status === "present" ? "P" : "A"
    })

    // total + percentage
    const stats = getStats(stu.id)
    row["Total"] = `${stats.present}/${stats.total}`
    row["Present %"] = `${stats.percent}%`

    return row
  })

  // create sheet
  const ws = XLSX.utils.json_to_sheet(data)

  // auto width
  const colWidths = Object.keys(data[0]).map((key) => {
    let maxLength = key.length
    data.forEach(row => {
      const val = row[key] ? row[key].toString() : ""
      if (val.length > maxLength) maxLength = val.length
    })
    return { wch: maxLength + 2 }
  })
  ws["!cols"] = colWidths

  // workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Attendance")

  // download (no file-saver)
  const file = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const blob = new Blob([file], { type: "application/octet-stream" })
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url

   const { data: lab } = await supabase
  .from("labs")
  .select("batch")
  .eq("id", labId)
  .single()

const batchName = lab?.batch || "Batch"
a.download = `Attendance(${batchName}).xlsx`
  a.click()

  window.URL.revokeObjectURL(url)
}

  async function loadData() {

    // 1️⃣ students
    const { data: members } = await supabase
      .from("lab_members")
      .select(`user:users(id,name,email)`)
      .eq("lab_id", labId)
      .eq("role", "student")

    const studentList = (members || []).map((m) => m.user)

    // sort by roll
    studentList.sort((a, b) =>
      getRoll(a.email).localeCompare(getRoll(b.email))
    )

    setStudents(studentList)

    // 2️⃣ sessions
    const { data: sessionsData } = await supabase
      .from("attendance_sessions")
      .select("*")
      .eq("lab_id", labId)
      .order("date", { ascending: true })

    setSessions(sessionsData || [])

    // 3️⃣ records
    const { data: rec } = await supabase
      .from("attendance_records")
      .select("*")

    const map = {}

    rec.forEach((r) => {
      if (!map[r.student_id]) map[r.student_id] = {}
      map[r.student_id][r.session_id] = r.status
    })

    setRecords(map)
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short"
    })
  }

  function getStats(studentId) {

    let present = 0

    sessions.forEach((s) => {
      if (records[studentId]?.[s.id] === "present") {
        present++
      }
    })

    const total = sessions.length
    const percent = total ? Math.round((present / total) * 100) : 0

    return { present, total, percent }
  }

  function getColor(percent) {
    if (percent === 0) return "bg-red-500"
    if (percent < 50) return "bg-red-300"
    if (percent < 60) return "bg-orange-400"
    if (percent < 75) return "bg-yellow-400"
    return "bg-green-500"
  }

  return (

    <div className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold text-purple-700">
          View Attendance
        </h1>

        <div className="flex items-center gap-4">

          <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm">
            {sessions.length} Sessions
          </span>

          <button
  onClick={downloadAttendance}
  className="flex items-center gap-2 border px-3 py-1 rounded hover:bg-gray-500 text-gray-700 transition transform active:scale-95 cursor-pointer"
>
  <Download size={18} />
</button>

        </div>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white border rounded-xl">

        <div className="min-w-[900px]">

          {/* HEADER ROW */}
          <div className="grid grid-cols-[120px_180px_repeat(auto-fit,minmax(80px,1fr))_140px_140px] bg-gray-100 px-4 py-3 text-sm font-semibold text-purple-700">

            <div>Roll No.</div>
            <div>Name</div>

            {sessions.map((s) => (
              <div key={s.id} className="text-center">
                {formatDate(s.date)}
              </div>
            ))}

            <div className="text-center">Total</div>
            <div className="text-center">Present %</div>

          </div>

          {/* ROWS */}
          {students.map((stu) => {

            const stats = getStats(stu.id)

            return (

              <div
                key={stu.id}
                className="grid grid-cols-[120px_180px_repeat(auto-fit,minmax(80px,1fr))_140px_140px] px-4 py-3 border-t items-center text-sm text-gray-700"
              >

                <div>{getRoll(stu.email)}</div>

                <div className="font-medium">{stu.name}</div>

                {/* SESSION STATUS */}
                {sessions.map((s) => {

                  const st = records[stu.id]?.[s.id]

                  return (
                    <div key={s.id} className="flex justify-center">
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${
                          st === "present"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {st === "present" ? "P" : "A"}
                      </span>
                    </div>
                  )
                })}

                {/* TOTAL */}
                <div className="text-center">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {stats.present}/{stats.total}
                  </span>
                </div>

                {/* % BAR */}
                <div className="flex flex-col items-center w-full">

                {/* Percentage (centered) */}
                <span className="text-sm font-medium text-center mb-1">
                    {stats.percent}%
                </span>

                {/* Bar */}
                <div className="w-20 bg-gray-200 h-2 rounded-full">
                    <div
                    className={`${getColor(stats.percent)} h-2 rounded-full`}
                    style={{ width: `${stats.percent}%` }}
                    />
                </div>

                </div>

              </div>

            )

          })}

        </div>

      </div>

    </div>

  )

}