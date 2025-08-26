import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const DispatchPage = () => {
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [materials, setMaterials] = useState([]);

  // ✅ Auto-generate dispatch number (simple timestamp for demo)
  const dispatchNo = "DSP-" + Date.now().toString().slice(-5);

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Dispatch Entry</h4>

      {/* 🔹 Top Section */}
      <div className="row mb-4">
        {/* Left Side */}
        <div className="col-md-6">
          <div className="mb-2">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter Customer Name"
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Address</label>
            <textarea
              className="form-control form-control-sm"
              rows="2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Address"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="col-md-6">
          <div className="mb-2">
            <label className="form-label">Dispatch No</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={dispatchNo}
              readOnly
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Reference No</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="Enter Reference No"
            />
          </div>
        </div>
      </div>

      {/* 🔹 Materials Table */}
      <table className="table table-bordered table-sm">
        <thead className="table-light">
          <tr>
            <th style={{ width: "10%" }}>Sl.No</th>
            <th style={{ width: "50%" }}>Material</th>
            <th style={{ width: "20%" }}>Quantity</th>
            <th style={{ width: "20%" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((num) => {
            const row = materials[num - 1];
            return (
              <tr key={num}>
                <td>{num}</td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Enter Material"
                    value={row ? row.material : ""}
                    onChange={(e) => {
                      const updated = [...materials];
                      updated[num - 1] = {
                        ...(row || { id: num, material: "", quantity: "" }),
                        material: e.target.value,
                      };
                      setMaterials(updated);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Qty"
                    value={row ? row.quantity : ""}
                    onChange={(e) => {
                      const updated = [...materials];
                      updated[num - 1] = {
                        ...(row || { id: num, material: "", quantity: "" }),
                        quantity: e.target.value,
                      };
                      setMaterials(updated);
                    }}
                  />
                </td>
                <td>
                  {row ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        setMaterials(materials.filter((_, i) => i !== num - 1))
                      }
                    >
                      Remove
                    </button>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DispatchPage;
