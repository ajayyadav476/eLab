"use client"
import Link from "next/link"

export default function StudentSidebar({ items, bottom }) {
  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-blue-300 to-green-400 border-r border-gray-300 p-6 flex flex-col justify-between">

      {/* TOP */}
      <div>
        <h1 className="text-xl font-semibold mb-10 text-white">
          eLab
        </h1>

        <div className="space-y-3">
          {items.map((item, index) => (
            <Link key={index} href={item.link}>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/30 cursor-pointer transition">
                {item.icon}
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* BOTTOM */}
      {bottom && (
        <div className="text-white">
          {bottom}
        </div>
      )}
    </div>
  )
}