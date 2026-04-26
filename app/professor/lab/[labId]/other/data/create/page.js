"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Plus } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import DataTable from "../components/DataTable"
import "../components/dataTable.css"
import { useSearchParams } from "next/navigation"



export default function Page() {

  const { labId } = useParams()
  const searchParams = useSearchParams()
const editId = searchParams.get("edit")

  const [dataName, setDataName] = useState("")

  const [columns, setColumns] = useState([
    { id: "col_1", name: "Roll No", type: "text", sub: [] },
    { id: "col_2", name: "Name", type: "text", sub: [] }
  ])

  const [rows, setRows] = useState([
    { col_1: "", col_2: "" }
  ])
  const [settings, setSettings] = useState({
  student: "view"
})

  const [popup, setPopup] = useState(null)
  const [rowPopup, setRowPopup] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)

  const [newCol, setNewCol] = useState({
    name: "",
    type: "text",
    subEnabled: false,
    subNames: [],
    max: "",
    subMax: []
  })


  // CLOSE POPUPS
  useEffect(() => {
    function close() {
      setPopup(null)
      setRowPopup(null)
    }
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [])

  useEffect(() => {
  if (!editId) return

  async function fetchData() {
    const { data } = await supabase
      .from("data_sheets")
      .select("*")
      .eq("id", editId)
      .single()

    if (data) {
      setDataName(data.name)
      setColumns(data.columns)
      setRows(data.rows)
    }
  }

  fetchData()
}, [editId])

  // ================= ROW =================
  function addRow() {
    const obj = {}
    columns.forEach(c => {
      obj[c.id] = c.sub.length ? Array(c.sub.length).fill("") : ""
    })
    setRows([...rows, obj])
  }

  function removeRow(index) {
    const updated = [...rows]
    updated.splice(index, 1)
    setRows(updated)
  }

  // ================= EDIT COLUMN =================
  function handleEditColumn(index) {
    const col = columns[index]

    setNewCol({
      name: col.name,
      type: col.type,
      subEnabled: col.sub.length > 0,
      subNames: col.sub || [],
      max: col.max || "",
      subMax: col.subMax || []
    })

    setEditingIndex(index)
    setShowModal(true)
  }

  // ================= ADD / UPDATE COLUMN =================
  function addColumn() {

    if (!newCol.name.trim()) return alert("Enter column name")

    const column = {
      id: editingIndex !== null
        ? columns[editingIndex].id
        : "col_" + Date.now(),
      name: newCol.name,
      type: newCol.type,
      sub: newCol.subEnabled ? newCol.subNames : [],
      max: newCol.type === "number" ? Number(newCol.max || 0) : null,
      subMax: newCol.subEnabled ? newCol.subMax : []
    }

    if (editingIndex !== null) {
      const updated = [...columns]
      updated[editingIndex] = column
      setColumns(updated)
    } else {
      setColumns([...columns, column])

      const updatedRows = rows.map(r => ({
        ...r,
        [column.id]: column.sub.length
          ? Array(column.sub.length).fill("")
          : ""
      }))

      setRows(updatedRows)
    }

    // RESET
    setShowModal(false)
    setEditingIndex(null)
    setNewCol({
      name: "",
      type: "text",
      subEnabled: false,
      subNames: [],
      max: "",
      subMax: []
    })
  }

  // ================= DELETE COLUMN =================
  function deleteColumn(index) {
    const colId = columns[index].id

    const newCols = [...columns]
    newCols.splice(index, 1)

    const newRows = rows.map(r => {
      const copy = { ...r }
      delete copy[colId]
      return copy
    })

    setColumns(newCols)
    setRows(newRows)
    setPopup(null)
  }

  // ================= CELL =================
  function updateCell(rIndex, colId, value, subIndex = null) {
    const updated = [...rows]

    if (subIndex !== null) {
      updated[rIndex][colId][subIndex] = value
    } else {
      updated[rIndex][colId] = value
    }

    setRows(updated)
  }

  // ================= AUTOFILL =================
  async function autofill() {
    const { data } = await supabase
      .from("lab_members")
      .select(`user:users(name,email)`)
      .eq("lab_id", labId)
      .eq("role", "student")

    const list = (data || []).map(m => m.user)

    setRows(list.map(u => ({
      col_1: u.email.split("@")[0],
      col_2: u.name
    })))
  }

  // ================= SAVE =================
async function handleSave() {
  <div style={{ marginTop: "20px" }}>
  <h3>Settings</h3>

  <label>
    <input
      type="radio"
      checked={settings.student === "view"}
      onChange={() => setSettings({ student: "view" })}
    />
    View Only
  </label>

  <label style={{ marginLeft: "10px" }}>
    <input
      type="radio"
      checked={settings.student === "edit"}
      onChange={() => setSettings({ student: "edit" })}
    />
    View + Edit
  </label>
</div>

  if (!dataName.trim()) return alert("Enter sheet name")

  if (editId) {
    // UPDATE
    const { error } = await supabase
      .from("data_sheets")
      .update({
        name: dataName,
        columns,
        rows
      })
      .eq("id", editId)

    if (error) {
      console.error(error)
      alert("Update failed")
    } else {
      alert("Updated successfully")
    }

  } else {
    // INSERT
    const { error } = await supabase
      .from("data_sheets")
      .insert([{
        lab_id: labId,
        name: dataName,
        columns,
        rows
      }])

    if (error) {
      console.error(error)
      alert("Save failed")
    } else {
      alert("Saved successfully")
    }
  }
}

  return (
    <>
      <div className="container">

        <h1 className="title">Create Data</h1>

        <input
          value={dataName}
          onChange={(e) => setDataName(e.target.value)}
          placeholder="Enter sheet name..."
          className="input text-gray-700"
        />

        <div className="actions">
          <button onClick={autofill} className="btn blue transition transform hover:scale-102 active:scale-95 cursor-pointer">Autofill</button>

          <button
            onClick={() => setShowModal(true)}
            className="btn purple transition transform hover:scale-102 active:scale-95 cursor-pointer"
          >
            <Plus size={16}/> Add Column
          </button>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          updateCell={updateCell}
          setPopup={setPopup}
          setRowPopup={setRowPopup}
        />

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <button onClick={addRow} className="btn green transition transform hover:scale-102 active:scale-95 cursor-pointer">
            + Add Row
          </button>
        </div>

        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <button onClick={handleSave} className="btn green transition transform hover:scale-102 active:scale-95 cursor-pointer">
            Save
          </button>
        </div>

      </div>

      {/* COLUMN POPUP */}
      {popup && (
        <div style={{ top: popup.y, left: popup.x }} className="popup">

          {popup.index > 1 && (
            <button
            className="popupEdit"
            onClick={() => {
              handleEditColumn(popup.index)
              setPopup(null)
            }}
          >
            Edit
          </button>
          )}

          <button
            onClick={() => deleteColumn(popup.index)}
            className="danger"
          >
            Delete
          </button>
        </div>
      )}

      {/* ROW POPUP */}
      {rowPopup && (
        <div style={{ top: rowPopup.y, left: rowPopup.x }} className="popup transition transform hover:scale-102 active:scale-95 cursor-pointer">
          <button onClick={() => removeRow(rowPopup.index)}>
            Remove Row
          </button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modal">

            <input
              placeholder="Column Name"
              value={newCol.name}
              onChange={(e)=>setNewCol({...newCol,name:e.target.value})}
            />

            {/* TYPE */}
            <div className="typeToggle text-gray-700">
              <span
                className={newCol.type === "text" ? "active" : ""}
                onClick={() => setNewCol({ ...newCol, type: "text" })}
              >
                Text
              </span>

              <span
                className={newCol.type === "number" ? "active" : ""}
                onClick={() => setNewCol({ ...newCol, type: "number" })}
              >
                Numeric
              </span>
            </div>

            {/* MAX */}
            {newCol.type === "number" && (
              <input
                placeholder="Max Value"
                value={newCol.max}
                onChange={(e)=>setNewCol({...newCol,max:e.target.value})}
              />
            )}

            {/* SUB COLUMN */}
            <div className="subToggle py-2 text-black">
              <span>Sub Columns</span>
              <div
                className={`switch ${newCol.subEnabled ? "on" : ""}`}
                onClick={() =>
                  setNewCol({ ...newCol, subEnabled: !newCol.subEnabled })
                }
              >
                <div className="knob"></div>
              </div>
            </div>

            {newCol.subEnabled && (
              <>
                <input
                  type="number"
                  placeholder="No. of sub columns"
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    setNewCol({
                      ...newCol,
                      subNames: Array(n).fill(""),
                      subMax: Array(n).fill("")
                    })
                  }}
                />

                {newCol.subNames.map((_, i) => (
                  <div key={i} className="subInput">
                    <input
                      placeholder={`Name ${i + 1}`}
                      value={newCol.subNames[i]}
                      onChange={(e) => {
                        const arr = [...newCol.subNames]
                        arr[i] = e.target.value
                        setNewCol({ ...newCol, subNames: arr })
                      }}
                    />

                    {newCol.type === "number" && (
                      <input
                        placeholder="Max"
                        value={newCol.subMax[i]}
                        onChange={(e) => {
                          const arr = [...newCol.subMax]
                          arr[i] = e.target.value
                          setNewCol({ ...newCol, subMax: arr })
                        }}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            <div className="modalActions">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingIndex(null)
                }}
                className="btn transition transform active:scale-95 cursor-pointer"
                style={{ background: "#6b7280" }}
              >
                Cancel
              </button>

              <button
                onClick={addColumn}
                className="btn green transition transform active:scale-95 cursor-pointer"
              >
                {editingIndex !== null ? "Update" : "Add"}
              </button>
            </div>

          </div>
        </div>
      )}

    </>
  )
}