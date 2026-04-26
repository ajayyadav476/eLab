"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    handleLogin()
  }, [])

  async function handleLogin() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const email = user.email
    const username = email.split("@")[0]

    // 🔒 institute restriction
    if (
      !email.endsWith("@nitdelhi.ac.in") &&
      username !== "241210013"
    ) {
      alert("Only NIT Delhi email allowed")
      return
    }

    // 🔍 check existing user
    let { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    // ✅ first time user → assign role once
    if (!existingUser) {
      const isNumeric = /^\d+$/.test(username)
      const TEST_PROF_ID = "241210011"

      const isProfessor =
        (!isNumeric) || (username === TEST_PROF_ID)

      await supabase.from("users").insert([
        {
          id: user.id,
          name: user.user_metadata.full_name,
          email: email,
          role: isProfessor ? "professor" : "student"
        }
      ])
    }

    // 🔍 always use DB role for routing
    const { data: userRoleData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = userRoleData?.role

    // 🚀 redirect
    if (role === "professor" || role === "ta") {
      router.replace("/professor")
    } else {
      router.replace("/student/dashboard")
    }
  }

  return (
    <div className="p-10 text-center">
      Redirecting...
    </div>
  )
}