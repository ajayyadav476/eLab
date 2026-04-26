"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { FileText, Clock } from "lucide-react"

export default function AssignmentsPage() {

  const { labId } = useParams()
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    if (!labId) return
    loadAssignments()
  }, [labId])

  async function loadAssignments() {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("assignments")
      .select(`
        id,
        title,
        deadline,
        submissions (
          student_id
        )
      `)
      .eq("lab_id", labId)

    if (error) {
      console.log("ERROR:", error)
      return
    }

    if (!data) return

    const processed = data.map(a => {
      const submitted = a.submissions.some(s => s.student_id === user.id)

      let status = "Pending"
      if (submitted) status = "Submitted"
      else if (new Date(a.deadline) < new Date()) status = "Overdue"

      return { ...a, status }
    })

    setAssignments(processed)
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center mt-20 text-gray-500">
        <FileText size={40} className="mx-auto mb-3 opacity-50" />
        <p>No assignments available</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {assignments.map(a => (

        <Link
          key={a.id}
          href={`/student/labs/${labId}/assignments/${a.id}`}
        >

          <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md hover:-translate-y-1 transition duration-200 cursor-pointer">

            {/* TOP */}
            <div className="flex justify-between items-start">

              <div className="flex items-center gap-3">

                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText size={18} className="text-blue-600" />
                </div>

                <div>
                  <p className="font-semibold text-gray-800 text-lg">
                    {a.title}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Clock size={14} />
                    Due: {new Date(a.deadline).toDateString()}
                  </div>
                </div>

              </div>

              {/* STATUS */}
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${a.status === "Submitted" && "bg-green-100 text-green-700"}
                ${a.status === "Pending" && "bg-yellow-100 text-yellow-700"}
                ${a.status === "Overdue" && "bg-red-100 text-red-700"}
              `}>
                {a.status}
              </span>

            </div>

          </div>

        </Link>

      ))}

    </div>
  )
}