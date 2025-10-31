import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { PrintUtils } from "../../utils/printUtils";

const InwardPage = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    inwardNo: "",
    referenceNo: "",
  });

  const handlePrint = () => {
    PrintUtils.Print(materials); // pass your materials array
  };

  // Preloaded sample data (read-only or initial)
  const [sampleMaterials] = useState([
    { partNo: "WK2212160300", hsn: "73269099", palletName: "Pallet FS Big", qty: 3, price: 19365 },
    { partNo: "WK2212160301", hsn: "73269099", palletName: "Pallet FS Small", qty: 3, price: 12001 },
  ]);

  // Dynamic materials (user will add here)
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ material: "", quantity: "" });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Refs
  const qtyRefs = useRef([]);
  const newMatNameRef = useRef(null);
  const newMatQtyRef = useRef(null);
  const headerRefs = useRef([]);

  // ✅ Fetch customers from API
useEffect(() => {
  const fetchCustomers = async () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token found. Skipping customer fetch.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "https://115.124.111.111/FLS/public/api/options/getcustomers",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Validate response
      const data = response?.data;
      if (data?.status === "success" && Array.isArray(data?.data)) {
        setCustomers(data.data);
      } else if (Array.isArray(data)) {
        // handle case if API directly returns array
        setCustomers(data);
      } else {
        console.error("Unexpected API response format:", data);
        setCustomers([]); // reset on unexpected format
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customer list. Please try again later.");
      setCustomers([]); // reset on error
    } finally {
      setLoading(false);
    }
  };

  fetchCustomers();
}, []);

  // ✅ Auto-generate inward/ref numbers (only if empty)
  useEffect(() => {
    setFormData((prev) => {
      const randomInward = "INV-" + Math.floor(1000 + Math.random() * 9000);
      const randomRef = "REF-" + Math.floor(1000 + Math.random() * 9000);

      return {
        ...prev,
        inwardNo: prev.inwardNo || randomInward,
        referenceNo: prev.referenceNo || randomRef,
      };
    });
  }, []);

  // ✅ Save inward to localStorage
  const handleSave = () => {
    const newInward = {
      inwardNo: formData.inwardNo,
      customerName: formData.customerName,
      address: formData.address,
      referenceNo: formData.referenceNo,
      materials: [...materials],
    };

    const inwards = JSON.parse(localStorage.getItem("inwards")) || [];
    inwards.push(newInward);
    localStorage.setItem("inwards", JSON.stringify(inwards));

    alert("Inward saved successfully!");

    // Reset form
    setFormData({ customerName: "", address: "", inwardNo: "", referenceNo: "" });
    setMaterials([]);
  };

  // ✅ Navigation with Enter
  const handleKeyDown = (e, index, refsArray) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextField = refsArray.current[index + 1];
      if (nextField) {
        nextField.focus();
      }
    }
  };

  // ✅ Allow only numbers
  const isNumberKey = (e) => {
    const char = e.key;
    const allowed = "0123456789";
    const control = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (control.includes(char)) return;
    if (!allowed.includes(char)) e.preventDefault();
  };

  // ✅ Add material
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
    setTimeout(() => newMatNameRef.current?.focus(), 0);
  };

  // ✅ Remove material
  const handleRemove = (id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const challan = {
    type: "DELIVERY CHALLAN",
    from: `FABRIQUE LAUNDROMAT SERVICES PVT. LTD.
No 100, Muruganchery Village
Aranvoyalkuppam
Thiruvallur – 602 025
GST No: 33AACCF5181G2ZZ`,
    to: `APOLLO HOSPITALS
TONDAIRPET, CHENNAI`,
    receivedDate: "17.09.2025",
    sendingDate: "18.09.2025",
    slNo: "1074",
  };

  return (
    <div
      className="container"
      style={{ fontSize: "12px", paddingTop: "0px", paddingBottom: "70px", height: "90vh" }}
    >
      {/* Header Inputs */}
      <div className="row align-items-center g-1">
        {/* Customer Name (Dropdown from API) */}
        <div className="col-md-3">
          <select
            ref={(el) => (headerRefs.current[0] = el)}
            onKeyDown={(e) => handleKeyDown(e, 0, headerRefs)}
            className="form-select form-select-sm"
            style={{
              fontSize: "10px",
              height: "28px",
              padding: "0 2px",
              borderRadius: "8px",
            }}
            value={formData.customerName || ""}
            onChange={(e) => {
              const selectedName = e.target.value;
              setFormData({ ...formData, customerName: selectedName });

              const selectedCustomer = customers.find(
                (cust) => cust.customer_name === selectedName
              );
              if (selectedCustomer && selectedCustomer.address) {
                setFormData((prev) => ({
                  ...prev,
                  address: selectedCustomer.address,
                }));
              }
            }}
          >
            <option value="">
              {loading ? "Loading customers..." : "Select Customer"}
            </option>
            {customers.map((cust) => (
              <option key={cust.id} value={cust.customer_name}>
                {cust.customer_name}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div className="col-md-3">
          <textarea
            ref={(el) => (headerRefs.current[1] = el)}
            onKeyDown={(e) => handleKeyDown(e, 1, headerRefs)}
            className="form-control form-control-sm"
            rows={1}
            style={{
              fontSize: "10px",
              height: "20px",
              padding: "0 2px",
              borderRadius: "8px",
              resize: "none",
              overflow: "hidden",
            }}
            placeholder="Address"
            value={formData.address || ""}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* Reference No */}
        <div className="col-md-3">
          <input
            type="text"
            ref={(el) => (headerRefs.current[3] = el)}
            onKeyDown={(e) => handleKeyDown(e, 3, headerRefs)}
            className="form-control form-control-sm"
            style={{
              fontSize: "10px",
              height: "20px",
              padding: "0 2px",
              borderRadius: "8px",
            }}
            placeholder="Reference No."
            value={formData.referenceNo || ""}
            onChange={(e) =>
              setFormData({ ...formData, referenceNo: e.target.value })
            }
          />
        </div>
      </div>

      {/* Materials Table */}
      <div className="mt-3">
        <div className="card" style={{ height: "400px", marginBottom: "10px" }}>
          <div className="card-body p-0" style={{ height: "100%", overflow: "hidden" }}>
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

            <div style={{ height: "calc(100% - 35px)", overflowY: "auto" }}>
              <table className="table table-bordered table-sm mb-0" style={{ fontSize: "11px" }}>
                <tbody>
                  {materials.map((m, index) => (
                    <tr key={m.id} className="text-center">
                      <td style={{ width: "6%", padding: "2px" }}>{index + 1}</td>
                      <td style={{ padding: "2px" }}>{m.material}</td>
                      <td style={{ width: "14%", padding: "2px" }}>{m.quantity}</td>
                      <td style={{ width: "10%", padding: "2px" }}>
                        <button
                          className="btn btn-sm p-0"
                          title="Delete"
                          style={{ background: "transparent", border: "none" }}
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

        {/* Bottom Buttons */}
        <div
          className="card shadow-sm border-0"
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            width: "100%",
            zIndex: 1000,
          }}
        >
          <div className="card-body py-2 px-2 border-0">
            <div className="row g-1 align-items-center">
              <div className="col-md-8 d-flex align-items-center gap-2"></div>
              <div className="col-md-4 d-flex justify-content-end gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  style={{
                    padding: "2px 8px",
                    fontSize: "12px",
                    height: "28px",
                    borderRadius: "8px",
                  }}
                  onClick={handleSave}
                >
                  Save
                </button>

                <button
                  className="btn btn-success btn-sm"
                  style={{
                    padding: "2px 8px",
                    fontSize: "12px",
                    height: "28px",
                    borderRadius: "8px",
                  }}
                  onClick={async () => {
                    await handleSave();
                    handlePrint();
                  }}
                >
                  Save &amp; Print
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
