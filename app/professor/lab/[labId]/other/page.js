"use client"

import { useParams, useRouter } from "next/navigation"
import { Plus, Eye, Pencil, SquarePen, Database } from "lucide-react"

export default function OtherPage() {

  const { labId } = useParams()
  const router = useRouter()

  // ---------------- ATTENDANCE ----------------
  const attendanceCards = [
    {
      title: "Create Attendance",
      desc: "Start a new session and mark students.",
      border: "border-green-300 text-green-600",
      iconBg: "bg-green-100 text-green-600",
      icon: <Plus size={30} />,
      action: () => router.push(`/professor/lab/${labId}/other/attendance/create`)
    },
    {
      title: "View Attendance",
      desc: "Browse past records and history.",
      border: "border-blue-300 text-blue-600",
      iconBg: "bg-blue-100 text-blue-600",
      icon: <Eye size={30} />,
      action: () => router.push(`/professor/lab/${labId}/other/attendance/view`)
    },
    {
      title: "Edit Attendance",
      desc: "Correct previous session records.",
      border: "border-yellow-300 text-yellow-600",
      iconBg: "bg-yellow-100 text-yellow-600",
      icon: <Pencil size={30} />,
      action: () => router.push(`/professor/lab/${labId}/other/attendance/history`)
    }
  ]

  return (

    <div className="max-w-5xl mx-auto text-center">

      {/* ================= ATTENDANCE ================= */}

      <h1 className="text-3xl font-bold text-purple-700 mb-2">
        Attendance
      </h1>

      <p className="text-purple-500 mb-10">
        Manage attendance for your lab sessions
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {attendanceCards.map((c, i) => (
          <div
            key={i}
            onClick={c.action}
            className={`bg-white border ${c.border} rounded-2xl p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition active:scale-95`}
          >

            <div className={`w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full ${c.iconBg}`}>
              {c.icon}
            </div>

            <h3 className="text-lg font-semibold mb-2">
              {c.title}
            </h3>

            <p className="text-sm text-gray-500">
              {c.desc}
            </p>

          </div>
        ))}
      </div>


      {/* ================= MANAGE DATA ================= */}

      <div className="mt-20">

        <h2 className="text-3xl font-bold text-purple-700 mb-2">
          Manage Data
        </h2>

        <p className="text-purple-500 mb-10">
          Create and manage student records
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">

          {/* CREATE DATA */}
          <div
            onClick={() => router.push(`/professor/lab/${labId}/other/data`)}
            className="bg-white border border-green-300 rounded-2xl p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                <Database size={30} />
              </div>

              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                <SquarePen size={30} />
              </div>
            </div>
        

            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Create or Edit Data
            </h3>

            <p className="text-sm text-gray-500">
              Add new records or edit existing ones in the lab database.
            </p>
          </div>

          {/* VIEW DATA */}
          <div
            onClick={() => router.push(`/professor/lab/${labId}/other/data/view`)}
            className="bg-white border border-blue-300 rounded-2xl p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Eye size={30} />
            </div>

            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              View Data
            </h3>

            <p className="text-sm text-gray-500">
              Browse and inspect existing records.
            </p>
          </div>



        </div>

      </div>

    </div>

  )
}