"use client"
import "./dataTable.css"

export default function TableCell({ value, onChange, isError }) {

  function resize(e) {
    const el = e.target
    el.style.height = "auto"

    if (el.scrollHeight <= 96) {
      el.style.height = el.scrollHeight + "px"
      el.style.overflowY = "hidden"
    } else {
      el.style.height = "96px"
      el.style.overflowY = "auto"
    }
  }

  return (
    <textarea
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
        resize(e)
      }}
      onInput={resize}
      className={`textarea ${isError ? "error" : ""}`}
    />
  )
}