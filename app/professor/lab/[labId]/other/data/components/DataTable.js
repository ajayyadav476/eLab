"use client"
import "./dataTable.css"

function autoResize(e) {
  const el = e.target
  el.style.height = "auto"
  el.style.height = Math.min(el.scrollHeight, 100) + "px"
}

export default function DataTable({ columns, rows, updateCell,setPopup, setRowPopup }) {

  return (
    <div className="simpleTableWrapper">

      <table className="simpleTable">

        {/* ===== HEADER ===== */}
     <thead>
  <tr>
    <th rowSpan={2}>S.No</th>

    {columns.map((col, i) =>
      col.sub.length > 0 ? (
        <th
          key={col.id}
          colSpan={col.sub.length}   // ✅ FIX
          onContextMenu={(e) => {
            e.preventDefault()
            setPopup({ x: e.clientX, y: e.clientY, index: i })
          }}
          onDoubleClick={(e) => {
            setPopup({ x: e.clientX, y: e.clientY, index: i })
          }}
        >
          {col.name}
        </th>
      ) : (
        <th
          key={col.id}
          rowSpan={2}   // ✅ ALSO IMPORTANT
          onContextMenu={(e) => {
            e.preventDefault()
            setPopup({ x: e.clientX, y: e.clientY, index: i })
          }}
          onDoubleClick={(e) => {
            setPopup({ x: e.clientX, y: e.clientY, index: i })
          }}
        >
          {col.name}
        </th>
      )
    )}
  </tr>

  <tr>
    {columns.map((col) =>
      col.sub.length > 0
        ? col.sub.map((sub, i) => (
            <th key={col.id + "_" + i}>{sub}</th>
          ))
        : null
    )}
  </tr>
</thead>

        {/* ===== BODY ===== */}
        <tbody>

          {rows.map((row, rIndex) => (
            <tr
              key={rIndex}
              onContextMenu={(e) => {
                e.preventDefault()
                setRowPopup({ x: e.clientX, y: e.clientY, index: rIndex })
              }}
              onDoubleClick={(e) => {
                setRowPopup({ x: e.clientX, y: e.clientY, index: rIndex })
              }}
            >

              {/* S.NO */}
              <td>{rIndex + 1}</td>

              {columns.map((col) =>

                col.sub.length > 0 ? (

                  // ✅ SUB COLUMN CASE
                  col.sub.map((_, sIndex) => {
                    const value = row[col.id][sIndex]

                    const isError =
                      col.type === "number" &&
                      col.subMax?.[sIndex] &&
                      Number(value) > Number(col.subMax[sIndex])

                    return (
                      <td key={col.id + "_" + sIndex}>
                        <textarea
                          value={value}
                          onChange={(e) => {
                            updateCell(rIndex, col.id, e.target.value, sIndex)
                            autoResize(e)
                          }}
                          onInput={autoResize}
                          className={`cellInput ${isError ? "error" : ""}`}
                          rows={1}
                        />
                      </td>
                    )
                  })

                ) : (

                  // ✅ NORMAL COLUMN CASE
                  (() => {
                    const value = row[col.id]

                    const isError =
                      col.type === "number" &&
                      col.max &&
                      Number(value) > Number(col.max)

                    return (
                      <td key={col.id}>
                        <textarea
                          value={value}
                          onChange={(e) => {
                            updateCell(rIndex, col.id, e.target.value)
                            autoResize(e)
                          }}
                          onInput={autoResize}
                          className={`cellInput ${isError ? "error" : ""}`}
                          rows={1}
                        />
                      </td>
                    )
                  })()

                )

              )}

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}