import { redirect } from "next/navigation"

export default function LabHome({ params }) {

  redirect(`/professor/lab/${params.labId}/assignments`)

}