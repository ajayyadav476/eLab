"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabaseClient"

export default function JoinLabPage() {

  const [labCode, setLabCode] = useState("")

  async function joinLab() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("You must login first")
      return
    }

    // find lab using lab_code
    const { data: lab, error } = await supabase
      .from("labs")
      .select("*")
      .eq("lab_code", labCode)
      .single()

    if (error || !lab) {
      alert("Invalid lab code")
      return
    }

    // insert membership
    const { error: joinError } = await supabase
      .from("lab_members")
      .insert([
        {
          lab_id: lab.id,
          user_id: user.id,
          role: "student"
        }
      ])

    if (joinError) {
      alert("Already joined or error occurred")
      return
    }

    alert("Joined lab successfully!")

  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">

      <h1 className="text-3xl font-bold">
        Join Lab
      </h1>

      <input
        type="text"
        placeholder="Enter Lab Code"
        value={labCode}
        onChange={(e) => setLabCode(e.target.value)}
        className="border p-2 rounded"
      />

      <button
        onClick={joinLab}
        className="px-6 py-2 bg-green-600 text-white rounded"
      >
        Join
      </button>

    </div>
  )
}