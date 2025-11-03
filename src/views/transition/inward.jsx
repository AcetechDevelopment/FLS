import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { PrintUtils } from "../../utils/printUtils";
import { toast } from "react-toastify";

const InwardPage = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    inwardNo: "",
    referenceNo: "",
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ material: "", quantity: "" });

  const qtyRefs = useRef([]);
  const headerRefs = useRef([]);

  const handlePrint = () => {
    PrintUtils.Print(materials);
  };

  // ✅ Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Unauthorized. Please login again.");
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

        let customerList = [];
        const res = response.data;
        if (Array.isArray(res)) {
          customerList = res;
        } else if (Array.isArray(res?.data)) {
          customerList = res.data;
        } else if (Array.isArray(res?.customers)) {
          customerList = res.customers;
        } else if (Array.isArray(res?.data?.customers)) {
          customerList = res.data.customers;
        }

        customerList = customerList.filter((c) => c && c.id && c.customer_name);
        setCustomers(customerList);
      } catch (error) {
        console.error("❌ Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // ✅ Auto-generate inward/ref numbers
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

  // ✅ Handle customer change
  const handleCustomerChange = (e) => {
    const selectedName = e.target.value;
    setFormData({ ...formData, customerName: selectedName });

    const selectedCustomer = customers.find(
      (cust) => cust.customer_name === selectedName
    );

    if (selectedCustomer) {
      setSelectedCustomerId(selectedCustomer.id);
      setFormData((prev) => ({
        ...prev,
        address: selectedCustomer.address || "",
      }));

      if (Array.isArray(selectedCustomer.materials)) {
        setAvailableMaterials(selectedCustomer.materials);
      } else {
        setAvailableMaterials([]);
      }
    } else {
      setAvailableMaterials([]);
    }
  };

  // ✅ Add material row
  const handleAddMaterial = () => {
    if (!newMaterial.material || !newMaterial.quantity) {
      toast.warning("Please fill both Material and Quantity");
      return;
    }

    setMaterials((prev) => [...prev, { ...newMaterial, id: Date.now() }]);
    setNewMaterial({ material: "", quantity: "" });
  };

  // ✅ Remove material
  const handleRemove = (id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // ✅ Save inward via API
  const handleSave = async () => {
    if (!selectedCustomerId) {
      toast.warning("Please select a customer before saving!");
      return;
    }

    if (!materials.length) {
      toast.warning("Please add at least one material!");
      return;
    }

    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Unauthorized. Please login again.");
        return;
      }

      const payload = {
        inward_no: formData.inwardNo,
        reference_no: formData.referenceNo,
        customer_id: selectedCustomerId,
        address: formData.address,
        materials: materials.map((m) => ({
          material_name: m.material,
          quantity: m.quantity,
        })),
      };

      const response = await axios.post(
        "https://115.124.111.111/FLS/public/api/inward/create",
        payload,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.message?.toLowerCase().includes("success")) {
        toast.success("Inward saved successfully!");
        setMaterials([]);
      } else {
        toast.error(response.data?.message || "Failed to save inward!");
      }
    } catch (error) {
      console.error("❌ Error saving inward:", error);
      toast.error("Save failed. Please try again.");
    }
  };

  return (
    <div
      className="container"
      style={{
        fontSize: "12px",
        paddingTop: "0px",
        paddingBottom: "70px",
        height: "90vh",
      }}
    >
      {/* Header Inputs */}
      <div className="row align-items-center g-1">
        {/* Customer Dropdown */}
        <div className="col-md-3">
          <select
            ref={(el) => (headerRefs.current[0] = el)}
            className="form-select form-select-sm"
            style={{
              fontSize: "10px",
              height: "28px",
              padding: "0 2px",
              borderRadius: "8px",
            }}
            value={formData.customerName || ""}
            onChange={handleCustomerChange}
          >
            <option value="">
              {loading ? "Loading customers..." : "Select Customer"}
            </option>
            {customers.length > 0 ? (
              customers.map((cust) => (
                <option key={cust.id} value={cust.customer_name}>
                  {cust.customer_name}
                </option>
              ))
            ) : (
              !loading && <option disabled>No customers found</option>
            )}
          </select>
        </div>

        {/* Address */}
        <div className="col-md-3">
          <textarea
            ref={(el) => (headerRefs.current[1] = el)}
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
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>

        {/* Reference No */}
        <div className="col-md-3">
          <input
            type="text"
            ref={(el) => (headerRefs.current[3] = el)}
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
    <div
      className="card-body p-0"
      style={{ height: "100%", overflow: "hidden" }}
    >
      <table
        className="table table-bordered table-sm mb-0"
        style={{ fontSize: "11px" }}
      >
        <thead
          className="table-light text-center"
          style={{ position: "sticky", top: 0, zIndex: 2 }}
        >
          <tr style={{ fontSize: "11px", lineHeight: "1.6" }}>
            <th style={{ width: "6%", padding: "2px" }}>Sl.No</th>
            <th style={{ padding: "2px" }}>Material</th>
            <th style={{ width: "14%", padding: "2px" }}> Qty  </th>
            <th style={{ width: "10%", padding: "2px" }}> Price </th>
             {/* <th style={{ width: "14%", padding: "2px" }}>Qty</th> */}

          </tr>
        </thead>
      </table>

      <div style={{ height: "calc(100% - 35px)", overflowY: "auto" }}>
        <table
          className="table table-bordered table-sm mb-0"
          style={{ fontSize: "11px" }}
        >
       <tbody>
  {/* Existing Materials */}
  {materials.map((m, index) => (
    <tr key={m.id || index} className="text-center">
      <td style={{ width: "6%", padding: "2px" }}>{index + 1}</td>

      <td style={{ padding: "2px" }}>
        {m.material || m.material_name}
      </td>

      <td style={{ width: "14%", padding: "2px" }}>
        {m.quantity || m.qty}
      </td>

      {/* Price column: show price and small delete button */}
      <td style={{ width: "10%", padding: "2px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <span style={{ lineHeight: "1" }}>
            ₹{m.default_price ?? m.price ?? 0}
          </span>

          {/* delete button stays small and unobtrusive */}
          <button
            className="btn btn-sm p-0"
            title="Delete"
            style={{
              background: "transparent",
              border: "none",
              marginLeft: "6px",
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
        </div>
      </td>
    </tr>
  ))}

  {/* Available Materials with Qty Input and Price shown */}
  {availableMaterials.length > 0 && (
    <>
      {availableMaterials.map((mat, i) => (
        <tr key={mat.id || i} className="text-center">
          <td style={{ width: "6%", padding: "2px" }}>
            {materials.length + i + 1}
          </td>

          <td style={{ padding: "2px" }}>{mat.material_name}</td>

          <td style={{ width: "14%", padding: "2px" }}>
            <input
              type="number"
              min="0"
              value={mat.qty ?? ""}
              onChange={(e) => {
                const updated = [...availableMaterials];
                updated[i] = { ...updated[i], qty: e.target.value };
                setAvailableMaterials(updated);
              }}
              className="form-control form-control-sm text-center"
              style={{
                fontSize: "11px",
                height: "22px",
                padding: "0",
              }}
            />
          </td>

          {/* Price column: show price (no delete for available items) */}
          <td style={{ width: "10%", padding: "2px" }}>
            <span>₹{mat.default_price ?? mat.price ?? 0}</span>
          </td>
        </tr>
      ))}
    </>
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
      bottom: 0,
      right: 0,
      width: "100%",
      zIndex: 1000,
    }}
  >
    
    <div className="card-body py-2 px-2 border-0">
      <div className="row g-1 align-items-center">
        <div className="col-12 col-md-4 d-flex justify-content-md-end justify-content-center gap-2 flex-wrap ms-auto">
          <button
            className="btn btn-primary btn-sm"
            style={{
              padding: "2px 8px",
              fontSize: "12px",
              height: "28px",
              borderRadius: "8px",
              minWidth: "90px",
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
              minWidth: "110px",
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
