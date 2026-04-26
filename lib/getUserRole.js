import { supabase } from "./supabaseClient"

export async function getUserRole() {

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  return data?.role
}