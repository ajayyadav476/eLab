import { redirect } from "next/navigation"

export default async function LabHome({ params }) {
  const { labId } = await params   // ✅ FIX HERE
  redirect(`/student/labs/${labId}/assignments`)
}