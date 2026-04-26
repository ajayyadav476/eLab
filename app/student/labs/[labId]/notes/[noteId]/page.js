"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function NotePage() {

  const { noteId } = useParams()
  const [note, setNote] = useState(null)

  useEffect(() => {
    if (!noteId) return
    loadNote()
  }, [noteId])

  async function loadNote() {

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .single()

    if (error) {
      console.log("ERROR:", error)
      return
    }

    setNote(data)
  }

  if (!note) {
    return <p>Loading note...</p>
  }

  return (
    <div className="max-w-3xl mx-auto py-10 text-black">

      <h2 className="text-3xl font-bold mb-4 border-b pb-2">
        {note.title}
      </h2>

      {note.description && (
        <p className="mb-6">
          {note.description}
        </p>
      )}

      {note.file_url && (
        <a
          href={note.file_url}
          target="_blank"
          className="text-blue-600 underline block mt-3"
        >
          Open Study Material
        </a>
      )}

    </div>
  )
}