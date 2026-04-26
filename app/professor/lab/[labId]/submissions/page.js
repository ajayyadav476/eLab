"use client"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "../../../../../lib/supabaseClient"

export default function SubmissionsPage() {

  const { labId } = useParams()
  const router = useRouter()

  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    loadAssignments()
  }, [])
async function downloadExcel() {
  // 1. get all assignments of this lab
  const { data: assignmentsData } = await supabase
    .from("assignments")
    .select("id, max_marks")
    .eq("lab_id", labId)
    .order("deadline")

  if (!assignmentsData) return

  // 2. get all submissions for this lab
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      assignment_id,
      marks,
      users (
        name,
        email
      )
    `)

  if (!submissions) return

  // 3. map assignment index (A1, A2...)
  const assignmentIndex = {}
  assignmentsData.forEach((a, i) => {
    assignmentIndex[a.id] = `A${i + 1}`
  })

  // 4. group by student
  const studentsMap = {}

  submissions.forEach((s) => {
    const roll = s.users.email.split("@")[0]

    if (!studentsMap[roll]) {
      studentsMap[roll] = {
        "Roll No": roll,
        Name: s.users.name,
        total: 0,
        maxTotal: 0
      }
    }

    const col = assignmentIndex[s.assignment_id]

    const marks = s.marks || 0
    const maxMarks =
      assignmentsData.find(a => a.id === s.assignment_id)?.max_marks || 0

    studentsMap[roll][col] = marks
    studentsMap[roll].total += marks
    studentsMap[roll].maxTotal += maxMarks
  })

  // 5. percentage
  const finalData = Object.values(studentsMap).map((s) => {
  const base = {
    "Roll No": s["Roll No"],
    Name: s.Name
  }

  // get assignment columns (A1, A2...)
  const assignmentCols = Object.keys(s)
    .filter(k => k.startsWith("A"))
    .sort()

  assignmentCols.forEach(col => {
    base[col] = s[col]
  })

  // add totals AFTER assignments
  base["Total Marks"] = s.total
  base["Max Marks"] = s.maxTotal

  base["Percentage"] =
    s.maxTotal > 0
      ? ((s.total / s.maxTotal) * 100).toFixed(2) + "%"
      : "0%"

  return base
})

  // 6. convert to sheet
const ws = XLSX.utils.json_to_sheet(finalData)

// ✅ 1. BOLD HEADER
const range = XLSX.utils.decode_range(ws['!ref'])
for (let col = range.s.c; col <= range.e.c; col++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
  if (!ws[cellAddress]) continue

  ws[cellAddress].s = {
    font: { bold: true }
  }
}

// ✅ 2. AUTO COLUMN WIDTH
const colWidths = Object.keys(finalData[0]).map((key) => {
  let maxLength = key.length

  finalData.forEach(row => {
    const value = row[key] ? row[key].toString() : ""
    if (value.length > maxLength) {
      maxLength = value.length
    }
  })

  return { wch: maxLength + 2 }
})

ws['!cols'] = colWidths

const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, "Marks")

  // 7. download
const file = XLSX.write(wb, { bookType: "xlsx", type: "array" })

// get batch
const { data: lab } = await supabase
  .from("labs")
  .select("batch")
  .eq("id", labId)
  .single()

const batchName = lab?.batch || "Batch"

saveAs(
  new Blob([file]),
  `Submissions(${batchName}).xlsx`
)
}
  async function loadAssignments() {

    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("lab_id", labId)
      .order("deadline")

    setAssignments(data || [])
  }

  return (

    <div>

      <div className="flex justify-between items-center mb-6">
  <h2 className="text-lg font-bold text-gray-800">
    Submissions
  </h2>

  <button
    onClick={downloadExcel}
    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 cursor-pointer"
  >
    <Download size={18} />
    Download
  </button>
</div>

      <div className="space-y-4">

        {assignments.map((a) => (

          <div
            key={a.id}
            onClick={() =>
              router.push(`/professor/lab/${labId}/submissions/${a.id}`)
            }
            className="bg-white border border-purple-100 p-4 rounded-xl cursor-pointer hover:shadow-md transition transform active:scale-95"
          >

            <div className="font-semibold text-purple-900">
              {a.title}
            </div>

            <div className="text-sm text-gray-600">
              Max Marks: {a.max_marks}
            </div>

            <div className="text-sm text-gray-600">
              Deadline: {new Date(a.deadline).toLocaleString()}
            </div>

          </div>

        ))}

      </div>

    </div>

  )

}