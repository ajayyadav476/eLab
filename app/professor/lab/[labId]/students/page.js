"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../../../lib/supabaseClient"

export default function MembersPage() {
  const { labId } = useParams()
  const [joinCode, setJoinCode] = useState("")
  const [taEmail, setTaEmail] = useState("")
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (!labId) return
    loadMembers()
  }, [labId])

  function getRoll(email) {
    return email?.split("@")[0]
  }

  async function loadMembers() {
    const { data } = await supabase
      .from("lab_members")
      .select(`
        id,
        role,
        user:users (
          id,
          name,
          email
        )
      `)
      .eq("lab_id", labId)

    setMembers(data || [])
  }

  async function joinLab() {
  if (!joinCode) {
    alert("Enter lab code")
    return
  }

  const { data: { user } } = await supabase.auth.getUser()

  // 🔍 find lab
  const { data: lab, error } = await supabase
    .from("labs")
    .select("id")
    .eq("lab_code", joinCode)
    .single()

  if (error || !lab) {
    alert("Invalid lab code")
    return
  }

  // 🔍 get user email + role
  const { data: userData } = await supabase
    .from("users")
    .select("email, role")
    .eq("id", user.id)
    .single()

  const username = userData.email.split("@")[0]
  const isNumeric = /^\d+$/.test(username)

  // 🔥 decide role
  let role = "student"

  if (userData.role === "ta") {
    role = "ta"
  } else if (!isNumeric) {
    role = "ta"
  }

  // 🔍 check already joined
  const { data: existing } = await supabase
    .from("lab_members")
    .select("*")
    .eq("lab_id", lab.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    alert("Already joined")
    return
  }

  // ✅ insert
  await supabase.from("lab_members").insert([
    {
      lab_id: lab.id,
      user_id: user.id,
      role: role
    }
  ])

  alert(`Joined as ${role}`)
  setJoinCode("")
}

  async function addTA() {
    if (!taEmail) {
      alert("Enter email")
      return
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", taEmail)
      .single()

    if (error || !userData) {
      alert("User must login first")
      return
    }

    const { data: existing } = await supabase
      .from("lab_members")
      .select("*")
      .eq("lab_id", labId)
      .eq("user_id", userData.id)
      .maybeSingle()

    if (existing) {
      if (existing.role === "ta") {
        alert("Already TA")
        return
      }

      await supabase
        .from("lab_members")
        .update({ role: "ta" })
        .eq("id", existing.id)
    } else {
      await supabase
        .from("lab_members")
        .insert([
          {
            lab_id: labId,
            user_id: userData.id,
            role: "ta"
          }
        ])
    }

    await supabase
      .from("users")
      .update({ role: "ta" })
      .eq("id", userData.id)

    setTaEmail("")
    loadMembers()
  }

  async function removeMember(memberId, role) {
    if (role === "professor") return

    const confirmDelete = confirm("Remove this member?")
    if (!confirmDelete) return

    await supabase
      .from("lab_members")
      .delete()
      .eq("id", memberId)

    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  // 🔥 separate data
  const staff = members.filter(m => m.role === "professor" || m.role === "ta")
  const students = members.filter(m => m.role === "student")

  return (
    <div>

      <div className="bg-white p-5 rounded-xl shadow mb-6 flex justify-between items-center">

  {/* LEFT: Join Lab */}
  <div className="flex items-center gap-3">
    <input
      type="text"
      placeholder="Enter Lab Code"
      value={joinCode}
      onChange={(e) => setJoinCode(e.target.value)}
      className="border px-3 py-2 rounded w-48 text-black"
    />
    <button
      onClick={joinLab}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
    >
      Join Lab
    </button>
  </div>

  {/* RIGHT: Add TA */}
  <div className="flex items-center gap-3">
    <input
      type="email"
      placeholder="Enter TA email"
      value={taEmail}
      onChange={(e) => setTaEmail(e.target.value)}
      className="border px-3 py-2 rounded w-64 text-black"
    />
    <button
      onClick={addTA}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
    >
      Add TA
    </button>
  </div>

</div>

      {/* 🔵 PROFESSOR + TA */}
      <h2 className="text-lg font-bold mb-4 text-gray-800">
        Staff
      </h2>

      <div className="bg-white border rounded-xl overflow-hidden mb-8">

        <div className="grid grid-cols-4 bg-blue-100 p-3 text-sm font-semibold text-gray-700">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Action</div>
        </div>

        {staff.map((m) => (
          <div
            key={m.id}
            className="grid grid-cols-4 p-3 border-t text-sm items-center text-gray-700"
          >
            <div>{m.user.name}</div>
            <div>{m.user.email}</div>

            <div>
              {m.role === "professor" && (
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                  Professor
                </span>
              )}
              {m.role === "ta" && (
                <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                  TA
                </span>
              )}
            </div>

            <div>
              {m.role !== "professor" && (
                <button
                  onClick={() => removeMember(m.id, m.role)}
                  className="border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-50 cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

      </div>

      {/* 🟡 STUDENTS */}
      <h2 className="text-lg font-bold mb-4 text-gray-800">
        Students
      </h2>

      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="grid grid-cols-4 bg-yellow-100 p-3 text-sm font-semibold text-gray-700">
          <div>Roll No</div>
          <div>Name</div>
          <div>Email</div>
          <div>Action</div>
        </div>

        {students.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-4 p-3 border-t text-sm items-center text-gray-700"
          >
            <div>{getRoll(s.user.email)}</div>
            <div>{s.user.name}</div>
            <div>{s.user.email}</div>

            <div>
              <button
                onClick={() => removeMember(s.id, s.role)}
                className="border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-50 cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

      </div>

    </div>
  )
}