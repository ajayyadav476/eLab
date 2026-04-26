"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../../../lib/supabaseClient"

export default function NotesPage() {

  const { labId } = useParams()

  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [file, setFile] = useState(null)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("lab_id", labId)
      .order("created_at", { ascending: false })

    if (!error) {
      setNotes(data || [])
    }

  }

  async function uploadNote() {

    if (!title || !file) {
      alert("Title and file required")
      return
    }

    const fileName = `${Date.now()}-${file.name}`

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from("assignments") // same bucket
      .upload(`notes/${fileName}`, file)

    if (error) {
      alert("Upload failed")
      console.log(error)
      return
    }

    const { data: publicUrl } = supabase
      .storage
      .from("assignments")
      .getPublicUrl(data.path)

    // Insert into DB (ONLY YOUR COLUMNS)
    const { error: dbError } = await supabase
      .from("notes")
      .insert([
        {
          lab_id: labId,
          title: title,
          file_url: publicUrl.publicUrl
        }
      ])

    if (dbError) {
      alert("Error saving note")
      console.log(dbError)
      return
    }

    setTitle("")
    setFile(null)

    loadNotes()
  }

  async function deleteNote(id) {

    const confirmDelete = confirm("Are you sure you want to delete this note?")

    if (!confirmDelete) return

    await supabase
      .from("notes")
      .delete()
      .eq("id", id)

    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (

    <div>

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-lg font-bold text-gray-800">
          Study Material
        </h2>

      </div>

      {/* Upload Section */}

      <div className="bg-white border border-purple-100 p-4 rounded-xl mb-6">

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded text-black mb-3"
        />

        <label className="block mb-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />

        <div className="w-fit bg-gray-200 text-black px-4 py-1 rounded cursor-pointer hover:bg-gray-300 transition">
          Browse File
        </div>
      </label>

      {/* Show selected file */}
      {file && (
        <p className="text-sm text-gray-700 mb-3">
          Selected: <span className="font-medium">{file.name}</span>
        </p>
      )}

        <button
          onClick={uploadNote}
          className="bg-purple-600 text-white px-4 py-2 rounded transition transform hover:scale-101 active:scale-95 cursor-pointer"
        >
          Upload Notes
        </button>

      </div>

      {/* Notes List */}

      <div className="space-y-4">

        {notes.length === 0 && (
          <p className="text-gray-500">No Study Material uploaded</p>
        )}

        {notes.map((n) => (

          <div
            key={n.id}
            className="bg-white border border-purple-100 p-4 rounded-xl flex justify-between items-center hover:shadow-md transition"
          >

            {/* LEFT */}

            <div>

              <div className="font-semibold text-purple-900">
                {n.title}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </div>

              <a
                href={n.file_url}
                target="_blank"
                className="text-purple-600 text-sm mt-1 block hover:underline transition transform active:scale-95 cursor-pointer"
              >
                📄 View / Download
              </a>

            </div>

            {/* DELETE */}

            <button
              onClick={() => deleteNote(n.id)}
              className="border border-red-500 text-red-500 text-sm px-3 py-1 rounded transition transform active:scale-95 cursor-pointer"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>

  )

}