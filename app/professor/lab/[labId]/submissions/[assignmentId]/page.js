"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "../../../../../../lib/supabaseClient"

export default function AssignmentSubmissions() {

  const { labId, assignmentId } = useParams()

  const [submitted, setSubmitted] = useState([])
  const [notSubmitted, setNotSubmitted] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  function getRoll(email) {
    return email?.split("@")[0]
  }

  async function loadData() {

    // 1️⃣ Get all students
    const { data: members } = await supabase
      .from("lab_members")
      .select(`
        user_id,
        user:users (
          id,
          name,
          email
        )
      `)
      .eq("lab_id", labId)
      .eq("role", "student")

    // 2️⃣ Get submissions
    const { data: subs } = await supabase
      .from("submissions")
      .select(`
        *,
        student:users!submissions_student_fkey (
          id,
          name,
          email
        )
      `)
      .eq("assignment_id", assignmentId)

    const submittedMap = new Map()

    subs.forEach((s) => {
      submittedMap.set(s.student.id, s)
    })

    const submittedList = []
    const notSubmittedList = []

    members.forEach((m) => {

      const user = m.user

      if (submittedMap.has(user.id)) {
        submittedList.push(submittedMap.get(user.id))
      } else {
        notSubmittedList.push(user)
      }

    })

    // 3️⃣ SORT
    submittedList.sort((a, b) =>
      getRoll(a.student.email).localeCompare(getRoll(b.student.email))
    )

    notSubmittedList.sort((a, b) =>
      getRoll(a.email).localeCompare(getRoll(b.email))
    )

    setSubmitted(submittedList)
    setNotSubmitted(notSubmittedList)
  }

  return (

    <div>

      <h2 className="text-lg font-bold mb-6 text-gray-800">
        Submissions
      </h2>

      {/* SUBMITTED */}

      <div className="mb-8">

        <h3 className="font-semibold mb-3 text-green-700">
          Submitted ({submitted.length})
        </h3>

        <div className="bg-white border rounded-xl overflow-hidden">

          <div className="grid grid-cols-5 bg-purple-50 p-3 text-sm font-semibold text-black">
            <div>Roll No</div>
            <div>Name</div>
            <div>Date</div>
            <div>Marks</div>
            <div>Status</div>
          </div>

          {submitted.map((s) => (

            <div
              key={s.id}
              className="grid grid-cols-5 p-3 border-t text-sm items-center text-gray-700"
            >

              <div>{getRoll(s.student.email)}</div>

              <div>{s.student.name}</div>

              <div>
                {new Date(s.submitted_at).toLocaleDateString()}
              </div>

              <div>
                {s.marks ?? "-"}
              </div>

              <div>
                {s.marks !== null ? (
                  <span className="text-green-600 font-medium">
                    Graded
                  </span>
                ) : (
                  <span className="text-yellow-600 font-medium">
                    Pending
                  </span>
                )}
              </div>

            </div>

          ))}

        </div>

      </div>


      {/* NOT SUBMITTED */}

      <div>

        <h3 className="font-semibold mb-3 text-red-600">
          Not Submitted ({notSubmitted.length})
        </h3>

        <div className="bg-white border rounded-xl overflow-hidden">

          <div className="grid grid-cols-2 bg-red-50 p-3 text-sm font-semibold text-gray-700">
            <div>Roll No</div>
            <div>Name</div>
          </div>

          {notSubmitted.map((u) => (

            <div
              key={u.id}
              className="grid grid-cols-2 p-3 border-t text-sm"
            >

              <div>{getRoll(u.email)}</div>

              <div>{u.name}</div>

            </div>

          ))}

        </div>

      </div>

    </div>

  )

}