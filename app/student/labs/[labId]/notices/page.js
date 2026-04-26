"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function NoticesPage() {

  const { labId } = useParams()
  const [notices, setNotices] = useState([])

  useEffect(() => {
    if (!labId) return
    loadNotices()
  }, [labId])

  async function loadNotices() {

    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("lab_id", labId)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("ERROR:", error)
      return
    }

    setNotices(data || [])
  }

  if (notices.length === 0) {
    return (
      <p className="text-gray-600">
        No notices available.
      </p>
    )
  }

  return (
    <div className="space-y-4">

      {notices.map(n => (

        <div
          key={n.id}
          className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg shadow"
        >

          {/* Title */}
          <p className="font-semibold text-black">
            {n.title}
          </p>

          {/* Message */}
          {n.message && (
            <p className="text-sm text-gray-700 mt-1">
              {n.message}
            </p>
          )}

          {/* Time */}
          <p className="text-xs text-gray-500 mt-2">
            {new Date(n.created_at).toLocaleString()}
          </p>

        </div>

      ))}

    </div>
  )
}