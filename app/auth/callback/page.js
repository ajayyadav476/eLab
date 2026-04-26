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
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.replace("/login")
      return
    }

    const user = session.user
    const email = user.email
    const username = email.split("@")[0]

    const isNumeric = /^\d+$/.test(username)
    const TEST_PROF_ID = "241210011"

    const isProfessor =
      (!isNumeric) || (username === TEST_PROF_ID)

    // check existing user
    let { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    // insert if new
    if (!existingUser) {
      await supabase.from("users").insert([
        {
          id: user.id,
          name: user.user_metadata.full_name,
          email: email,
          role: isProfessor ? "professor" : "student"
        }
      ])
    }

    // get role
    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = userRole?.role

    if (role === "professor" || role === "ta") {
      router.replace("/professor")
    } else {
      router.replace("/student/dashboard")
    }
  }

  return <p className="p-10 text-center">Logging in...</p>
}