"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../../../lib/supabaseClient"

export default function NoticesPage() {

  const { labId } = useParams()

  const [notices, setNotices] = useState([])
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadNotices()
  }, [])

  async function loadNotices() {

    const { data } = await supabase
      .from("notices")
      .select(`
        *,
        user:users(name)
      `)
      .eq("lab_id", labId)
      .order("created_at", { ascending: false })

    setNotices(data || [])
  }

  async function createNotice() {

    if (!title) {
      alert("Title required")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("notices")
      .insert([
        {
          lab_id: labId,
          title,
          message,
          created_by: user.id
        }
      ])

    if (error) {
      alert("Error creating notice")
      console.log(error)
      return
    }

    setTitle("")
    setMessage("")
    loadNotices()
  }

  async function deleteNotice(id) {

    const confirmDelete = confirm("Delete this notice?")

    if (!confirmDelete) return

    await supabase
      .from("notices")
      .delete()
      .eq("id", id)

    setNotices((prev) => prev.filter((n) => n.id !== id))
  }

  return (

    <div>

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-lg font-bold text-gray-800">
          Notices
        </h2>

      </div>

      {/* Create Notice */}

      <div className="bg-white border border-purple-100 p-4 rounded-xl mb-6">

        <input
          type="text"
          placeholder="Notice title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded text-black mb-3"
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
          className="w-full border px-3 py-2 rounded text-black mb-3"
        />

        <button
          onClick={createNotice}
          className="bg-purple-600 text-white px-4 py-2 rounded transition transform hover:scale-101 active:scale-95 cursor-pointer"
        >
          Post Notice
        </button>

      </div>

      {/* Notices List */}

      <div className="space-y-4">

        {notices.length === 0 && (
          <p className="text-gray-500">No notices yet</p>
        )}

        {notices.map((n) => (

          <div
            key={n.id}
            className="bg-white border border-purple-100 p-4 rounded-xl flex justify-between items-start hover:shadow-md transition"
          >

            <div>

              <div className="font-semibold text-purple-900">
                {n.title}
              </div>

              {n.message && (
                <div className="text-sm text-gray-600 mt-1">
                  {n.message}
                </div>
              )}

              <div className="text-xs text-gray-400 mt-2">
                By: {n.user?.name}
              </div>

              {n.created_at && (
                <div className="text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              )}

            </div>

            <button
              onClick={() => deleteNotice(n.id)}
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