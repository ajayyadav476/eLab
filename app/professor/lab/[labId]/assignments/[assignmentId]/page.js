"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../../../../lib/supabaseClient"

export default function AssignmentSubmissions() {

  const { assignmentId } = useParams()

  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {

    const { data } = await supabase
  .from("submissions")
  .select(`
    id,
    file_url,
    submitted_at,
    marks,
    student:users!submissions_student_fkey (
      name
    )
  `)
  .eq("assignment_id", assignmentId)

    setSubmissions(data || [])

  }

  async function gradeSubmission(id, marks) {

  const { error } = await supabase
    .from("submissions")
    .update({
      marks: Number(marks)
    })
    .eq("id", id)

  if (!error) {
    loadSubmissions()
  }}

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold text-black mb-6">
        Student Submissions
      </h1>

      {submissions.length === 0 && (
        <p>No submissions yet</p>
      )}

      <div className="space-y-4">

        {submissions.map((sub) => (

          <SubmissionCard
            key={sub.id}
            submission={sub}
            gradeSubmission={gradeSubmission}
          />

        ))}

      </div>

    </div>

  )

}

function SubmissionCard({ submission, gradeSubmission }) {

  const [marks, setMarks] = useState(submission.marks || "")

  return (

    <div className="border p-4 rounded-lg bg-white shadow flex justify-between items-center">

      <div>

        <p className="font-semibold text-black">
          {submission.student?.name}
        </p>

        <p className="text-gray-600 text-sm">
          {new Date(submission.submitted_at).toLocaleString()}
        </p>

        <a
          href={submission.file_url}
          target="_blank"
          className="text-blue-600 underline"
        >
          View Submission
        </a>

      </div>

      <div className="flex items-center gap-3">

        <input
          type="number"
          value={marks}
          onChange={(e)=>setMarks(e.target.value)}
          className="border px-2 py-1 w-20 text-black"
        />

        {submission.marks !== null && (

          <button
            onClick={()=>gradeSubmission(submission.id, marks)}
            className="bg-green-600 text-white px-3 py-1 rounded  transition transform hover:scale-101 active:scale-95 cursor-pointer"
          >
            Grade
          </button>

        )}

        {submission.marks === null && (
          <span className="text-green-700 font-semibold">
            Graded
          </span>
        )}

      </div>

    </div>

  )

}