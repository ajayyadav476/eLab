"use client"
import { supabase } from "../../lib/supabaseClient"

export default function LoginPage() {
  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-200">
      <div className="bg-white rounded-xl shadow-xl flex w-[900px] overflow-hidden">
        
        <div className="w-full relative">
          <img
            src="/login.png"
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-25 left-3/4 -translate-x-1/2">
            <button
              onClick={signIn}
              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-5 rounded-lg shadow-lg transition active:scale-98 cursor-pointer"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5"
              />
              Sign in with Google
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}