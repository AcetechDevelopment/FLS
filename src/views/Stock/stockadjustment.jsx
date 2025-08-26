import { useContext, useState } from "react";
import { MaterialContext } from "../../contexts/MaterialContext";

const StockAdjustment = () => {
  const { materials, setMaterials } = useContext(MaterialContext);
  const [editingCell, setEditingCell] = useState({ id: null, field: null });

  // ✅ Update material values
  const handleChange = (id, field, value) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, [field]: Number(value) } : m
      )
    );
  };

  // ✅ Reusable number validation (allowDecimal = true → price, false → stock)
  const isNumberKey = (e, allowDecimal = false) => {
    const char = e.key;
    const allowedChars = "0123456789";
    const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

    // ✅ Allow navigation & editing keys
    if (controlKeys.includes(char)) return;

    // ✅ Allow only digits
    if (allowedChars.includes(char)) return;

    // ✅ Allow decimal point only if enabled and not already present
    if (allowDecimal && char === "." && !e.target.value.includes(".")) return;

    // ❌ Block everything else
    e.preventDefault();
  };

  // ✅ Inline input style (looks same as table text)
  const inputStyle = {
    width: "100%",
    height: "100%",
    textAlign: "center",
    border: "none",
    outline: "none",
    background: "transparent",
    boxSizing: "border-box",
    fontSize: "12px",
  };

  return (
    <div className="container mt-3">
      <h5 className="mb-3">Stock Adjustment</h5>
      <div className="table-responsive">
        <table
          id="stock-adjustment-table"
          className="table table-bordered table-striped align-middle text-center"
          style={{ fontSize: "12px" }}
        >
          <thead className="table-primary" style={{ fontSize: "12px" }}>
            <tr>
              <th className="py-1 px-1">Material Code</th>
              <th className="py-1 px-1">Material Name</th>
              <th className="py-1 px-1">Default Price</th>
              <th className="py-1 px-1">Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {materials.length > 0 ? (
              materials.map((m) => (
                <tr key={m.id}>
                  {/* Material Code */}
                  <td className="py-1 px-1">{m.materialCode}</td>

                  {/* Material Name */}
                  <td className="py-1 px-1">{m.materialName}</td>


        {/* ✅ Default Price (editable, only numbers allowed now) */}
{/* <td className="py-1 px-1">
  {editingCell.id === m.id && editingCell.field === "defaultPrice" ? (
    <input
      type="text"
      value={m.defaultPrice}
      autoFocus
      onKeyDown={isNumberKey}   // ✅ restrict input
      onChange={(e) =>
        handleChange(m.id, "defaultPrice", e.target.value)
      }
      onBlur={() => setEditingCell({ id: null, field: null })}
      style={inputStyle}
      placeholder="Enter price"
    />
  ) : (
    <span
      onClick={() =>
        setEditingCell({ id: m.id, field: "defaultPrice" })
      }
      style={{ display: "block", cursor: "text" }}
    >
      {m.defaultPrice || 0}
    </span>
  )}
</td> */}

  {/* <td className="py-1 px-1">
  {editingCell.id === m.id && editingCell.field === "defaultPrice" ? (
    <input
      type="text"
      className="form-control form-control-sm"   // ✅ Bootstrap style
      value={m.defaultPrice}
      autoFocus
      onKeyDown={isNumberKey}   // ✅ restrict input
      onChange={(e) =>
        handleChange(m.id, "defaultPrice", e.target.value)
      }
      onBlur={() => setEditingCell({ id: null, field: null })}
      placeholder="Enter price"
    />
  ) : (
    <span
      onClick={() =>
        setEditingCell({ id: m.id, field: "defaultPrice" })
      }
      style={{ display: "block", cursor: "text" }}
    >
      {m.defaultPrice || 0}
    </span>
  )}
</td> */}


<td className="py-1 px-1">
  {editingCell.id === m.id && editingCell.field === "defaultPrice" ? (
    <input
      type="text"
      className="form-control form-control-sm"   // ✅ Bootstrap input
      value={m.defaultPrice}
      autoFocus
      onKeyDown={isNumberKey}   // ✅ restrict input
      onChange={(e) =>
        handleChange(m.id, "defaultPrice", e.target.value)
      }
      onBlur={() => setEditingCell({ id: null, field: null })}
      placeholder="Enter price"
    />
  ) : (
    <span
      onClick={() =>
        setEditingCell({ id: m.id, field: "defaultPrice" })
      }
      style={{ display: "block", cursor: "text" }}
    >
      {m.defaultPrice || 0}
    </span>
  )}
</td>


{/* ✅ Current Stock (editable, only integers allowed) */}

<td className="py-1 px-1">
  {editingCell.id === m.id && editingCell.field === "stock" ? (
    <input
      type="text"
      className="form-control form-control-sm"   // ✅ Bootstrap input
      value={m.stock}
      autoFocus
      onKeyDown={(e) => isNumberKey(e, false)}   // ❌ only integers
      onChange={(e) =>
        handleChange(m.id, "stock", e.target.value)
      }
      onBlur={() => setEditingCell({ id: null, field: null })}
      placeholder="Enter stock"
    />
  ) : (
    <span
      onClick={() =>
        setEditingCell({ id: m.id, field: "stock" })
      }
      style={{ display: "block", cursor: "text" }}
    >
      {m.stock || 0}
    </span>
  )}
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted py-2">
                  No materials found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockAdjustment;