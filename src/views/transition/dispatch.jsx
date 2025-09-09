import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getInwardByNo, saveDispatch } from "../../utils/fakeapi";
import { DispatchPrintUtils } from "../../utils/printdispatch";

const DispatchPage = () => {
  const [formData, setFormData] = useState({
    inwardNo: "",
    customerName: "",
    address: "",
    dispatchNo: "",
    referenceNo: "",
  });

  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ material: "", quantity: "" });

  // 🔹 Refs
  const inwardRef = useRef();
  const customerRef = useRef();
  const addressRef = useRef();
  const dispatchRef = useRef();
  const referenceRef = useRef();
  const materialRef = useRef();
  const qtyRef = useRef();
  const addBtnRef = useRef();

  // 🔹 Auto-generate DispatchNo & ReferenceNo
  useEffect(() => {
    const randomDispatch = "DSP-" + Math.floor(1000 + Math.random() * 9000);
    const randomRef = "REF-" + Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      dispatchNo: randomDispatch,
      referenceNo: randomRef,
    }));
  }, []);

  // 🔹 Fetch inward details by number
  const fetchInwardDetails = (inwardNo) => {
    const inwards = JSON.parse(localStorage.getItem("inwards")) || [];
    const found = inwards.find((i) => i.inwardNo === inwardNo);
    if (found) {
      setFormData({
        inwardNo: found.inwardNo,
        customerName: found.customerName,
        address: found.address,
        referenceNo: found.referenceNo,
        dispatchNo: formData.dispatchNo,
      });
      setMaterials(found.materials || []);
    } else {
      alert("Inward not found!");
      setMaterials([]);
    }
  };

  // 🔹 Save Dispatch
  const handleSave = async () => {
    const dispatchData = {
      ...formData,
      materials,
      date: new Date().toISOString(),
    };

    if (!materials.length) {
      alert("⚠️ No materials to save!");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("dispatches")) || [];
    existing.push(dispatchData);
    localStorage.setItem("dispatches", JSON.stringify(existing));

    await saveDispatch(dispatchData);
    alert("✅ Dispatch saved!");
  };

  // 🔹 Print Dispatch
  const handlePrint = () => {
    const dispatchData = {
      ...formData,
      materials,
      date: new Date().toISOString(),
    };

    if (!materials.length) {
      alert("⚠️ No materials to print!");
      return;
    }

    DispatchPrintUtils.Print(dispatchData);
  };

  // 🔹 Add Material
  const handleAddMaterial = () => {
    if (!newMaterial.material || !newMaterial.quantity) return;
    setMaterials([...materials, { ...newMaterial, id: materials.length + 1 }]);
    setNewMaterial({ material: "", quantity: "" });
    materialRef.current && materialRef.current.focus();
  };

  // 🔹 Remove Material
  const handleRemove = (id) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  return (
    <div className="container" style={{ fontSize: "12px", }}>
      {/* -------- Form Inputs -------- */}
<div className="row align-items-center g-1">
  <div className="col-md-2">
    <input
      ref={inwardRef}
      type="text"
      className="form-control form-control-sm"
      style={{
        fontSize: "10px",
        height: "18px",
        padding: "0 2px",
        borderRadius: "8px",
      }}
      placeholder="Inward Number"
      value={formData.inwardNo}
      onChange={(e) =>
        setFormData({ ...formData, inwardNo: e.target.value })
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          fetchInwardDetails(formData.inwardNo);
          customerRef.current && customerRef.current.focus();
        }
      }}
    />
  </div>

  <div className="col-md-3">
    <input
      ref={customerRef}
      type="text"
      className="form-control form-control-sm"
      style={{ fontSize: "10px", height: "18px", borderRadius: "8px" }}
      placeholder="Customer Name"
      value={formData.customerName}
      readOnly
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addressRef.current && addressRef.current.focus();
        }
      }}
    />
  </div>

  <div className="col-md-3">
    <textarea
      ref={addressRef}
      className="form-control form-control-sm"
      style={{ fontSize: "11px", height: "24px", borderRadius: "8px" }}
      placeholder="Address"
      value={formData.address}
      readOnly
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          dispatchRef.current && dispatchRef.current.focus();
        }
      }}
    />
  </div>

  <div className="col-md-2">
    <input
      ref={dispatchRef}
      type="text"
      className="form-control form-control-sm"
      style={{ fontSize: "10px", height: "18px", borderRadius: "8px" }}
      placeholder="Dispatch Number"
      value={formData.dispatchNo}
      readOnly
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          referenceRef.current && referenceRef.current.focus();
        }
      }}
    />
  </div>

  <div className="col-md-2">
    <input
      ref={referenceRef}
      type="text"
      className="form-control form-control-sm"
      style={{ fontSize: "10px", height: "18px", borderRadius: "8px" }}
      placeholder="Reference No."
      value={formData.referenceNo}
      readOnly
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          // 👇 move to next logical element after reference (maybe a button?)
          nextButtonRef?.current?.focus();
        }
      }}
    />
  </div>
</div>

      {/* -------- Materials Table -------- */}
      <div className="mt-3">
        <table className="table table-bordered table-sm" style={{ fontSize: "11px" }}>
          <thead className="table-light text-center">
            <tr>
              <th style={{ width: "6%" }}>Sl.No</th>
              <th>Material</th>
              <th style={{ width: "14%" }}>Qty</th>
              <th style={{ width: "10%" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, index) => (
              <tr key={m.id} className="text-center">
                <td>{index + 1}</td>
                <td>{m.material}</td>
                <td>{m.quantity}</td>
                <td>
                  <button
                    className="btn btn-sm p-0"
                    onClick={() => handleRemove(m.id)}
                    style={{ background: "transparent", border: "none" }}
                  >
                    <span className="material-icons-two-tone text-danger" style={{ fontSize: "16px" }}>
                      delete
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* -------- Save / Print Buttons -------- */}
   <div className="card mt-3 shadow-sm">
  <div className="card-body d-flex justify-content-end gap-2 p-2">
    <button
      className="btn btn-primary btn-sm"
      style={{ padding: "2px 8px", fontSize: "12px", height: "28px", borderRadius: "8px" }}
      onClick={handleSave}
    >
      Save
    </button>

    <button
      className="btn btn-success btn-sm"
      style={{ padding: "2px 8px", fontSize: "12px", height: "28px", borderRadius: "8px" }}
      onClick={async () => {
        await handleSave();
        handlePrint();
      }}
    >
      Save & Print
    </button>
  </div>
</div>
      </div>
    </div>
  );
};

export default DispatchPage;
