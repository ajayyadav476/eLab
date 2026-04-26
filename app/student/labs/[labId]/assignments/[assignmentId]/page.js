"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { FileText, Upload, File, Trash2 } from "lucide-react"

export default function AssignmentPage() {

  const { assignmentId } = useParams()
  const [assignment, setAssignment] = useState(null)

  useEffect(() => {
    if (!assignmentId) return
    loadAssignment()
  }, [assignmentId])

  async function loadAssignment() {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", assignmentId)
      .single()

    setAssignment(data)
  }

  if (!assignment) {
    return <p className="text-center mt-20">Loading assignment...</p>
  }

  return (
    <div className="max-w-3xl mx-auto py-10 text-black">

      {/* TITLE */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-lg">
          <FileText size={20} className="text-blue-600" />
        </div>

        <h2 className="text-3xl font-bold">
          {assignment.title}
        </h2>
      </div>

      {/* DESCRIPTION */}
      <p className="mb-6 text-gray-700 leading-relaxed">
        {assignment.description}
      </p>

      {/* ATTACHMENT */}
      {assignment.attachment_url && (
        <a
          href={assignment.attachment_url}
          target="_blank"
          className="inline-block mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          View Attachment
        </a>
      )}

      {/* DEADLINE */}
      <div className="mb-6 text-sm text-gray-500">
        Due: {new Date(assignment.deadline).toDateString()}
      </div>

      <SubmitSection assignmentId={assignmentId} />

    </div>
  )
}

function SubmitSection({ assignmentId }) {

  const [file, setFile] = useState(null)
  const [submission, setSubmission] = useState(null)

  useEffect(() => {
    loadSubmission()
  }, [])

  async function loadSubmission() {
    const { data: { user } } = await supabase.auth.getUser()

    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .eq("student_id", user.id)
      .maybeSingle()

    setSubmission(data)
  }

  async function submitAssignment() {
    if (!file) return alert("Select file")

    const { data: { user } } = await supabase.auth.getUser()

    const filePath = `${user.id}/${assignmentId}/${file.name}`

    await supabase.storage
      .from("assignments")
      .upload(filePath, file, { upsert: true })

    await supabase.from("submissions").insert([
      {
        assignment_id: assignmentId,
        student_id: user.id,
        file_url: filePath,
        file_type: file.type,
        submitted_at: new Date()
      }
    ])

    loadSubmission()
  }

  async function unsubmit() {
    if (!submission) return

    await supabase
      .from("submissions")
      .delete()
      .eq("id", submission.id)

    setSubmission(null)
  }

  let publicUrl = null

  if (submission) {
    const { data } = supabase
      .storage
      .from("assignments")
      .getPublicUrl(submission.file_url)

    publicUrl = data.publicUrl
  }

  return (
    <div className="border-t pt-6">

      <h3 className="font-semibold mb-4 text-lg">
        Submission
      </h3>

      <div className="flex items-center gap-4">

        {/* FILE INPUT */}
        <label className="flex-1 cursor-pointer">

          <input
            type="file"
            disabled={submission}
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />

          <div className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">

            <Upload size={16} className="text-gray-500" />

            <span className="text-gray-700 text-sm">
              {submission
                ? submission.file_url.split("/").pop()
                : file
                  ? file.name
                  : "Choose File"}
            </span>

          </div>
        </label>

        {/* SUBMIT */}
        {!submission && (
          <button
            onClick={submitAssignment}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <Upload size={16} />
            Submit
          </button>
        )}

        {/* UNSUBMIT */}
        {submission && !submission.marks && (
          <button
            onClick={unsubmit}
            className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 transition"
          >
            <Trash2 size={16} />
            Unsubmit
          </button>
        )}

      </div>

      {/* VIEW FILE */}
      {submission && (
        <div className="mt-4">
          <a
            href={publicUrl}
            target="_blank"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <File size={16} />
            View Submission
          </a>
        </div>
      )}

    </div>
  )
}