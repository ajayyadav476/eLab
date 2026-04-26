"use client"

import { useEffect } from "react"
import { supabase } from "../lib/supabaseClient"

export default function Home() {


  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        eLab Dashboard
      </h1>
    </div>
  )
}