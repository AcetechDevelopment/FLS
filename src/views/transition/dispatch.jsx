// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { DispatchPrintUtils } from "../../utils/printdispatch";

// const BASE_URL = "https://115.124.111.111/FLS/public/api";

// const DispatchPage = () => {
//   const [formData, setFormData] = useState({
//     inwardNo: "",
//     customerName: "",
//     address: "",
//     dispatchNo: "",
//     referenceNo: "",
//   });

//   const [materials, setMaterials] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // 🔹 Auto-generate dispatch and reference numbers
//   useEffect(() => {
//     const randomDispatch = "DSP-" + Math.floor(1000 + Math.random() * 9000);
//     const randomRef = "REF-" + Math.floor(1000 + Math.random() * 9000);
//     setFormData((prev) => ({
//       ...prev,
//       dispatchNo: randomDispatch,
//       referenceNo: randomRef,
//     }));
//   }, []);

//   // 🔹 Fetch inward details via POST /options/getinwarddata
//   const fetchInwardDetails = async (inwardNo) => {
//     if (!inwardNo) {
//       alert("⚠️ Please enter Inward Number!");
//       return;
//     }

//     try {
//       setLoading(true);

//       const token =
//         localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
//       if (!token) {
//         alert("❌ No auth token found. Please login again.");
//         setLoading(false);
//         return;
//       }

//       // 🧩 Clean inward ID (remove INV prefix if present)
//       const inwardId = inwardNo.replace(/^INV0*/i, "");

//       const response = await axios.post(
//         `${BASE_URL}/options/getinwarddata`,
//         { inward_id: inwardId },
//         {
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("🔹 Inward API Response:", response.data);

//       // 🧩 Handle both possible structures (data or direct)
//       const inwardData = response.data.data || response.data;

//       if (inwardData && inwardData.customer_name) {
//         setFormData((prev) => ({
//           ...prev,
//           inwardNo,
//           customerName: inwardData.customer_name,
//           address: inwardData.address,
//         }));

//         // Handle items or materials
//         setMaterials(inwardData.items || inwardData.materials || []);
//         setShowModal(true);
//       } else {
//         alert("⚠️ No inward details found for this number!");
//         setMaterials([]);
//       }
//     } catch (err) {
//       console.error("❌ Fetch Error:", err);
//       if (err.response) {
//         alert(
//           `❌ Server Error ${err.response.status}: ${err.response.statusText}`
//         );
//       } else {
//         alert("❌ Failed to reach server.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Save dispatch (POST /dispatch/create)
//   const handleSave = async () => {
//     if (!materials.length) {
//       alert("⚠️ No materials to save!");
//       return;
//     }

//     try {
//       const token =
//         localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
//       if (!token) {
//         alert("❌ No auth token found. Please login again.");
//         return;
//       }

//       const payload = {
//         inward_no: formData.inwardNo,
//         dispatch_no: formData.dispatchNo,
//         reference_no: formData.referenceNo,
//         customer_name: formData.customerName,
//         address: formData.address,
//         materials: materials.map((m) => ({
//           material_id: m.material_id || m.id,
//           quantity: m.qty || m.quantity,
//         })),
//       };

//       const res = await axios.post(`${BASE_URL}/dispatch/create`, payload, {
//         headers: {
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (res.status === 200) {
//         alert("✅ Dispatch created successfully!");
//       } else {
//         alert("⚠️ Dispatch creation failed!");
//       }
//     } catch (err) {
//       console.error("❌ Save Error:", err);
//       alert("❌ Failed to save dispatch.");
//     }
//   };

//   // 🔹 Print dispatch
//   const handlePrint = () => {
//     if (!materials.length) {
//       alert("⚠️ No materials to print!");
//       return;
//     }
//     DispatchPrintUtils.Print({ ...formData, materials });
//   };

//   return (
//     <div className="container" style={{ fontSize: "12px" }}>
//       {/* -------- Form Inputs -------- */}
//       <div className="row align-items-center g-1">
//         <div className="col-md-3">
//           <input
//             type="text"
//             className="form-control form-control-sm"
//             style={{ fontSize: "10px", height: "18px", borderRadius: "8px" }}
//             placeholder="Inward Number"
//             value={formData.inwardNo}
//             onChange={(e) =>
//               setFormData({ ...formData, inwardNo: e.target.value })
//             }
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 fetchInwardDetails(formData.inwardNo);
//               }
//             }}
//           />
//         </div>

//         <div className="col-md-3">
//           <input
//             type="text"
//             className="form-control form-control-sm"
//             style={{ fontSize: "10px", height: "18px", borderRadius: "8px" }}
//             placeholder="Customer Name"
//             value={formData.customerName}
//             readOnly
//           />
//         </div>

//         <div className="col-md-4">
//           <textarea
//             className="form-control form-control-sm"
//             style={{ fontSize: "11px", height: "24px", borderRadius: "8px" }}
//             placeholder="Address"
//             value={formData.address}
//             readOnly
//           />
//         </div>

//         <div className="col-md-2">
//           <input
//             type="text"
//             className="form-control form-control-sm"
//             style={{ fontSize: "10px", height: "18px", borderRadius: "8px" }}
//             placeholder="Dispatch Number"
//             value={formData.dispatchNo}
//             readOnly
//           />
//         </div>
//       </div>

//       {/* -------- Save / Print Buttons -------- */}
//       <div className="card mt-3 shadow-sm">
//         <div className="card-body d-flex justify-content-end gap-2 p-2">
//           <button
//             className="btn btn-primary btn-sm"
//             style={{
//               padding: "2px 8px",
//               fontSize: "12px",
//               height: "28px",
//               borderRadius: "8px",
//             }}
//             onClick={handleSave}
//           >
//             Save
//           </button>

//           <button
//             className="btn btn-success btn-sm"
//             style={{
//               padding: "2px 8px",
//               fontSize: "12px",
//               height: "28px",
//               borderRadius: "8px",
//             }}
//             onClick={() => {
//               handleSave();
//               handlePrint();
//             }}
//           >
//             Save & Print
//           </button>
//         </div>
//       </div>

//       {/* -------- Modal Popup for Inward Data -------- */}
//       {showModal && (
//         <div
//           className="modal fade show d-block"
//           tabIndex="-1"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog modal-lg">
//             <div className="modal-content">
//               <div className="modal-header py-2 px-3">
//                 <h6 className="modal-title">Inward Details</h6>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body p-2">
//                 {loading ? (
//                   <p className="text-center">Loading...</p>
//                 ) : (
//                   <>
//                     <p>
//                       <strong>Inward No:</strong> {formData.inwardNo}
//                     </p>
//                     <p>
//                       <strong>Customer:</strong> {formData.customerName}
//                     </p>
//                     <p>
//                       <strong>Address:</strong> {formData.address}
//                     </p>
//                     <table
//                       className="table table-bordered table-sm mb-0"
//                       style={{ fontSize: "11px" }}
//                     >
//                       <thead className="table-light text-center">
//                         <tr>
//                           <th>Sl.No</th>
//                           <th>Material</th>
//                           <th>Quantity</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {materials.length > 0 ? (
//                           materials.map((m, i) => (
//                             <tr key={i} className="text-center">
//                               <td>{i + 1}</td>
//                               <td>{m.material_name || m.material}</td>
//                               <td>{m.qty || m.quantity}</td>
//                             </tr>
//                           ))
//                         ) : (
//                           <tr>
//                             <td colSpan="3" className="text-center text-muted">
//                               No materials found
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </>
//                 )}
//               </div>
//               <div className="modal-footer py-2">
//                 <button
//                   type="button"
//                   className="btn btn-secondary btn-sm"
//                   onClick={() => setShowModal(false)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DispatchPage;

import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { DispatchPrintUtils } from "../../utils/printdispatch";
import { toast } from "react-toastify";

const BASE_URL = "https://115.124.111.111/FLS/public/api";

const DispatchPage = () => {
  const [formData, setFormData] = useState({
    inwardNo: "",
    inwardCode: "",
    customerName: "",
    address: "",
    customerId: "",
  });

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch inward details
  const fetchInwardDetails = async (inwardCode) => {
    if (!inwardCode) return toast.warn("⚠️ Please enter Inward Number!");

    try {
      setLoading(true);
      const token =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("❌ No auth token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/options/getinwarddata/${inwardCode}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🔹 Inward API Response:", response.data);

      const inward = response.data.inward;
      if (inward && inward.customer) {
        const customerId =
          inward.customer.customer_id ||
          inward.customer.id ||
          inward.customer?.customer?.id ||
          "";
        const inwardId = inward.id || inward.inward_id || "";

        setFormData({
          inwardNo: inwardId,
          inwardCode: inward.inward_id || "",
          customerName: inward.customer.customer_name || "",
          address: inward.customer.address || "",
          customerId: customerId,
        });

        setMaterials(inward.items || []);
        console.log("✅ Extracted IDs → customer:", customerId, "inward:", inwardId);
      } else {
        toast.warn("⚠️ No inward details found for this number!");
        setFormData({
          inwardNo: "",
          inwardCode: "",
          customerName: "",
          address: "",
          customerId: "",
        });
        setMaterials([]);
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err.response?.data || err.message);
      toast.error("❌ Failed to fetch inward details.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Save dispatch (FormData format)
  const handleSave = async (printAfterSave = false) => {
    if (!materials.length) {
      toast.warn("⚠️ No materials to save!");
      return;
    }

    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("❌ No auth token found. Please login again.");
      return;
    }

    if (!formData.customerId || !formData.inwardNo) {
      toast.error("❌ Missing customer or inward details!");
      return;
    }

    try {
      const filtered = materials.filter(
        (m) => m.material_id && (m.total_qty || m.count || m.qty || 0) > 0
      );

      if (!filtered.length) {
        toast.warn("⚠️ No valid materials found.");
        return;
      }

      // 🔸 Prepare FormData (like inward page)
      const formDataToSend = new FormData();
      formDataToSend.append("customer_id", formData.customerId);
      formDataToSend.append("inward_id", formData.inwardNo);

      filtered.forEach((m) => {
        formDataToSend.append("material_id[]", m.material_id);
        formDataToSend.append(
          "qty[]",
          m.total_qty || m.count || m.qty || m.quantity || 0
        );
      });

      console.log("📦 Final Dispatch Payload:", Array.from(formDataToSend.entries()));

      const res = await axios.post(`${BASE_URL}/dispatch/create`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Dispatch Created:", res.data);
      toast.success("✅ Dispatch saved successfully!");

      if (printAfterSave) DispatchPrintUtils.Print({ ...formData, materials });
    } catch (err) {
      console.error("❌ Save Error:", err.response?.data || err.message);
      toast.error("❌ Failed to save dispatch. Check console for details.");
    }
  };

  return (
    <div className="container mt-3" style={{ fontSize: "12px" }}>
      {/* 🔹 Input Row */}
      <div className="row align-items-center g-2 mb-2">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "24px", borderRadius: "8px" }}
            placeholder="Inward Number"
            value={formData.inwardCode}
            onChange={(e) =>
              setFormData({ ...formData, inwardCode: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchInwardDetails(formData.inwardCode);
            }}
          />
        </div>

        <div className="col-md-3">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "24px", borderRadius: "8px" }}
            placeholder="Customer Name"
            value={formData.customerName}
            readOnly
          />
        </div>

        <div className="col-md-4">
          <textarea
            className="form-control form-control-sm"
            style={{ fontSize: "11px", height: "26px", borderRadius: "8px" }}
            placeholder="Address"
            value={formData.address}
            readOnly
          />
        </div>
      </div>

      {/* 🔹 Materials Table */}
      <div className="card shadow-sm">
        <div className="card-body p-2">
          {loading ? (
            <p className="text-center mb-0">Loading inward details...</p>
          ) : materials.length > 0 ? (
            <>
              <h6 className="fw-bold mb-2">Inward Details</h6>
              <table
                className="table table-bordered table-sm mb-2"
                style={{ fontSize: "11px" }}
              >
                <thead className="table-light text-center">
                  <tr>
                    <th style={{ width: "60px" }}>Sl.No</th>
                    <th>Material Name</th>
                    <th style={{ width: "120px" }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, i) => (
                    <tr key={i} className="text-center">
                      <td>{i + 1}</td>
                      <td>{m.material_name}</td>
                      <td>{m.total_qty || m.count || m.qty || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-center text-muted mb-0">
              No inward details available
            </p>
          )}
        </div>
      </div>

      {/* 🔹 Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          className="btn btn-primary btn-sm"
          style={{ padding: "3px 10px", fontSize: "12px", borderRadius: "8px" }}
          onClick={() => handleSave(false)}
        >
          Save
        </button>

        <button
          className="btn btn-success btn-sm"
          style={{ padding: "3px 10px", fontSize: "12px", borderRadius: "8px" }}
          onClick={() => handleSave(true)}
        >
          Save & Print
        </button>
      </div>
    </div>
  );
};

export default DispatchPage;