"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabaseClient"

export default function CreateLab() {

  const router = useRouter()

  const [courseName, setCourseName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [batch, setBatch] = useState("")
  const [year, setYear] = useState("")

  async function createLab() {

    const { data: { user } } = await supabase.auth.getUser()

    const labCode = Math.random().toString(36).substring(2,8).toUpperCase()

    const { data } = await supabase
      .from("labs")
      .insert([
        {
          course_name: courseName,
          course_code: courseCode,
          batch: batch,
          academic_year: year,
          professor_id: user.id,
          lab_code: labCode
        }
      ])
      .select()
      .single()

    await supabase.from("lab_members").insert([
      {
        lab_id: data.id,
        user_id: user.id,
        role: "professor"
      }
    ])

    router.push("/professor/labs")

  }

return (
    
    <div className="min-h-screen flex items-center justify-center bg-violet-100 p-10">
        
        <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Create Lab
            </h1>
            
            <div className="space-y-4">
                <input
                    placeholder="Course Name"
                    className="w-full border rounded-lg px-4 py-2 text-gray-600"
                    onChange={(e)=>setCourseName(e.target.value)}
                />
                <input
                    placeholder="Course Code"
                    className="w-full border rounded-lg px-4 py-2 text-gray-600"
                    onChange={(e)=>setCourseCode(e.target.value)}
                />
                <input
                    placeholder="Batch"
                    className="w-full border rounded-lg px-4 py-2 text-gray-600"
                    onChange={(e)=>setBatch(e.target.value)}
                />
                <input
                    placeholder="Academic Year (e.g. 2025-26)"
                    className="w-full border rounded-lg px-4 py-2 text-gray-600"
                    onChange={(e)=>setYear(e.target.value)}
                />
                <button
                    onClick={createLab}
                    className="w-full bg-green-500 text-gray-800 py-2 rounded-lg transition transform hover:scale-101 active:scale-95 font-semibold cursor-pointer"
                >
                    Create Lab
                </button>
                <button
                    onClick={() => router.push("/professor")}
                    className="w-full bg-white text-purple-600 px-4 py-2 rounded font-semibold transition transform hover:scale-102 active:scale-95 cursor-pointer"
                    >
                    ← Back to Dashboard
                    </button>
            </div>
            
        </div>
        
    </div>
    
)

}