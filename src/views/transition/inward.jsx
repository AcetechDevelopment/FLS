import React, { useState, useEffect, useRef } from "react";
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

  // Refs for qty inputs (rows) and bottom row inputs
  const qtyRefs = useRef([]);
  const newMatNameRef = useRef(null);
  const newMatQtyRef  = useRef(null);

  // Refs for top input fields
const headerRefs = useRef([]);

// Excel-style Enter navigation
const handleKeyDown = (e, index, refsArray) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const nextField = refsArray.current[index + 1];
    if (nextField) {
      nextField.focus();
    }
  }
};

  // Only numbers for Qty fields
  const isNumberKey = (e) => {
    const char = e.key;
    const allowed = "0123456789";
    const control = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (control.includes(char)) return;
    if (!allowed.includes(char)) e.preventDefault();
  };

  // Auto-generate inward/ref numbers
  useEffect(() => {
    const randomInward = "INV-" + Math.floor(1000 + Math.random() * 9000);
    const randomRef = "REF-" + Math.floor(1000 + Math.random() * 9000);

    setFormData((prev) => ({
      ...prev,
      inwardNo: randomInward,
      referenceNo: randomRef,
    }));
  }, []);

  // Add a material
  const handleAddMaterial = () => {
    if (!newMaterial.material.trim() || !newMaterial.quantity.trim()) return;

    setMaterials((prev) => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1,
        material: newMaterial.material.trim(),
        quantity: newMaterial.quantity.trim(),
        isEditing: false,
      },
    ]);

    setNewMaterial({ material: "", quantity: "" });
    // focus back to Material field
    setTimeout(() => newMatNameRef.current?.focus(), 0);
  };

  // Remove a material
  const handleRemove = (id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // When pressing Enter in qty: save current, open next, focus it; else go to bottom "Material"
  const handleQtyEnterAdvance = (rowIndex, rowId) => {
    setMaterials((prev) => {
      const nextIndex = rowIndex + 1;
      const updated = prev.map((r, i) => {
        if (r.id === rowId) return { ...r, isEditing: false };
        if (i === nextIndex) return { ...r, isEditing: true };
        return r;
      });

      // After state updates, focus appropriate input
      requestAnimationFrame(() => {
        if (qtyRefs.current[nextIndex]) {
          qtyRefs.current[nextIndex].focus();
        } else {
          // No next row → go to bottom Material input
          newMatNameRef.current?.focus();
        }
      });

      return updated;
    });
  };

  return (
   <div
  className="container"
  style={{
    fontSize: "12px",
    paddingBottom: 70,
    height: "90vh",       // full viewport height
    overflow: "hidden"     // prevents page scroll
  }}
>
      {/* Header Inputs */}
<div className="row align-items-center g-1 mt-2">
  {/* Customer Name */}
  <div className="col-md-3">
    <input
      type="text"
      ref={(el) => (headerRefs.current[0] = el)}
      onKeyDown={(e) => handleKeyDown(e, 0, headerRefs)}
      className="form-control form-control-sm"
      style={{ fontSize: "10px", height: "18px", padding: "0 2px", lineHeight: "1" }}
      placeholder="Customer Name"
      value={formData.customerName}
      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
    />
  </div>

  {/* Address */}
  <div className="col-md-3">
    <textarea
      ref={(el) => (headerRefs.current[1] = el)}
      onKeyDown={(e) => handleKeyDown(e, 1, headerRefs)}
      className="form-control form-control-sm"
      style={{ fontSize: "11px", height: "24px", padding: "0 4px" }}
      placeholder="Address"
      value={formData.address}
      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
    />
  </div>

  {/* Inward Number */}
  <div className="col-md-3">
    <input
      type="text"
      ref={(el) => (headerRefs.current[2] = el)}
      onKeyDown={(e) => handleKeyDown(e, 2, headerRefs)}
      className="form-control form-control-sm"
      style={{ fontSize: "10px", height: "18px", padding: "0 2px", lineHeight: "1" }}
      placeholder="Inward Number"
      value={formData.inwardNo}
      onChange={(e) => setFormData({ ...formData, inwardNo: e.target.value })}
    />
  </div>

  {/* Reference Number */}
  <div className="col-md-3">
    <input
      type="text"
      ref={(el) => (headerRefs.current[3] = el)}
      onKeyDown={(e) => handleKeyDown(e, 3, headerRefs)}
      className="form-control form-control-sm"
      style={{ fontSize: "10px", height: "18px", padding: "0 2px", lineHeight: "1" }}
      placeholder="Reference No."
      value={formData.referenceNo}
      onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
    />
  </div>
</div>

      {/* Materials Table */}
      <div className="mt-3">
        <div className="card" style={{ height: "400px" }}>
          <div className="card-body p-0" style={{ height: "100%", overflow: "hidden" }}>
            {/* Header table (sticky) */}
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

            {/* Scrollable body */}
            <div style={{ height: "calc(100% - 35px)", overflowY: "auto" }}>
              <table className="table table-bordered table-sm mb-0" style={{ fontSize: "11px" }}>
                <tbody>
                  {materials.map((m, index) => (
                    <tr key={m.id} className="text-center">
                      {/* Sl.No */}
                      <td style={{ width: "6%" }}>{index + 1}</td>

                      {/* Material */}
                      <td>{m.material}</td>

                      {/* Qty (click to edit) */}
                      <td style={{ width: "14%", padding: "2px" }}>
                        {m.isEditing ? (
                          <input
                            type="text"
                            ref={(el) => (qtyRefs.current[index] = el)}
                            autoFocus
                            className="form-control form-control-sm text-center"
                            style={{ fontSize: "11px", height: "22px", padding: "0 4px" }}
                            value={m.quantity}
                            onKeyDown={(e) => {
                              // numbers only + control keys
                              if (
                                !/[0-9]/.test(e.key) &&
                                !["Backspace", "Delete", "Tab", "Enter", "ArrowLeft", "ArrowRight"].includes(e.key)
                              ) {
                                e.preventDefault();
                              }
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleQtyEnterAdvance(index, m.id);
                              }
                            }}
                            onChange={(e) => {
                              const updated = materials.map((row) =>
                                row.id === m.id ? { ...row, quantity: e.target.value } : row
                              );
                              setMaterials(updated);
                            }}
                            onBlur={() => {
                              setMaterials((prev) =>
                                prev.map((row) =>
                                  row.id === m.id ? { ...row, isEditing: false } : row
                                )
                              );
                            }}
                          />
                        ) : (
                          <span
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setMaterials((prev) =>
                                prev.map((row) =>
                                  row.id === m.id ? { ...row, isEditing: true } : row
                                )
                              );
                              // Focus after the input appears
                              setTimeout(() => qtyRefs.current[index]?.focus(), 0);
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
                          style={{ background: "transparent", border: "none", cursor: "pointer" }}
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

                  {materials.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-2">
                        No materials yet. Add one below.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Fixed bottom input row (75% width) */}
      <div
  className="card shadow-sm border-0"
  style={{
    positionL:"fixed",
    bottom: 0,
    right: 0,
    width: "100%",
    zIndex: 1000,
  }}
>
  {/* Optional header */}


  {/* Body */}
  <div className="card-body py-2 px-2 border-0">

    <div className="row g-1 align-items-center">
      {/* Material */}
      <div className="col-md-6">
        <input
          ref={newMatNameRef}
          type="text"
          className="form-control form-control-sm"
          style={{ fontSize: "11px", height: "22px", padding: "0 4px" }}
          placeholder="Material"
          value={newMaterial.material}
          onChange={(e) =>
            setNewMaterial({ ...newMaterial, material: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              newMatQtyRef.current?.focus();
            }
          }}
        />
      </div>

      {/* Qty */}
      <div className="col-md-3">
        <input
          ref={newMatQtyRef}
          type="text"
          className="form-control form-control-sm"
          style={{ fontSize: "11px", height: "22px", padding: "0 4px" }}
          placeholder="Qty"
          value={newMaterial.quantity}
          onKeyDown={(e) => {
            isNumberKey(e);
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddMaterial();
            }
          }}
          onChange={(e) =>
            setNewMaterial({ ...newMaterial, quantity: e.target.value })
          }
        />
      </div>

      {/* Add Button */}
      <div className="col-md-3 d-flex">
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
          title="Add"
        >
          +
        </button>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default InwardPage;
