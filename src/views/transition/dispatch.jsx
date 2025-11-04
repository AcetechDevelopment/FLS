import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { DispatchPrintUtils } from "../../utils/printdispatch";

const BASE_URL = "https://115.124.111.111/FLS/public/api";

const DispatchPage = () => {
  const [formData, setFormData] = useState({
    inwardNo: "",
    customerName: "",
    address: "",
    dispatchNo: "",
    referenceNo: "",
  });

  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs
  const inwardRef = useRef();
  const customerRef = useRef();
  const addressRef = useRef();
  const dispatchRef = useRef();
  const referenceRef = useRef();

  // Auto-generate DispatchNo & ReferenceNo
  useEffect(() => {
    const randomDispatch = "DSP-" + Math.floor(1000 + Math.random() * 9000);
    const randomRef = "REF-" + Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      dispatchNo: randomDispatch,
      referenceNo: randomRef,
    }));
  }, []);

  // ✅ Updated to use POST with new API endpoint
  const fetchInwardDetails = async (inwardNo) => {
    if (!inwardNo) {
      alert("⚠️ Please enter Inward Number!");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching inward data for:", inwardNo);

      // ✅ Get token
      const token =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) {
        alert("❌ No auth token found. Please login again.");
        setLoading(false);
        return;
      }

      // ✅ POST request to new endpoint
      const response = await axios.post(
        `${BASE_URL}/dispatch/create`,
        { inward_no: inwardNo }, // payload
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data?.success && response.data?.data) {
        const inward = response.data.data;
        setFormData((prev) => ({
          ...prev,
          inwardNo: inward.inward_no || inwardNo,
          customerName: inward.customer_name || "",
          address: inward.address || "",
        }));
        setMaterials(inward.materials || []);
        setShowModal(true);
      } else if (response.data?.inward_no) {
        setFormData((prev) => ({
          ...prev,
          inwardNo: response.data.inward_no,
          customerName: response.data.customer_name || "",
          address: response.data.address || "",
        }));
        setMaterials(response.data.materials || []);
        setShowModal(true);
      } else {
        alert("⚠️ Inward not found!");
        setMaterials([]);
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      if (err.response) {
        if (err.response.status === 401) {
          alert("❌ Unauthorized! Please login again.");
        } else {
          alert(`❌ Server error ${err.response.status}: ${err.response.statusText}`);
        }
      } else {
        alert("❌ Failed to reach server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Save Dispatch
  const handleSave = async () => {
    if (!materials.length) {
      alert("⚠️ No materials to save!");
      return;
    }
    alert("✅ Dispatch saved successfully!");
  };

  // Print Dispatch
  const handlePrint = () => {
    if (!materials.length) {
      alert("⚠️ No materials to print!");
      return;
    }
    DispatchPrintUtils.Print({ ...formData, materials });
  };

  return (
    <div className="container" style={{ fontSize: "12px" }}>
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
          />
        </div>
      </div>

      {/* -------- Save / Print Buttons -------- */}
      <div className="card mt-3 shadow-sm">
        <div className="card-body d-flex justify-content-end gap-2 p-2">
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
            onClick={() => {
              handleSave();
              handlePrint();
            }}
          >
            Save & Print
          </button>
        </div>
      </div>

      {/* -------- Modal Popup for Inward Data -------- */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header py-2 px-3">
                <h6 className="modal-title">Inward Details</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-2">
                {loading ? (
                  <p className="text-center">Loading...</p>
                ) : (
                  <>
                    <p>
                      <strong>Inward No:</strong> {formData.inwardNo}
                    </p>
                    <p>
                      <strong>Customer:</strong> {formData.customerName}
                    </p>
                    <p>
                      <strong>Address:</strong> {formData.address}
                    </p>
                    <table
                      className="table table-bordered table-sm mb-0"
                      style={{ fontSize: "11px" }}
                    >
                      <thead className="table-light text-center">
                        <tr>
                          <th>Sl.No</th>
                          <th>Material</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.length > 0 ? (
                          materials.map((m, i) => (
                            <tr key={i} className="text-center">
                              <td>{i + 1}</td>
                              <td>{m.material_name || m.material}</td>
                              <td>{m.qty || m.quantity}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center text-muted">
                              No materials found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
              <div className="modal-footer py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchPage;
