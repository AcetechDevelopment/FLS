import { useContext, useState } from "react";
import axios from "axios";
import { MaterialContext } from "../../contexts/MaterialContext";
import { toast } from "react-toastify";

const StockAdjustment = () => {
  const { materials, setMaterials } = useContext(MaterialContext);
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  const [savingId, setSavingId] = useState(null);

  const authToken = sessionStorage.getItem("authToken"); // get token

  // ✅ Update material values locally
  const handleChange = (id, field, value) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, [field]: Number(value) } : m
      )
    );
  };

  // ✅ Number validation
  const isNumberKey = (e, allowDecimal = false) => {
    const char = e.key;
    const allowedChars = "0123456789";
    const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

    if (controlKeys.includes(char)) return;
    if (allowedChars.includes(char)) return;
    if (allowDecimal && char === "." && !e.target.value.includes(".")) return;

    e.preventDefault();
  };

  // ✅ Save changes for a single row
  const saveMaterial = async (material) => {
    if (!authToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setSavingId(material.id);
    try {
      const response = await axios.post(
        "https://115.124.111.111/FLS/public/api/material/stock-management",
        {
          id: material.id,
          stock: material.stock,
          defaultPrice: material.defaultPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Stock updated successfully!");
        setEditingCell({ id: null, field: null });
        // Optionally update local materials with response data
        const updated = response.data.data;
        if (updated) {
          setMaterials((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      } else {
        toast.error(response.data.message || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Error updating stock. Please try again.");
    } finally {
      setSavingId(null);
    }
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
                  <th className="py-2 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {materials.length > 0 ? (
                  materials.map((m) => (
                    <tr key={m.id}>
                      <td className="py-1 px-2 text-center">{m.materialCode}</td>
                      <td className="py-1 px-2 text-center">{m.materialName}</td>

                      {/* Default Price */}
                      <td className="py-1 px-2 text-center">
                        {editingCell.id === m.id && editingCell.field === "defaultPrice" ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={m.defaultPrice}
                            autoFocus
                            onKeyDown={(e) => isNumberKey(e, true)}
                            onChange={(e) =>
                              handleChange(m.id, "defaultPrice", e.target.value)
                            }
                            onBlur={() => setEditingCell({ id: null, field: null })}
                          />
                        ) : (
                          <span
                            onClick={() =>
                              setEditingCell({ id: m.id, field: "defaultPrice" })
                            }
                            style={{ cursor: "text", display: "block" }}
                          >
                            {m.defaultPrice || 0}
                          </span>
                        )}
                      </td>

                      {/* Current Stock */}
                      <td className="py-1 px-2 text-center">
                        {editingCell.id === m.id && editingCell.field === "stock" ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={m.stock}
                            autoFocus
                            onKeyDown={(e) => isNumberKey(e, false)}
                            onChange={(e) =>
                              handleChange(m.id, "stock", e.target.value)
                            }
                            onBlur={() => setEditingCell({ id: null, field: null })}
                          />
                        ) : (
                          <span
                            onClick={() => setEditingCell({ id: m.id, field: "stock" })}
                            style={{ cursor: "text", display: "block" }}
                          >
                            {m.stock || 0}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-1 px-2 text-center">
                        <button
                          className="btn btn-sm btn-success"
                          disabled={savingId === m.id}
                          onClick={() => saveMaterial(m)}
                        >
                          {savingId === m.id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-2">
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
