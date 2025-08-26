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
      <h6 className="mb-2">Inward Entry</h6>
      <div className="row">
        {/* Left Side */}
        <div className="col-md-6">
          <div className="mb-0">
  <label className="form-label mb-0" style={{ fontSize: "10px", lineHeight: "1" }}>
    Customer Name
  </label>
  <input
    type="text"
    className="form-control"
    style={{ height: "22px", fontSize: "11px", padding: "0 4px" }}
    value={formData.customerName}
    onChange={(e) =>
      setFormData({ ...formData, customerName: e.target.value })
    }
  />
</div>
          <div className="mb-1">
            <label className="form-label mb-0" style={{ fontSize: "11px" }}>
              Address
            </label>
            <textarea
              className="form-control form-control-sm"
              rows="2"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
        </div>

        {/* Right Side */}
      <div className="col-md-6">
  <div className="mb-0">
    <label className="form-label mb-0" style={{ fontSize: "10px" }}>
      Inward Number
    </label>
    <input
      type="text"
      className="form-control form-control-sm py-0"
      style={{ fontSize: "11px", height: "24px" }}
      value={formData.inwardNo}
      readOnly
    />
  </div>

  <div className="mb-0">
    <label className="form-label mb-0" style={{ fontSize: "10px" }}>
      Reference No.
    </label>
    <input
      type="text"
      className="form-control form-control-sm py-0"
      style={{ fontSize: "11px", height: "24px" }}
      value={formData.referenceNo}
      readOnly
    />
  </div>
</div>
      </div>

      {/* ✅ Material Table */}
      <div className="mt-3">
        <h6 className="mb-1">Materials</h6>
        <table
          className="table table-bordered table-sm"
          style={{ fontSize: "12px" }}
        >
        <thead className="table-light">
  <tr style={{ fontSize: "11px", lineHeight: "1" }}>
    <th style={{ width: "6%", padding: "2px" }}>Sl.No</th>
    <th style={{ padding: "2px" }}>Material</th>
    <th style={{ width: "14%", padding: "2px" }}>Qty</th>
    <th style={{ width: "10%", padding: "2px" }}>Action</th>
  </tr>
</thead>
          <tbody>
            {materials.map((m, index) => (
              <tr key={m.id}>
                <td>{index + 1}</td>
                <td>{m.material}</td>
                <td>{m.quantity}</td>
                <td>
                 <button
                    className="btn btn-sm p-0"
                    title="Delete"
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                      onClick={() => handleRemove(m.id)}
                    >
     <span
    className="material-icons-two-tone text-danger"
    style={{ fontSize: "16px" }}
  >
    delete
  </span>
</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Compact Input Row */}
        <div className="row g-1 align-items-center mt-1">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control form-control-sm"
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
                width: "26px",
                height: "26px",
                fontSize: "14px",
                padding: 0,
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
