import React, { useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const InwardPage = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    inwardNo: "",
    referenceNo: "",
  });

  const [materials, setMaterials] = useState([
    { id: 1, material: "Cement", quantity: "", isEditing: true },
    { id: 2, material: "Sand", quantity: "", isEditing: true },
    { id: 3, material: "Bricks", quantity: "", isEditing: true },
  ]);

  // 🔑 Refs for all inputs
  const inputRefs = useRef([]);

  // ✅ Handle Enter key
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        console.log("End of inputs");
      }
    }
  };

  // ✅ Delete material
  const handleRemove = (id) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  return (
    <div className="container mt-3">
      <div className="card" style={{ height: "300px" }}>
        <div className="card-body p-2">
          <h6 className="mb-2">Inward Materials</h6>
          <div style={{ overflowY: "auto", maxHeight: "220px" }}>
            <table
              className="table table-bordered table-sm mb-0"
              style={{ fontSize: "11px" }}
            >
              <thead className="table-light text-center">
                <tr>
                  <th style={{ width: "6%" }}>Sl.No</th>
                  <th>Material</th>
                  <th style={{ width: "14%" }}>Quantity</th>
                  <th style={{ width: "10%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m, index) => (
                  <tr key={m.id} className="text-center">
                    <td>{index + 1}</td>
                    <td>{m.material}</td>
                    <td>
                      <input
                        type="text"
                        ref={(el) => (inputRefs.current[index] = el)} // store refs
                        value={m.quantity}
                        className="form-control form-control-sm text-center"
                        style={{
                          fontSize: "11px",
                          height: "22px",
                          padding: "0 4px",
                        }}
                        onChange={(e) => {
                          const updated = materials.map((row) =>
                            row.id === m.id
                              ? { ...row, quantity: e.target.value }
                              : row
                          );
                          setMaterials(updated);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-sm p-0"
                        title="Delete"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => handleRemove(m.id)}
                      >
                        <span
                          className="material-icons-two-tone text-danger"
                          style={{ fontSize: "16px", cursor: "pointer" }}
                        >
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InwardPage;
