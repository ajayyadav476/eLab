"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function NotesPage() {

  const { labId } = useParams()
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (!labId) return
    loadNotes()
  }, [labId])

  async function loadNotes() {

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("lab_id", labId)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("ERROR:", error)
      return
    }

    setNotes(data || [])
  }

  if (notes.length === 0) {
    return <p className="text-gray-600">No notes available.</p>
  }

  return (
    <div className="space-y-4">

      {notes.map(note => (

        <Link
          key={note.id}
          href={`/student/labs/${labId}/notes/${note.id}`}
        >
          <div className="bg-white p-4 rounded-lg shadow hover:bg-gray-100">

            <p className="font-semibold text-black">
              {note.title}
            </p>

            {note.description && (
              <p className="text-sm text-gray-600 mt-1">
                {note.description}
              </p>
            )}

            {note.file_url && (
              <p className="text-sm text-blue-600 mt-2 underline">
                View Material
              </p>
            )}

          </div>
        </Link>

      ))}

    </div>
  )
}