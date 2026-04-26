"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import * as XLSX from "xlsx"
import "../../components/dataTable.css"

export default function ViewSheet() {

  const { sheetId } = useParams()
  const [customOutValue, setCustomOutValue] = useState("")
  const [data, setData] = useState(null)
  const [showCompute, setShowCompute] = useState(false)

  const [computed, setComputed] = useState({
    total: false,
    percent: false,
    outOf: false
  })

  // ✅ SEPARATE STATES
  const [selectedTotal, setSelectedTotal] = useState({})
  const [selectedOutOf, setSelectedOutOf] = useState({})
  const [selectedPercent, setSelectedPercent] = useState({})

  // ================= FETCH =================
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data } = await supabase
      .from("data_sheets")
      .select("*")
      .eq("id", sheetId)
      .single()

    if (data) {
      setData(data)

      const initTotal = {}
      const initOutOf = {}
      const initPercent = {}

      data.columns.forEach(col => {
        initTotal[col.id] = {
          all: true,
          subs: col.sub?.map(() => true) || []
        }

        initOutOf[col.id] = {
          all: true,
          subs: col.sub?.map(() => true) || []
        }

        initPercent[col.id] = {
          all: true,
          subs: col.sub?.map(() => true) || []
        }
        }
      )

      setSelectedTotal(initTotal)
      setSelectedOutOf(initOutOf)
      setSelectedPercent(initPercent)
    }
  }

  if (!data) return <p>Loading...</p>

  // ================= TOGGLE =================
function toggleColumn(type, colId, checked, subIndex = null) {
  let state, setState

  if (type === "total") {
    state = selectedTotal
    setState = setSelectedTotal
  } else if (type === "outOf") {
    state = selectedOutOf
    setState = setSelectedOutOf
  } else {
    state = selectedPercent
    setState = setSelectedPercent
  }

  const newState = { ...state }

  if (!newState[colId]) return

  if (subIndex !== null) {
    newState[colId] = {
      ...newState[colId],
      subs: newState[colId].subs.map((v, i) =>
        i === subIndex ? checked : v
      )
    }
  } else {
    newState[colId] = {
      ...newState[colId],
      all: checked
    }
  }

  setState(newState)
}

  // ================= CALCULATE =================
function calculate(row) {
  let total = 0
  let totalMax = 0

  let percentTotal = 0
  let percentMax = 0

  let outTotal = 0
  let outMax = 0

  data.columns.forEach(col => {
    if (col.type !== "number") return

    const tSel = selectedTotal[col.id]
    const pSel = selectedPercent[col.id]
    const oSel = selectedOutOf[col.id]

    // ===== SUB COLUMNS =====
    if (col.sub.length > 0) {
      col.sub.forEach((_, i) => {

        // TOTAL
        if (tSel?.subs[i]) {
          total += Number(row[col.id]?.[i] || 0)
          totalMax += Number(col.subMax?.[i] || 0)
        }

        // PERCENT
        if (pSel?.subs[i]) {
          percentTotal += Number(row[col.id]?.[i] || 0)
          percentMax += Number(col.subMax?.[i] || 0)
        }

        // OUT OF
        if (oSel?.subs[i]) {
          outTotal += Number(row[col.id]?.[i] || 0)
          outMax += Number(col.subMax?.[i] || 0)
        }

      })
    }

    // ===== NORMAL COLUMN =====
    else {
      if (tSel?.all) {
        total += Number(row[col.id] || 0)
        totalMax += Number(col.max || 0)
      }

      if (pSel?.all) {
        percentTotal += Number(row[col.id] || 0)
        percentMax += Number(col.max || 0)
      }

      if (oSel?.all) {
        outTotal += Number(row[col.id] || 0)
        outMax += Number(col.max || 0)
      }
    }
  })

  const percent =
    percentMax
      ? ((percentTotal / percentMax) * 100).toFixed(2)
      : "-"

  const customOut = Number(customOutValue || 0)

  const outOf =
    outMax && customOut
      ? ((outTotal / outMax) * customOut).toFixed(2)
      : "-"

  return {
    total,
    totalMax,
    percent,
    outOf
  }
}




  // ================= EXCEL =================
async function downloadExcel() {
  // ================= HEADER =================

  const header1 = ["S.No"]
  const header2 = [""]

  data.columns.forEach(col => {
    if (col.sub.length > 0) {
      header1.push(col.name)
      for (let i = 1; i < col.sub.length; i++) header1.push("")
      col.sub.forEach(sub => header2.push(sub))
    } else {
      header1.push(col.name)
      header2.push("")
    }
  })

  if (computed.total) {
    header1.push("Total")
    header2.push("")
  }

  if (computed.outOf) {
    header1.push(`Out Of (${customOutValue || "-"})`)
    header2.push("")
  }

  if (computed.percent) {
    header1.push("%")
    header2.push("")
  }

  const sheetData = [header1, header2]

  // ================= ROWS =================

  data.rows.forEach((row, i) => {
    const line = [i + 1]

    data.columns.forEach(col => {
      if (col.sub.length > 0) {
        col.sub.forEach((_, sIndex) => {
          line.push(row[col.id]?.[sIndex] || "")
        })
      } else {
        line.push(row[col.id] || "")
      }
    })

    const calc = calculate(row)

    if (computed.total) line.push(calc.total)
    if (computed.outOf) line.push(calc.outOf)
    if (computed.percent) line.push(calc.percent)

    sheetData.push(line)
  })

  // ================= SHEET =================

  const ws = XLSX.utils.aoa_to_sheet(sheetData)

  // ✅ MERGE HEADERS
  let colIndex = 1
  data.columns.forEach(col => {
    if (col.sub.length > 0) {
      ws["!merges"] = ws["!merges"] || []
      ws["!merges"].push({
        s: { r: 0, c: colIndex },
        e: { r: 0, c: colIndex + col.sub.length - 1 }
      })
      colIndex += col.sub.length
    } else {
      colIndex += 1
    }
  })

  // ================= STYLE =================

  const range = XLSX.utils.decode_range(ws["!ref"])

  for (let R = 0; R <= range.e.r; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cellAddress]) continue

      // Header rows
      if (R === 0 || R === 1) {
        ws[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" }
        }
      } else {
        // Data rows center aligned
        ws[cellAddress].s = {
          alignment: { horizontal: "center", vertical: "center" }
        }
      }
    }
  }

  // ================= AUTO WIDTH =================

  const colCount = sheetData[0].length
  const colWidths = []

  for (let i = 0; i < colCount; i++) {
    let maxLength = 10
    sheetData.forEach(row => {
      const val = row[i] ? row[i].toString() : ""
      if (val.length > maxLength) maxLength = val.length
    })
    colWidths.push({ wch: maxLength + 2 })
  }

  ws["!cols"] = colWidths

  // ================= GET BATCH =================

const { data: lab } = await supabase
  .from("labs")
  .select("batch")
  .eq("id", data.lab_id)   // make sure lab_id exists in data_sheets
  .single()

const batchName = lab?.batch || "Batch"
  // ================= DOWNLOAD =================

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Sheet")

  XLSX.writeFile(wb, `${data.name}(${batchName}).xlsx`)
}

    
function getTotalMax() {
  let totalMax = 0
  data.columns.forEach(col => {
    if (col.type !== "number") return

    const tSel = selectedTotal[col.id]

    if (col.sub.length > 0) {
      col.sub.forEach((_, i) => {
        if (tSel?.subs[i]) {
          totalMax += Number(col.subMax?.[i] || 0)
        }
      })
    } else {
      if (tSel?.all) {
        totalMax += Number(col.max || 0)
      }
    }
  })

  return totalMax
}

  return (
    <div className="container">

      <h1 className="title">{data.name}</h1>

      {/* ACTIONS */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <button onClick={downloadExcel} className="btn green">
          Download Excel
        </button>

        <button onClick={() => setShowCompute(true)} className="btn purple">
          +
        </button>
      </div>



      {/* TABLE */}
      <div className="simpleTableWrapper">
        <table className="simpleTable">

          <thead>
            <tr>
              <th rowSpan={2}>S.No</th>

              {data.columns.map((col) =>
                col.sub.length > 0 ? (
                  <th key={col.id} colSpan={col.sub.length}>
                    {col.name}
                  </th>
                ) : (
                  <th key={col.id} rowSpan={2}>
                    {col.name}
                  </th>
                )
              )}
              


              {computed.total && (
                <th className="computeHeader" rowSpan={2}>
                  Total (Out of {getTotalMax()})
                </th>
              )}

              {computed.outOf && (
                <th className="computeHeader" rowSpan={2}>
                  Out Of ({customOutValue || "-"})
                </th>
              )}

              {computed.percent && (
                <th className="computeHeader" rowSpan={2}>
                  %
                </th>
              )}
            </tr>

            <tr>
              {data.columns.map((col) =>
                col.sub.length > 0
                  ? col.sub.map((sub, i) => (
                      <th key={col.id + "_" + i}>{sub}</th>
                    ))
                  : null
              )}
            </tr>
          </thead>

          <tbody>
            {data.rows.map((row, i) => {
              const calc = calculate(row)

              return (
                <tr key={i}>
                  <td>{i + 1}</td>

                  {data.columns.map(col =>
                    col.sub.length > 0 ? (
                      col.sub.map((_, sIndex) => (
                        <td key={col.id + sIndex}>
                          {row[col.id]?.[sIndex]}
                        </td>
                      ))
                    ) : (
                      <td key={col.id}>{row[col.id]}</td>
                    )
                  )}

                  {computed.total && <td>{calc.total}</td>}

                  {computed.outOf && <td>{calc.outOf}</td>}

                  {computed.percent && <td>{calc.percent}</td>}
                </tr>
              )
            })}
          </tbody>

        </table>
      </div>

      {/* MODAL */}
      {showCompute && (
  <div className="modalOverlay">
    <div className="computeModal">

      <h2 className="computeTitle">Computational Settings</h2>

      {/* ================= TOTAL ================= */}
      <div className="computeRow">
        <span>Total</span>
        <div
          className={`switch ${computed.total ? "on" : ""}`}
          onClick={() =>
            setComputed({ ...computed, total: !computed.total })
          }
        >
          <div className="knob"></div>
        </div>
      </div>

      {computed.total && (
        <div className="selectCard">
          <h3>Select Total Columns</h3>

          {data.columns.filter(c => c.type === "number").map(col =>
            col.sub.length > 0
              ? col.sub.map((sub, i) => (
                  <label key={col.id + i} className="checkItem">
                    <input
                      type="checkbox"
                      checked={selectedTotal[col.id]?.subs[i]}
                      onChange={(e) =>
                        toggleColumn("total", col.id, e.target.checked, i)
                      }
                    />
                    <span>{col.name} {sub}</span>
                  </label>
                ))
              : (
                <label key={col.id} className="checkItem">
                  <input
                    type="checkbox"
                    checked={selectedTotal[col.id]?.all}
                    onChange={(e) =>
                      toggleColumn("total", col.id, e.target.checked)
                    }
                  />
                  <span>{col.name}</span>
                </label>
              )
          )}
        </div>
      )}

      {/* ================= OUT OF ================= */}
      {/* OUT OF */}
<div className="computeRow">
  <span>Out Of</span>
  <div
    className={`switch ${computed.outOf ? "on" : ""}`}
    onClick={() =>
      setComputed({ ...computed, outOf: !computed.outOf })
    }
  >
    <div className="knob"></div>
  </div>
</div>

{/* INPUT FIELD */}
{computed.outOf && (
  <>
    <input
      type="number"
      placeholder="Enter custom out of (e.g. 20)"
      className="outInput"
      value={customOutValue}
      onChange={(e) => setCustomOutValue(e.target.value)}
    />

    <div className="selectCard">
      <h3>Select Out Of Columns</h3>

      {data.columns
        .filter(c => c.type === "number")
        .map(col =>
          col.sub.length > 0
            ? col.sub.map((sub, i) => (
                <label key={col.id + i} className="checkItem">
                  <input
                    type="checkbox"
                    checked={selectedOutOf[col.id]?.subs[i]}
                    onChange={(e) =>
                      toggleColumn("outOf", col.id, e.target.checked, i)
                    }
                  />
                  <span>{col.name} {sub}</span>
                </label>
              ))
            : (
              <label key={col.id} className="checkItem">
                <input
                  type="checkbox"
                  checked={selectedOutOf[col.id]?.all}
                  onChange={(e) =>
                    toggleColumn("outOf", col.id, e.target.checked)
                  }
                />
                <span>{col.name}</span>
              </label>
            )
        )}
    </div>
  </>
)}

      {/* ================= PERCENT ================= */}
      <div className="computeRow">
        <span>Percentage</span>
        <div
          className={`switch ${computed.percent ? "on" : ""}`}
          onClick={() =>
            setComputed({ ...computed, percent: !computed.percent })
          }
        >
          <div className="knob"></div>
        </div>
      </div>

      {computed.percent && (
        <div className="selectCard">
          <h3>Select Percentage Columns</h3>

          {data.columns.filter(c => c.type === "number").map(col =>
            col.sub.length > 0
              ? col.sub.map((sub, i) => (
                  <label key={col.id + i} className="checkItem">
                    <input
                      type="checkbox"
                      checked={selectedPercent[col.id]?.subs[i]}
                      onChange={(e) =>
                        toggleColumn("percent", col.id, e.target.checked, i)
                      }
                    />
                    <span>{col.name} {sub}</span>
                  </label>
                ))
              : (
                <label key={col.id} className="checkItem">
                  <input
                    type="checkbox"
                    checked={selectedPercent[col.id]?.all}
                    onChange={(e) =>
                      toggleColumn("percent", col.id, e.target.checked)
                    }
                  />
                  <span>{col.name}</span>
                </label>
              )
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="modalActions">
        <button onClick={() => setShowCompute(false)}>Cancel</button>
        <button onClick={() => setShowCompute(false)}>Apply</button>
      </div>

    </div>
  </div>
)}

    </div>
  )
}