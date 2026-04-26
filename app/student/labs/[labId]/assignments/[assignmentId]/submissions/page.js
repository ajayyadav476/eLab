"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function SubmissionsPage() {

  const { assignmentId } = useParams()
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    if (!assignmentId) return
    loadSubmissions()
  }, [assignmentId])

  async function loadSubmissions() {

    const { data } = await supabase
      .from("submissions")
      .select(`
        id,
        file_url,
        marks,
        student_id,
        users (
          name,
          email
        )
      `)
      .eq("assignment_id", assignmentId)

    setSubmissions(data || [])
  }

  async function updateMarks(submissionId, marks) {
    await supabase
      .from("submissions")
      .update({ marks })
      .eq("id", submissionId)

    alert("Marks saved")
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6 text-black">
        Student Submissions
      </h1>

      {submissions.map((submission) => (

        <div key={submission.id} className="border p-4 rounded mb-4">

          <p className="font-semibold text-black">
            {submission.users?.name}
          </p>

          <p className="text-sm mb-2 text-gray-600">
            {submission.users?.email}
          </p>

          <a
            href={submission.file_url}
            target="_blank"
            className="text-blue-600 underline"
          >
            View File
          </a>

          <div className="mt-3">
            <input
              type="number"
              placeholder="Enter Marks"
              defaultValue={submission.marks}
              onBlur={(e) =>
                updateMarks(submission.id, e.target.value)
              }
              className="border p-2"
            />
          </div>

        </div>

      ))}

    </div>
  )
}