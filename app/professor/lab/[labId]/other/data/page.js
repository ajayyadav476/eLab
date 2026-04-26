"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function DataHome() {

  const { labId } = useParams()
  const router = useRouter()

  const [sheets, setSheets] = useState([])

  useEffect(() => {
    fetchSheets()
  }, [])

  async function fetchSheets() {
    const { data } = await supabase
      .from("data_sheets")
      .select("*")
      .eq("lab_id", labId)
      .order("created_at", { ascending: false })

    setSheets(data || [])
  }

  async function handleDelete(id) {
    const confirmDelete = confirm("Are you sure you want to delete this sheet?")
    if (!confirmDelete) return

    await supabase.from("data_sheets").delete().eq("id", id)
    fetchSheets()
  }

  return (
    <div className="max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">
        Create & Edit Data
      </h1>

      {/* CREATE BUTTON */}
      <div className="text-center mb-6">
        <button
          onClick={() => router.push(`/professor/lab/${labId}/other/data/create`)}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg transition transform hover:scale-101 active:scale-95 cursor-pointer"
        >
          + Create Data Sheet
        </button>
      </div>

      {/* LIST */}
      {sheets.map(sheet => (
        <div
          key={sheet.id}
          className="flex justify-between items-center border p-4 mb-3 rounded-lg text-black bg-white"
        >
          <span className="font-semibold">{sheet.name}</span>

          <div className="flex gap-3">

            <button
              onClick={() =>
                router.push(`/professor/lab/${labId}/other/data/create?edit=${sheet.id}`)
              }
              className="bg-blue-600 text-white px-4 py-1 rounded transition transform hover:scale-102 active:scale-95 cursor-pointer"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(sheet.id)}
              className="bg-red-600 text-white px-4 py-1 rounded transition transform hover:scale-102 active:scale-95 cursor-pointer"
            >
              Delete
            </button>

          </div>
        </div>
      ))}

    </div>
  )
}