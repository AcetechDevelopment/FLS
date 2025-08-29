import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const InwardPage = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    inwardNo: "",
    referenceNo: "",
  });

  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ material: "", quantity: "" });

  // ✅ Restrict input to numbers only
  const isNumberKey = (e) => {
    const char = e.key;
    const allowedChars = "0123456789";
    const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (controlKeys.includes(char)) return;
    if (!allowedChars.includes(char)) e.preventDefault();
  };

  // ✅ Auto-generate inward no & reference no
  useEffect(() => {
    const randomInward = "INV-" + Math.floor(1000 + Math.random() * 9000);
    const randomRef = "REF-" + Math.floor(1000 + Math.random() * 9000);

    setFormData((prev) => ({
      ...prev,
      inwardNo: randomInward,
      referenceNo: randomRef,
    }));
  }, []);

  // ✅ Add material
  const handleAddMaterial = () => {
    if (!newMaterial.material || !newMaterial.quantity) return;
    setMaterials([...materials, { ...newMaterial, id: materials.length + 1 }]);
    setNewMaterial({ material: "", quantity: "" });
  };

  // ✅ Remove material
  const handleRemove = (id) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  return (
    <div className="container" style={{ fontSize: "12px" }}>
      {/* 🔹 Header Inputs */}
      <div className="row align-items-center g-1">
        {/* Customer Name */}
        <div className="col-md-3">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "18px", padding: "0 2px", lineHeight: "1" }}
            placeholder="Customer Name"
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
          />
        </div>

        {/* Address */}
        <div className="col-md-3">
          <textarea
            className="form-control form-control-sm"
            style={{ fontSize: "11px", height: "24px", padding: "0 4px" }}
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>

        {/* Inward Number */}
{/* Inward Number */}
<div className="col-md-3">
  <input
    type="text"
    className="form-control form-control-sm"
    style={{
      fontSize: "10px",
      height: "18px",
      padding: "0 2px",
      lineHeight: "1"
    }}
    placeholder="Inward Number"
    value={formData.inwardNo}
    onChange={(e) =>
      setFormData({ ...formData, inwardNo: e.target.value })
    }
  />
</div>

       {/* Reference Number */}
      <div className="col-md-3">
        <input
          type="text"
          className="form-control form-control-sm"
          style={{
            fontSize: "10px",
            height: "18px",
            padding: "0 2px",
            lineHeight: "1",
          }}
          placeholder="Reference No."
          value={formData.referenceNo}
          onChange={(e) =>
            setFormData({ ...formData, referenceNo: e.target.value })
          }
        />
      </div>
      </div>

      {/* ✅ Material Table */}
      <div className="mt-3">

   <div className="card" style={{ height: "400px" /* adjust as needed */ }}>
  <div className="card-body p-0" style={{ height: "100%", overflow: "hidden" }}>
    {/* ✅ Table Header */}
    <table className="table table-bordered table-sm mb-0" style={{ fontSize: "11px" }}>
      <thead
        className="table-light text-center"
        style={{ position: "sticky", top: 0, zIndex: 2 }}
      >
        <tr style={{ fontSize: "11px", lineHeight: "1.6" }}>
          <th style={{ width: "6%", padding: "2px" }}>Sl.No</th>
          <th style={{ padding: "2px" }}>Material</th>
          <th style={{ width: "14%", padding: "2px" }}>Qty</th>
          <th style={{ width: "10%", padding: "2px" }}>Action</th>
        </tr>
      </thead>
    </table>

    {/* ✅ Scrollable Table Body */}
    <div style={{ height: "calc(100% - 35px)", overflowY: "auto" }}>
      <table
        className="table table-bordered table-sm mb-0"
        style={{ fontSize: "11px" }}
      >
        <tbody>
          {materials.map((m, index) => (
            <tr key={m.id} className="text-center">
              {/* Sl.No */}
              <td style={{ width: "6%" }}>{index + 1}</td>

              {/* Material */}
              <td>{m.material}</td>

              {/* Editable Qty */}
              <td style={{ width: "14%", padding: "2px" }}>
                {m.isEditing ? (
                  <input
                    type="text"
                    autoFocus
                    className="form-control form-control-sm text-center"
                    style={{ fontSize: "11px", height: "22px", padding: "0 4px" }}
                    value={m.quantity}
                    onKeyDown={(e) => {
                      // Allow only numbers
                      if (
                        !/[0-9]/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "Tab" &&
                        e.key !== "Enter" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight"
                      ) {
                        e.preventDefault();
                      }
                      // Press Enter to save
                      if (e.key === "Enter") {
                        const updated = materials.map((row) =>
                          row.id === m.id ? { ...row, isEditing: false } : row
                        );
                        setMaterials(updated);
                      }
                    }}
                    onChange={(e) => {
                      const updated = materials.map((row) =>
                        row.id === m.id ? { ...row, quantity: e.target.value } : row
                      );
                      setMaterials(updated);
                    }}
                    onBlur={() => {
                      const updated = materials.map((row) =>
                        row.id === m.id ? { ...row, isEditing: false } : row
                      );
                      setMaterials(updated);
                    }}
                  />
                ) : (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const updated = materials.map((row) =>
                        row.id === m.id ? { ...row, isEditing: true } : row
                      );
                      setMaterials(updated);
                    }}
                  >
                    {m.quantity}
                  </span>
                )}
              </td>

              {/* Action */}
              <td style={{ width: "10%" }}>
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



{/* ✅ Input Row for New Material (Fixed Bottom, 75% width) */}
<div className="row g-1 align-items-center bg-light border-top"
  style={{
    position: "fixed",
    bottom: 0,
    right: 0,
    width: "75%",
    margin: "0 auto",
    padding: "6px 10px",
    zIndex: 1000,
  }}
>
  <div className="col-md-6">
    <input
      type="text"
      className="form-control form-control-sm"
      style={{ fontSize: "11px", height: "22px", padding: "0 4px" }}
      placeholder="Material"
      value={newMaterial.material}
      onChange={(e) =>
        setNewMaterial({ ...newMaterial, material: e.target.value })
      }
    />
  </div>
  <div className="col-md-3">
    <input
      type="text"
      className="form-control form-control-sm"
      style={{ fontSize: "11px", height: "22px", padding: "0 4px" }}
      placeholder="Qty"
      value={newMaterial.quantity}
      onKeyDown={isNumberKey}
      onChange={(e) =>
        setNewMaterial({ ...newMaterial, quantity: e.target.value })
      }
    />
  </div>
  <div className="col-md-3">
    <button
      className="btn btn-success btn-sm d-flex align-items-center justify-content-center"
      onClick={handleAddMaterial}
      style={{
        borderRadius: "50%",
        width: "22px",
        height: "22px",
        fontSize: "13px",
        padding: 0,
        cursor: "pointer",
      }}
    >
      +
    </button>
  </div>
</div>
  </div>
    </div>
  );
};

export default InwardPage;
