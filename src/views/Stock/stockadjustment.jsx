import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { MaterialContext } from "../../contexts/MaterialContext";
import { toast } from "react-toastify";

const StockAdjustment = () => {
  const { materials, setMaterials } = useContext(MaterialContext);
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  // const [savingId, setSavingId] = useState(null);
  const authToken = sessionStorage.getItem("authToken");

  // ✅ Fetch materials from API
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!authToken) return toast.error("Unauthorized. Please login again.");
      try {
        const response = await axios.get(
          "https://115.124.111.111/FLS/public/api/material/list",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.data) {
          setMaterials(response.data.data);
        } else {
          toast.warning("No materials found.");
        }
      } catch (error) {
        console.error("Fetch materials error:", error);
        toast.error("Failed to fetch materials.");
      }
    };

    fetchMaterials();
  }, [authToken, setMaterials]);

  const handleChange = (id, field, value) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: Number(value) } : m))
    );
  };

  const isNumberKey = (e, allowDecimal = false) => {
    const char = e.key;
    const allowedChars = "0123456789";
    const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (controlKeys.includes(char)) return;
    if (allowedChars.includes(char)) return;
    if (allowDecimal && char === "." && !e.target.value.includes(".")) return;
    e.preventDefault();
  };

  // ✅ Save API - updated endpoint
  const saveMaterial = async (material) => {
    if (!authToken) return toast.error("Session expired. Please login again.");

    setSavingId(material.id);
    try {
      const response = await axios.post(
        "https://115.124.111.111/FLS/public/api/material/stock-adjustment",
        {
          material_id: material.material_id,
          stock: material.weight, // Using 'weight' as stock
          default_price: material.default_price,
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

        // If API returns updated data, merge it
        if (response.data.data) {
          setMaterials((prev) =>
            prev.map((m) =>
              m.material_id === response.data.data.material_id
                ? { ...m, ...response.data.data }
                : m
            )
          );
        }
      } else {
        toast.error(response.data.message || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error(error.response?.data?.message || "Error updating stock");
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
                  <th>Material ID</th>
                  <th>Material Name</th>
                  <th>Material Type</th>
                  <th>Default Price</th>
                  <th>Current Stock</th>
                  {/* <th>Action</th> */}
                </tr>
              </thead>
              <tbody>
                {materials.length > 0 ? (
                  materials.map((m) => (
                    <tr key={m.id}>
                      <td className="text-center">{m.material_id}</td>
                      <td className="text-center">{m.material_name}</td>
                      <td className="text-center">{m.material_type}</td>

                      {/* Editable Default Price */}
                      <td className="text-center">
                        {editingCell.id === m.id && editingCell.field === "default_price" ? (
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={m.default_price || ""}
                            autoFocus
                            onKeyDown={(e) => isNumberKey(e, true)}
                            onChange={(e) =>
                              handleChange(m.id, "default_price", e.target.value)
                            }
                            onBlur={() => setEditingCell({ id: null, field: null })}
                          />
                        ) : (
                          <span
                            onClick={() =>
                              setEditingCell({ id: m.id, field: "default_price" })
                            }
                            style={{ cursor: "text", display: "block" }}
                          >
                            {m.default_price || 0}
                          </span>
                        )}
                      </td>

                      {/* Editable Stock */}
                      <td className="text-center">
                        {editingCell.id === m.id && editingCell.field === "weight" ? (
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={m.weight || ""}
                            autoFocus
                            onKeyDown={(e) => isNumberKey(e, false)}
                            onChange={(e) => handleChange(m.id, "weight", e.target.value)}
                            onBlur={() => setEditingCell({ id: null, field: null })}
                          />
                        ) : (
                          <span
                            onClick={() =>
                              setEditingCell({ id: m.id, field: "weight" })
                            }
                            style={{ cursor: "text", display: "block" }}
                          >
                            {m.weight || 0}
                          </span>
                        )}
                      </td>

                      {/* <td className="text-center">
                        <button
                          className="btn btn-sm btn-success"
                          disabled={savingId === m.id}
                          onClick={() => saveMaterial(m)}
                        >
                          {savingId === m.id ? "Saving..." : "Save"}
                        </button>
                      </td> */}

                      
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-2">
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
