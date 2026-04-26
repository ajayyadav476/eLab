"use client"

import Link from "next/link"

export default function Sidebar({ items, bottom }) {
  return (
    <div className="w-64 min-h-screen bg-blue-100 border-r-4 border-gray-200 p-6 flex flex-col justify-between">

      {/* ================= TOP ================= */}
      <div>

        {/* Title */}
        <h1 className="text-xl font-semibold mb-10 text-gray-700">
          eLab
        </h1>

        {/* Menu */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <Link key={index} href={item.link}>
              <div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* ================= BOTTOM ================= */}
      {bottom && (
        <div>
          {bottom}
        </div>
      )}

    </div>
  )
}