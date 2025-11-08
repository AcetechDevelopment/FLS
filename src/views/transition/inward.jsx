// import React, { useState, useEffect, useRef } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import axios from "axios";
// import { PrintUtils } from "../../utils/printUtils";
// import { toast } from "react-toastify";

// const BASE_URL = "https://115.124.111.111/FLS/public/api";

// const InwardPage = () => {
//   const [formData, setFormData] = useState({
//     customerName: "",
//     address: "",
//     inwardNo: "",
//   });

//   const [selectedCustomerId, setSelectedCustomerId] = useState(null);
//   const [customers, setCustomers] = useState([]);
//   const [availableMaterials, setAvailableMaterials] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const headerRefs = useRef([]);

//   const handlePrint = () => {
//     PrintUtils.Print(availableMaterials);
//   };

//   // ✅ Fetch customers
//   useEffect(() => {
//     const fetchCustomers = async () => {
//       const token = sessionStorage.getItem("authToken");
//       if (!token) {
//         toast.error("Unauthorized. Please login again.");
//         return;
//       }

//       try {
//         setLoading(true);
//         const response = await axios.get(`${BASE_URL}/options/getcustomers`, {
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         let customerList = [];
//         const res = response.data;
//         if (Array.isArray(res)) customerList = res;
//         else if (Array.isArray(res?.data)) customerList = res.data;
//         else if (Array.isArray(res?.customers)) customerList = res.customers;
//         else if (Array.isArray(res?.data?.customers))
//           customerList = res.data.customers;

//         customerList = customerList.filter(
//           (c) => c && c.id && c.customer_name
//         );
//         setCustomers(customerList);
//       } catch (error) {
//         console.error("❌ Error fetching customers:", error);
//         toast.error("Failed to fetch customer data.");
//         setCustomers([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCustomers();
//   }, []);



//   // ✅ Handle customer change
//   const handleCustomerChange = (e) => {
//     const selectedName = e.target.value;
//     setFormData({ ...formData, customerName: selectedName });

//     const selectedCustomer = customers.find(
//       (cust) => cust.customer_name === selectedName
//     );

//     if (selectedCustomer) {
//       setSelectedCustomerId(selectedCustomer.id);
//       setFormData((prev) => ({
//         ...prev,
//         address: selectedCustomer.address || "",
//       }));

//       if (Array.isArray(selectedCustomer.materials)) {
//         const formatted = selectedCustomer.materials.map((m, i) => ({
//           sl_no: i + 1,
//           material_id: m.material_id || m.id, // ✅ store the real material id
//           material_name: m.material_name || m.name,
//           qty: m.qty || 1,
//           default_price: m.default_price || m.price || 0,
//         }));
//         setAvailableMaterials(formatted);
//       } else {
//         setAvailableMaterials([]);
//       }
//     } else {
//       setAvailableMaterials([]);
//     }
//   };


//   // ✅ Save inward data as FormData (for multipart/form-data)
//   const handleSave = async () => {
//     try {
//       const token = sessionStorage.getItem("authToken");
//       if (!token) {
//         toast.error("Unauthorized. Please login again.");
//         return;
//       }

//       if (!selectedCustomerId) {
//         toast.error("Please select a customer.");
//         return;
//       }

//       const filteredMaterials = availableMaterials.filter(
//         (m) => m.material_id && m.qty && Number(m.qty) > 0
//       );

//       if (filteredMaterials.length === 0) {
//         toast.error("At least one material with quantity is required.");
//         return;
//       }

//       const formDataToSend = new FormData();
//       formDataToSend.append("customer_id", selectedCustomerId);
//       formDataToSend.append("reference_id", formData.referenceNo || "");

//       filteredMaterials.forEach((mat) => {
//         formDataToSend.append("material_id[]", mat.material_id);
//         formDataToSend.append("qty[]", mat.qty);
//       });

//       const response = await axios.post(`${BASE_URL}/inward/create`, formDataToSend, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: "application/json",
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       console.log("✅ Save success:", response.data);
//       toast.success("Inward saved successfully!");
//       setFormData((prev) => ({
//         ...prev,
//         inwardNo: response.data.inward_id,
//       }));
//       setShowModal(true);
//     } catch (error) {
//       console.error("❌ Save Error:", error.response?.data || error.message);
//       toast.error(
//         `Validation Error: ${JSON.stringify(
//           error.response?.data?.errors || error.response?.data
//         )}`
//       );
//     }
//   };

//   // ✅ UI
//   return (
//     <div
//       className="container"
//       style={{
//         fontSize: "12px",
//         paddingTop: "0px",
//         paddingBottom: "70px",
//         height: "90vh",
//       }}
//     >
//       {/* Header Inputs */}
//       <div className="row align-items-center g-1">
//         <div className="col-md-3">
//           <select
//             ref={(el) => (headerRefs.current[0] = el)}
//             className="form-select form-select-sm"
//             style={{
//               fontSize: "10px",
//               height: "28px",
//               padding: "0 2px",
//               borderRadius: "8px",
//             }}
//             value={formData.customerName || ""}
//             onChange={handleCustomerChange}
//           >
//             <option value="">
//               {loading ? "Loading customers..." : "Select Customer"}
//             </option>
//             {customers.length > 0 ? (
//               customers.map((cust) => (
//                 <option key={cust.id} value={cust.customer_name}>
//                   {cust.customer_name}
//                 </option>
//               ))
//             ) : (
//               !loading && <option disabled>No customers found</option>
//             )}
//           </select>
//         </div>

//         <div className="col-md-3">
//           <textarea
//             ref={(el) => (headerRefs.current[1] = el)}
//             className="form-control form-control-sm"
//             rows={1}
//             style={{
//               fontSize: "10px",
//               height: "20px",
//               padding: "0 2px",
//               borderRadius: "8px",
//               resize: "none",
//               overflow: "hidden",
//             }}
//             placeholder="Address"
//             value={formData.address || ""}
//             onChange={(e) =>
//               setFormData({ ...formData, address: e.target.value })
//             }
//           />
//         </div>

//         <div className="col-md-3">
//           <input
//             type="text"
//             ref={(el) => (headerRefs.current[2] = el)}
//             className="form-control form-control-sm"
//             style={{
//               fontSize: "10px",
//               height: "20px",
//               padding: "0 2px",
//               borderRadius: "8px",
//             }}
//             placeholder="Inward No."
//             value={formData.inwardNo || ""}
//             readOnly
//           />
//         </div>

//         <div className="col-md-3">
//           <input
//             type="text"
//             ref={(el) => (headerRefs.current[3] = el)}
//             className="form-control form-control-sm"
//             style={{
//               fontSize: "10px",
//               height: "20px",
//               padding: "0 2px",
//               borderRadius: "8px",
//             }}
//             placeholder="Reference No."
//             value={formData.referenceNo || ""}
//             onChange={(e) =>
//               setFormData({ ...formData, referenceNo: e.target.value })
//             }
//           />
//         </div>
//       </div>

//       {/* Materials Table */}
//       <div className="mt-3">
//         <div className="card" style={{ height: "400px", marginBottom: "10px" }}>
//           <div className="card-body p-0" style={{ height: "100%", overflow: "hidden" }}>
//             <table className="table table-bordered table-sm mb-0" style={{ fontSize: "11px" }}>
//               <thead className="table-light text-center" style={{ position: "sticky", top: 0, zIndex: 2 }}>
//                 <tr style={{ fontSize: "11px", lineHeight: "1.6" }}>
//                   <th style={{ width: "6%", padding: "2px" }}>Sl.No</th>
//                   <th style={{ padding: "2px" }}>Material</th>
//                   <th style={{ width: "14%", padding: "2px" }}>Qty</th>
//                   <th style={{ width: "10%", padding: "2px" }}>Price</th>
//                 </tr>
//               </thead>
//             </table>

//             <div style={{ height: "calc(100% - 35px)", overflowY: "auto" }}>
//               <table className="table table-bordered table-sm mb-0" style={{ fontSize: "11px" }}>
//                 <tbody>
//                   {availableMaterials.map((mat, i) => (
//                     <tr key={mat.material_id || i} className="text-center">
//                       <td style={{ width: "6%", padding: "2px" }}>{i + 1}</td>
//                       <td style={{ padding: "2px" }}>{mat.material_name}</td>
//                       <td style={{ width: "14%", padding: "2px" }}>
//                         <input
//                           type="number"
//                           min="0"
//                           value={mat.qty ?? ""}
//                           onChange={(e) => {
//                             const updated = [...availableMaterials];
//                             updated[i] = {
//                               ...updated[i],
//                               qty: e.target.value,
//                             };
//                             setAvailableMaterials(updated);
//                           }}
//                           className="form-control form-control-sm text-center"
//                           style={{
//                             fontSize: "11px",
//                             height: "22px",
//                             padding: "0",
//                           }}
//                         />
//                       </td>
//                       <td style={{ width: "10%", padding: "2px" }}>
//                         ₹{mat.default_price ?? mat.price ?? 0}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Save Buttons */}
//         <div className="card shadow-sm border-0" style={{ bottom: 0, right: 0, width: "100%", zIndex: 1000 }}>
//           <div className="card-body py-2 px-2 border-0">
//             <div className="row g-1 align-items-center">
//               <div className="col-12 col-md-4 d-flex justify-content-md-end justify-content-center gap-2 flex-wrap ms-auto">
//                 <button
//                   className="btn btn-primary btn-sm"
//                   style={{
//                     padding: "2px 8px",
//                     fontSize: "12px",
//                     height: "28px",
//                     borderRadius: "8px",
//                     minWidth: "90px",
//                   }}
//                   onClick={handleSave}
//                 >
//                   Save
//                 </button>

//                 <button
//                   className="btn btn-success btn-sm"
//                   style={{
//                     padding: "2px 8px",
//                     fontSize: "12px",
//                     height: "28px",
//                     borderRadius: "8px",
//                     minWidth: "110px",
//                   }}
//                   onClick={async () => {
//                     await handleSave();
//                     handlePrint();
//                   }}
//                 >
//                   Save & Print
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ✅ Modal Popup */}
//       {showModal && (
//         <div
//           className="modal fade show d-block"
//           tabIndex="-1"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog modal-sm modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header py-2">
//                 <h6 className="modal-title">Inward Number</h6>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body text-center py-3">
//                 <h5 className="mb-2 text-primary">{formData.inwardNo}</h5>
//                 <p className="text-muted mb-0">has been successfully saved.</p>
//               </div>
//               <div className="modal-footer py-2">
//                 <button
//                   className="btn btn-sm btn-secondary"
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

// export default InwardPage;

import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { PrintUtils } from "../../utils/printUtils";
import { toast } from "react-toastify";

const BASE_URL = "https://115.124.111.111/FLS/public/api";

const InwardPage = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    inwardNo: "",
    referenceNo: "",
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const headerRefs = useRef([]);

  // const handlePrint = () => PrintUtils.Print(availableMaterials);
const handlePrint = (materialsToPrint) => {
  if (!materialsToPrint || !materialsToPrint.length)
    return toast.error("No materials to print.");

  const formattedMaterials = materialsToPrint.map((mat) => ({
    material: mat.material_name, // <-- must be 'material' for PrintUtils
    qty: Number(mat.qty),         // numeric quantity
  }));
  PrintUtils.Print(formattedMaterials);
};


  useEffect(() => {
    const fetchCustomers = async () => {
      const token = sessionStorage.getItem("authToken");
      if (!token) return toast.error("Unauthorized. Please login again.");

      try {
        setLoading(true);
        const { data: res } = await axios.get(`${BASE_URL}/options/getcustomers`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });

        let customerList = res?.data || res?.customers || res?.data?.customers || [];
        customerList = customerList.filter((c) => c?.id && c?.customer_name);
        setCustomers(customerList);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to fetch customer data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerChange = (e) => {
    const selectedName = e.target.value;
    setFormData((prev) => ({ ...prev, customerName: selectedName }));

    const selectedCustomer = customers.find((c) => c.customer_name === selectedName);
    if (!selectedCustomer) return setAvailableMaterials([]);

    setSelectedCustomerId(selectedCustomer.id);
    setFormData((prev) => ({ ...prev, address: selectedCustomer.address || "" }));

    if (Array.isArray(selectedCustomer.materials)) {
      const formatted = selectedCustomer.materials.map((m, i) => ({
        sl_no: i + 1,
        material_id: m.material_id || m.id,
        material_name: m.material_name || m.name,
        qty: m.qty,
        default_price: m.default_price || m.price || 0,
      }));
      setAvailableMaterials(formatted);
    } else setAvailableMaterials([]);
  };

  const handleSave = async (printAfterSave = false) => {
  const token = sessionStorage.getItem("authToken");
  if (!token) return toast.error("Unauthorized. Please login again.");
  if (!selectedCustomerId) return toast.error("Please select a customer.");

  const filteredMaterials = availableMaterials.filter((m) => m.material_id && m.qty > 0);
  if (!filteredMaterials.length) return toast.error("At least one material with quantity is required.");

  const formDataToSend = new FormData();
  formDataToSend.append("customer_id", selectedCustomerId);
  formDataToSend.append("reference_id", formData.referenceNo || "");
  filteredMaterials.forEach((mat) => {
    formDataToSend.append("material_id[]", mat.material_id);
    formDataToSend.append("qty[]", mat.qty);
  });

  try {
    const response = await axios.post(`${BASE_URL}/inward/create`, formDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Inward saved successfully!");

    // Always update inwardNo and show modal
    setFormData((prev) => ({ ...prev, inwardNo: response.data.inward_id }));
    setShowModal(true);

    // Print only if requested
    if (printAfterSave) handlePrint(filteredMaterials);

  } catch (error) {
    console.error("Save Error:", error.response?.data || error.message);
    toast.error(JSON.stringify(error.response?.data?.errors || error.response?.data));
  }
};

  return (
    <div className="container" style={{ fontSize: "12px", height: "90vh", paddingBottom: "70px" }}>
      {/* Header */}
      <div className="row align-items-center g-1">
        <div className="col-md-3">
          <select
            ref={(el) => (headerRefs.current[0] = el)}
            className="form-select form-select-sm"
            style={{ fontSize: "10px", height: "28px", borderRadius: "8px" }}
            value={formData.customerName}
            onChange={handleCustomerChange}
          >
            <option value="">{loading ? "Loading customers..." : "Select Customer"}</option>
            {customers.map((cust) => (
              <option key={cust.id} value={cust.customer_name}>
                {cust.customer_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <textarea
            ref={(el) => (headerRefs.current[1] = el)}
            className="form-control form-control-sm"
            rows={1}
            style={{ fontSize: "10px", height: "20px", borderRadius: "8px", resize: "none" }}
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
          />
        </div>

        {/* <div className="col-md-3">
          <input
            type="text"
            ref={(el) => (headerRefs.current[2] = el)}
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "20px", borderRadius: "8px" }}
            placeholder="Inward No."
            value={formData.inwardNo}
            readOnly
          />
        </div> */}

        <div className="col-md-3">
          <input
            type="text"
            ref={(el) => (headerRefs.current[3] = el)}
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "20px", borderRadius: "8px" }}
            placeholder="Reference No."
            value={formData.referenceNo}
            onChange={(e) => setFormData((prev) => ({ ...prev, referenceNo: e.target.value }))}
          />
        </div>
      </div>

      {/* Materials Table */}
      <div className="mt-3 card" style={{ height: "400px", marginBottom: "10px" }}>
        <div className="card-body p-0" style={{ height: "100%", overflow: "hidden" }}>
          <table className="table table-bordered table-sm mb-0" style={{ fontSize: "11px" }}>
            <thead className="table-light text-center" style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <tr>
                <th style={{ width: "6%" }}>Sl.No</th>
                <th>Material</th>
                <th style={{ width: "14%" }}>Qty</th>
                <th style={{ width: "10%" }}>Price</th>
              </tr>
            </thead>
          </table>

          <div style={{ height: "calc(100% - 35px)", overflowY: "auto" }}>
            <table className="table table-bordered table-sm mb-0" style={{ fontSize: "11px" }}>
              <tbody>
                {availableMaterials.map((mat, i) => (
                  <tr key={mat.material_id || i} className="text-center">
                    <td style={{ width: "6%" }}>{i + 1}</td>
                    <td>{mat.material_name}</td>
                    <td style={{ width: "14%" }}>
                      <input
                        type="number"
                        min="0"
                        value={mat.qty}
                        onChange={(e) => {
                          const updated = [...availableMaterials];
                          updated[i].qty = e.target.value;
                          setAvailableMaterials(updated);
                        }}
                        className="form-control form-control-sm text-center"
                        style={{ fontSize: "11px", height: "22px", padding: "0" }}
                      />
                    </td>
                    <td style={{ width: "10%" }}>₹{mat.default_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Save Buttons */}
      <div className="card shadow-sm border-0">
        <div className="card-body py-2 px-2">
          <div className="row g-1 align-items-center">
            <div className="col-12 col-md-4 d-flex justify-content-md-end gap-2 ms-auto">
              <button
                className="btn btn-primary btn-sm"
                style={{ fontSize: "12px" }}
                onClick={() => handleSave(false)} // false = no print
              >
                Save
              </button>
              <button
                className="btn btn-success btn-sm"
                style={{ fontSize: "12px" }}
                onClick={() => handleSave(true)} // true = print after save
              >
                Save & Print
              </button>



            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6 className="modal-title">Inward Number</h6>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body text-center py-3">
                <h5 className="mb-2 text-primary">{formData.inwardNo}</h5>
                <p className="text-muted mb-0">has been successfully saved.</p>
              </div>
              <div className="modal-footer py-2">
                <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}>
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

export default InwardPage;
