"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../../../../lib/supabaseClient"

export default function AssignmentsPage() {

  const { labId } = useParams()
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    loadAssignments()
  }, [])

  async function deleteAssignment(id) {

  const confirmDelete = confirm("Are you sure you want to delete this assignment?")

  if (!confirmDelete) return

  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", id)

  if (error) {
    alert("Failed to delete assignment")
    console.log(error)
    return
  }

  // Remove from UI instantly
  setAssignments((prev) => prev.filter((a) => a.id !== id))

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

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-lg font-bold text-gray-800">
          Assignments
        </h2>

        <Link
          href={`/professor/lab/${labId}/assignments/create`}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          + Create Assignment
        </Link>

      </div>


      {/* Cards */}

      <div className="space-y-4">

        {assignments.map((a) => (

          <div
            key={a.id}
            className="bg-white border border-purple-100 p-4 rounded-xl flex justify-between items-center hover:shadow-md transition"
          >

            {/* LEFT CONTENT */}

            <div className="flex-1">

              {/* CLICKABLE TITLE */}

              <Link
                href={`/professor/lab/${labId}/assignments/${a.id}`}
                className="font-semibold text-purple-900 hover:underline transition transform active:scale-95 cursor-pointer"
              >
                {a.title}
              </Link>

              <div className="text-sm text-gray-600 mt-1">
                Max Marks: <b>{a.max_marks}</b>
              </div>

              <div className="text-sm text-gray-600">
                Deadline: <b>{new Date(a.deadline).toLocaleString()}</b>
              </div>

              {a.attachment_url && (
                <a
                  href={a.attachment_url}
                  target="_blank"
                  className="text-purple-600 text-sm mt-1 block hover:underline transition transform active:scale-95 cursor-pointer"
                >
                  📎 View Attachment
                </a>
              )}

            </div>


            {/* RIGHT SIDE BUTTONS */}

            <div className="flex flex-col gap-2 ml-4">

              {/* EDIT */}

              <Link
                href={`/professor/lab/${labId}/assignments/create?edit=${a.id}`}
                className="bg-blue-600 text-white text-sm px-4 py-1 rounded text-center transition transform active:scale-95 cursor-pointer"
              >
                Edit
              </Link>

              {/* DELETE */}

              <button
                onClick={() => deleteAssignment(a.id)}
                className="border border-red-500 text-red-500 text-sm px-4 py-1 rounded transition transform active:scale-95 cursor-pointer"
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