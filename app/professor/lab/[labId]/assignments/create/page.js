"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { supabase } from "../../../../../../lib/supabaseClient"

export default function CreateAssignmentPage() {

  const { labId } = useParams()
  const router = useRouter()
  const params = useSearchParams()

  const editId = params.get("edit")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [maxMarks, setMaxMarks] = useState("")
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (editId) loadAssignment()
  }, [editId])

  async function loadAssignment() {

    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", editId)
      .single()

    if (!data) return

    setTitle(data.title)
    setDescription(data.description)
    setMaxMarks(data.max_marks)
    setDeadline(data.deadline.slice(0,16))

  }

  async function saveAssignment() {

    const { data: { user } } = await supabase.auth.getUser()

    let attachmentUrl = null

    if (file) {

      const fileName = `${Date.now()}-${file.name}`

      const { data, error } = await supabase.storage
        .from("assignments")
        .upload(`assignment-files/${fileName}`, file)

      if (error) {
        alert("File upload failed")
        return
      }

      const { data: publicUrl } = supabase
        .storage
        .from("assignments")
        .getPublicUrl(data.path)

      attachmentUrl = publicUrl.publicUrl
    }

    if (editId) {

      const { error } = await supabase
        .from("assignments")
        .update({
          title,
          description,
          max_marks: Number(maxMarks),
          deadline
        })
        .eq("id", editId)

      if (error) {
        alert("Update failed")
        return
      }

      alert("Assignment updated")

    } else {

      const { error } = await supabase
        .from("assignments")
        .insert([
          {
            lab_id: labId,
            title,
            description,
            max_marks: Number(maxMarks),
            deadline,
            created_by: user.id,
            attachment_url: attachmentUrl
          }
        ])

      if (error) {
        alert("Error creating assignment")
        return
      }

      alert("Assignment created")

    }

    router.push(`/professor/lab/${labId}/assignments`)
  }

  return (

    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">

      <h2 className="text-2xl font-bold mb-6 text-black">
        {editId ? "Edit Assignment" : "Create Assignment"}
      </h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-black">
          Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2 text-black"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-black">
          Description
        </label>

        <textarea
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 text-black"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-black">
          Max Marks
        </label>

        <input
          type="number"
          value={maxMarks}
          onChange={(e)=>setMaxMarks(e.target.value)}
          className="w-full border rounded px-3 py-2 text-black"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-black">
          Deadline
        </label>

        <input
          type="datetime-local"
          value={deadline}
          onChange={(e)=>setDeadline(e.target.value)}
          className="w-full border rounded px-3 py-2 text-black"
        />
      </div>

      {!editId && (
        <div className="mb-6 border-dashed border-2 border-gray-500 p-4 rounded text-gray-500">

          <label className="block mb-1 font-medium text-black">
            Attachment (optional)
          </label>

          <input
            type="file"
            onChange={(e)=>setFile(e.target.files[0])}
          />

        </div>
      )}

      <button
        onClick={saveAssignment}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition transform hover:scale-101 active:scale-95 cursor-pointer"
      >
        {editId ? "Update Assignment" : "Create Assignment"}
      </button>

    </div>
  )
}