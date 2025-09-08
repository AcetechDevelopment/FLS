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

  // ✅ Reusable number validation
  const isNumberKey = (e, allowDecimal = false) => {
    const char = e.key;
    const allowedChars = "0123456789";
    const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

    if (controlKeys.includes(char)) return;
    if (allowedChars.includes(char)) return;
    if (allowDecimal && char === "." && !e.target.value.includes(".")) return;

    e.preventDefault();
  };

  return (
    <div className="container mt-3">
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-3">
          <h5 className="mb-3 fw-semibold text-primary">🛠 Stock Adjustment</h5>

          <div className="table-responsive">
            <table
              id="stock-adjustment-table"
              className="table table-sm table-hover table-bordered align-middle mb-0"
              style={{ fontSize: "12px" }}
            >
              <thead className="table-primary text-center">
             <tr>
          <th className="py-2 px-2 text-center">Material Code</th>
          <th className="py-2 px-2 text-center">Material Name</th>
          <th className="py-2 px-2 text-center">Default Price</th>
          <th className="py-2 px-2 text-center">Current Stock</th>
         </tr>
              </thead>
              <tbody>
                {materials.length > 0 ? (
                  materials.map((m) => (
                    <tr key={m.id}>
                      {/* Material Code */}
                      <td className="py-1 px-2 text-center">{m.materialCode}</td>

                      {/* Material Name */}
                      <td className="py-1 px-2 text-center">{m.materialName}</td>

                      {/* ✅ Default Price (editable, allow decimals) */}
                      <td className="py-1 px-2 text-center">
                        {editingCell.id === m.id && editingCell.field === "defaultPrice" ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={m.defaultPrice}
                            autoFocus
                            onKeyDown={(e) => isNumberKey(e, true)} // allow decimals
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

                      {/* ✅ Current Stock (editable, integers only) */}
                      <td className="py-1 px-2 text-center">
                        {editingCell.id === m.id && editingCell.field === "stock" ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={m.stock}
                            autoFocus
                            onKeyDown={(e) => isNumberKey(e, false)} // integers only
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
      </div>
    </div>
  );
};

export default StockAdjustment;
