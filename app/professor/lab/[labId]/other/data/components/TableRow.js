"use client"
import TableCell from "./TableCell"
import "./dataTable.css"

export default function TableRow({ row, columns, rowIndex, updateCell }) {

  function isExceed(val, max) {
    if (!max) return false
    return Number(val) > max
  }

  return (
    <div className="row">

      <div className="cell sno">{rowIndex + 1}</div>

      {columns.map(c => {

        let className =
          c.name === "Roll No" ? "cell roll" :
          c.name === "Name" ? "cell name" :
          "cell"

        return (
          <div key={c.id} className={className}>

            {c.sub.length > 0 ? (
              <div className="subRow">
                {c.sub.map((_, sIndex) => (
                  <TableCell
                    key={sIndex}
                    value={row[c.id][sIndex]}
                    onChange={(val) =>
                      updateCell(rowIndex, c.id, val, sIndex)
                    }
                    isError={isExceed(row[c.id][sIndex], c.subMax?.[sIndex])}
                  />
                ))}
              </div>
            ) : (
              <TableCell
                value={row[c.id]}
                onChange={(val) => updateCell(rowIndex, c.id, val)}
                isError={isExceed(row[c.id], c.max)}
              />
            )}

          </div>
        )
      })}

    </div>
  )
}