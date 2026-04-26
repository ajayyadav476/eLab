"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function ViewDataList() {

  const { labId } = useParams()
  const router = useRouter()

  const [sheets, setSheets] = useState([])

  useEffect(() => {
    fetchSheets()
  }, [])

  async function fetchSheets() {
    const { data } = await supabase
      .from("data_sheets")
      .select("*")
      .eq("lab_id", labId)

    setSheets(data || [])
  }

  return (
  <div className="container text-gray-700 mx-auto p-4">

    <h1 className="title text-center text-purple-500 text-lg font-bold">View Data Sheets</h1>

    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "15px",
      marginTop: "30px"
    }}>

      {sheets.length === 0 && (
        <p>No sheets available</p>
      )}

      {sheets.map(sheet => (
        <div
          key={sheet.id}
          onClick={() =>
            router.push(`/professor/lab/${labId}/other/data/view/${sheet.id}`)
          }
          style={{
            width: "60%",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            cursor: "pointer",
            textAlign: "left",
            fontWeight: "600",
            background: "#f9f9f9",
            transition: "0.1s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {sheet.name}
        </div>
      ))}

    </div>

  </div>
)
}