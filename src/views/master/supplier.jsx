import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import React, { useState, useRef, useEffect, Fragment } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// API Base URL
const API_BASE_URL = "https://115.124.111.111/FLS/public/api";

const SupplierMaster = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const inputRefs = useRef([]);
  const fileInputRef = useRef(null);

    // Create axios instance with default config
  const axiosInstance = axios.create({
    timeout: 15000, // 15 seconds timeout
    headers: {
      'Accept': 'application/json'
    }
  });
  
  const authToken = sessionStorage.getItem("authToken"); // ✅ Ensure token is fetched

  // Return focus to the main container when modal closes
  useEffect(() => {
    if (!showModal && !showImageModal) {
      document.getElementById("supplier-container")?.focus();
    }
  }, [showModal, showImageModal]);


  // added additionally

  useEffect(() => {
  fetchSuppliers(); // ✅ initial load
}, []);

  // added additionally

  const [formData, setFormData] = useState({
    id: "",
    customer_name: "",
    customer_id: "",
    customer_group: "",
    gst: "",
    address: "",
    image: null,
  });

// ✅ Fetch suppliers
const fetchSuppliers = async () => {
  try {
    setLoading(true);
    const token = sessionStorage.getItem("authToken");
    console.log("Auth Token:", token);


if (!token || token === "undefined" || token === "null") {
  console.error("Invalid or missing auth token");
  toast.error("Session expired. Please login again.");
  sessionStorage.removeItem("authToken");
  navigate("/login"); // ✅ SPA-friendly navigation
  return;
}

    const response = await axiosInstance.get(`${API_BASE_URL}/customer/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status < 500,
    });

    console.log("Raw API response:", response);

    const resData = response.data;
    const list =
      resData?.data ||
      resData?.customers ||
      resData?.list ||
      (Array.isArray(resData) ? resData : []);

    if (list.length > 0) {
      console.log("✅ Customers fetched successfully:", list);
      setSuppliers(list);
    } else {
      console.warn("⚠️ No customers found in API response:", resData);
      toast.warn("No customers found.");
    }
  } catch (error) {
    console.error("❌ Fetch error:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.log("Response error data:", error.response.data);
        toast.error(error.response.data?.message || "API returned an error.");
      } else if (error.request) {
        console.log("No response received:", error.request);
        toast.error("No response from server.");
      } else {
        console.log("Request setup error:", error.message);
        toast.error(error.message);
      }
    } else {
      toast.error("Unexpected error occurred.");
    }
  } finally {
    setLoading(false);
  }
};

// ✅ Add this right below
useEffect(() => {
  fetchSuppliers(); // runs only once when component loads
}, []);


  // ✅ Enter key navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = inputRefs.current[index + 1];
      if (next) {
        next.focus();
      } else {
        document.getElementById("saveSupplierBtn")?.focus();
      }
    }
  };

  // ✅ Remove image
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreviewImage(null);
  };

  // ✅ Generate supplier code
  // const generateSupplierCode = () => {
  //   const nextNumber = suppliers.length + 1;
  //   return `SUP${String(nextNumber).padStart(3, "0")}`;
  // };

  const generateSupplierCode = () => {
  if (!Array.isArray(suppliers) || suppliers.length === 0) {
    return "SUP001";
  }

  // Extract all numeric parts of existing customer codes (e.g., SUP001 -> 1)
  const numbers = suppliers
    .map((s) => {
      const match = String(s.customer_id || "").match(/SUP(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;

  return `SUP${String(nextNumber).padStart(3, "0")}`;
};


  // ✅ Handle image change
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid image file");
      handleRemoveImage();
    }
  };

  // ✅ New supplier
  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      id: "",
      customer_name: "",
      customer_id: generateSupplierCode(),
      customer_group: "",
      gst: "",
      address: "",
      image: null,
    });
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowModal(true);
  };

  // ✅ Edit supplier
const handleEditSupplier = async (supplier) => {
  try {
    const token = sessionStorage.getItem("authToken");
    if (!token || token === "undefined" || token === "null") {
      toast.error("Session expired. Please login again.");
      window.location.href = "/login";
      return;
    }

    // ✅ Log to debug
    console.log("Editing supplier with ID:", supplier.id);

    // ✅ Try both possible endpoints — fallback if edit fails
    let response;
    try {
      response = await axios.get(`${API_BASE_URL}/customer/edit/${supplier.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (status) => status < 500,
      });
    } catch {
      console.warn("Fallback to /customer/show endpoint...");
      response = await axios.get(`${API_BASE_URL}/customer/show/${supplier.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (status) => status < 500,
      });
    }

    console.log("Edit API response:", response.data);
    

    // ✅ Normalize response
    const resData = response.data;
    const data = resData?.data || resData?.customer || resData;

    if (data && Object.keys(data).length > 0) {
      console.log("Supplier data loaded for edit:", data);

      setEditingSupplier(data);
      setFormData({
        id: data.id || "",
        customer_name: data.customer_name || "",
        customer_id: data.customer_id || "",
        customer_group: data.customer_group || "",
        gst: data.gst || "",
        address: data.address || "",
        image: data.image || null,
      });

      setPreviewImage(data.image || null);
      setShowModal(true);
    } else {
      console.error("Invalid supplier data:", resData);
      toast.error(resData?.message || "Failed to fetch supplier details.");
    }
  } catch (error) {
    console.error("Error editing supplier:", error);
    if (error.response) {
      toast.error(error.response.data?.message || "Server error while fetching details.");
    } else {
      toast.error("Network error while loading supplier details.");
    }
  }
};

  // ✅ Save supplier
const handleSaveSupplier = async () => {
  if (isSaving) return; // prevent double click
  setIsSaving(true);

  try {
    if (!formData.customer_name || !formData.customer_id || !formData.gst) {
      toast.error("Please fill all required fields");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("id", formData.id || "");
    formDataToSend.append("customer_name", formData.customer_name);
    formDataToSend.append("customer_id", formData.customer_id);
    formDataToSend.append("customer_group", formData.customer_group);
    formDataToSend.append("gst", formData.gst);
    formDataToSend.append("address", formData.address || "");
    if (formData.image) {
      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      } else if (typeof formData.image === "string" && !formData.image.startsWith("data:")) {
        formDataToSend.append("image_url", formData.image);
      }
    }

    const url = editingSupplier
      ? `${API_BASE_URL}/customer/update`
      : `${API_BASE_URL}/customer/create`;

    const response = await axios.post(url, formDataToSend, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    });

    if (response.data.status === "success") {
      toast.success(`Customer ${editingSupplier ? "updated" : "created"} successfully!`);

      const updatedSupplier = response.data.data || {
        ...formData,
        id: editingSupplier ? formData.id : response.data.id,
      };

      setSuppliers(prev => {
        if (editingSupplier) {
          // Update existing supplier in the list
          return prev.map(s => (s.id === updatedSupplier.id ? updatedSupplier : s));
        } else {
          // Add new supplier at the top
          return [updatedSupplier, ...prev];
        }
      });

      // Reset form
      setEditingSupplier(null);
      setFormData({
        id: "",
        customer_name: "",
        customer_id: generateSupplierCode(),
        customer_group: "",
        gst: "",
        address: "",
        image: null,
      });
      setPreviewImage(null);
      setShowModal(false);
    } else {
      toast.error(response.data.message || "Failed to save customer");
    }
  } catch (error) {
    console.error("Error saving supplier:", error);
    toast.error("Failed to save supplier. Please try again.");
  } finally {
    setIsSaving(false);
  }
};



  // ✅ Delete supplier
const deleteRow = async (id) => {
  if (!window.confirm("Are you sure you want to delete this customer?")) return;

  try {
    // Get auth token from session storage
    const token = sessionStorage.getItem("authToken");

    if (!token || token === "undefined" || token === "null") {
      toast.error("Session expired. Please login again.");
      sessionStorage.removeItem("authToken");
      window.location.href = "/login";
      return;
    }

    console.log("Deleting customer ID:", id, "with token:", token);

    const response = await axios.delete(
      `https://115.124.111.111/FLS/public/api/customer/delete/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // use the auth token
          "Content-Type": "application/json",
        },
        validateStatus: (status) => status < 500,
      }
    );

    console.log("Delete API response:", response.data);

    if (response.data?.status === "success") {
      toast.success("Customer deleted successfully!");
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } else {
      toast.error(response.data?.message || "Failed to delete customer");
    }
  } catch (error) {
    console.error("Error deleting supplier:", error);

    if (error.response) {
      toast.error(error.response.data?.message || "Server error while deleting customer");
    } else if (error.request) {
      toast.error("No response from server. Please check your network.");
    } else {
      toast.error("Unexpected error occurred while deleting customer.");
    }
  }
};


  // ✅ Export PDF
  const exportPDF = () => {
    if (suppliers.length === 0) {
      alert("No suppliers available to export.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Supplier Master", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Code", "Name", "Group", "Address", "GST"]],
      body: suppliers.map((s) => [
        s.customer_id,
        s.customer_name,
        s.customer_group || "",
        s.address || "",
        s.gst,
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] },
    });

    doc.save("SupplierMaster.pdf");
  };

  // ✅ Export Excel
  const exportExcel = () => {
    if (suppliers.length === 0) {
      alert("No suppliers available to export.");
      return;
    }

    const data = suppliers.map((s) => ({
      Code: s.customer_id,
      Name: s.customer_name,
      Group: s.customer_group || "",
      Address: s.address || "",
      "GST No.": s.gst,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
    XLSX.writeFile(workbook, "SupplierMaster.xlsx");
  };

  // ✅ Print
  const handlePrint = () => {
    if (suppliers.length === 0) {
      alert("No suppliers available to print.");
      return;
    }

    const table = document.getElementById("supplier-table");
    const cloneTable = table.cloneNode(true);

    const ths = cloneTable.querySelectorAll("thead th");
    if (ths.length >= 6) {
      ths[4].remove();
      ths[5].remove();
    }

    const trs = cloneTable.querySelectorAll("tbody tr");
    trs.forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length >= 6) {
        tds[4].remove();
        tds[5].remove();
      }
    });

    const printWindow = window.open("", "", "width=900,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Supplier Master</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #0d6efd; color: white; }
          </style>
        </head>
        <body>
          <h2>Supplier Master</h2>
          ${cloneTable.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ✅ Filtered suppliers
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_group?.toLowerCase().includes(search.toLowerCase()) ||
      s.gst?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase())
  );


  // Inside your component
// const dummySupplier = {
//   id: "dummy",
//   customer_code: "SUP001",
//   customer_name: "Dummy Supplier",
//   customer_group: "Retail",
//   address: "123, Main Street",
//   gst: "123456789",
//   image: "https://via.placeholder.com/25",
// };


// const displaySuppliers = [dummySupplier, ...filteredSuppliers];

  return (
    <Fragment>
      <div className="page-container">
        <div className="main-container">
          <div
            className="container-fluid p-3"
            id="supplier-container"
            tabIndex="-1"
          >
            {/* Loading Indicator */}
            {/* {loading && (
              <div className="text-center my-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )} */}

            {/* Toolbar */}
            <div className="d-flex flex-wrap gap-2 mb-2 px-2">
              <button
                className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center"
                style={{ borderRadius: "8px", fontSize: "13px" }}
                onClick={handleNewSupplier}
              >
                <span
                  className="material-icons-two-tone me-1"
                  style={{ fontSize: "12px" }}
                >
                  add
                </span>
                New
              </button>

              <button
                className="btn btn-sm btn-danger py-1 px-2 d-flex align-items-center"
                style={{ borderRadius: "8px", fontSize: "13px" }}
                onClick={exportPDF}
              >
                <span
                  className="material-icons-two-tone me-1"
                  style={{ fontSize: "14px" }}
                >
                  picture_as_pdf
                </span>
                PDF
              </button>

              <button
                className="btn btn-sm text-white py-1 px-2 d-flex align-items-center"
                style={{
                  backgroundColor: "#1D6F42",
                  borderColor: "#1D6F42",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                onClick={exportExcel}
              >
                <span
                  className="material-icons-two-tone me-1"
                  style={{ fontSize: "14px" }}
                >
                  grid_on
                </span>
                Excel
              </button>

              <button
                className="btn btn-sm btn-primary py-1 px-2 d-flex align-items-center"
                style={{ borderRadius: "8px", fontSize: "13px" }}
                onClick={handlePrint}
              >
                <span
                  className="material-icons-two-tone me-1"
                  style={{ fontSize: "14px" }}
                >
                  print
                </span>
                Print
              </button>
            </div>

            {/* Table */}

<div
  className="table-responsive"
  style={{
    borderRadius: "8px",
    boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
    overflow: "hidden",
    backgroundColor: "#fff",
  }}
>
  <table
    id="supplier-table"
    className="table align-middle mb-0 text-center"
    style={{
      fontSize: "11px",
      width: "100%",
      borderCollapse: "collapse",
    }}
  >
    <thead
      style={{
        background: "linear-gradient(90deg, #007bff, #00b4d8)",
        color: "#fff",
        textTransform: "uppercase",
        fontSize: "11px",
      }}
    >
      <tr>
        {["Code", "Name", "Group", "Address", "GST", "Image", "Action"].map(
          (header, i) => (
            <th
              key={i}
              style={{
                padding: "4px 5px",
                fontWeight: "600",
                border: "1px solid #dee2e6",
                whiteSpace: "nowrap",
                ...(header === "Action" && { minWidth: "90px" }),
              }}
            >
              {header}
            </th>
          )
        )}
      </tr>
    </thead>

    <tbody>
      {Array.isArray(filteredSuppliers) && filteredSuppliers.length > 0 ? (
        filteredSuppliers.map((supplier, index) => (
          <tr
            key={supplier.id}
            style={{
              backgroundColor: index % 2 === 0 ? "#f9fafb" : "#ffffff",
              transition: "background-color 0.15s ease-in-out",
              lineHeight: "1.1",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e8f2ff")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                index % 2 === 0 ? "#f9fafb" : "#ffffff")
            }
          >
            <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
              {supplier.customer_id}
            </td>
            <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
              {supplier.customer_name}
            </td>
            <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
              {supplier.customer_group}
            </td>
            <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
              {supplier.address}
            </td>
            <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
              {supplier.gst}
            </td>

            <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
              {supplier.image ? (
                <img
                  src={supplier.image}
                  alt="Supplier"
                  width="18"
                  height="18"
                  style={{
                    borderRadius: "3px",
                    cursor: "pointer",
                    objectFit: "cover",
                    transition: "transform 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onClick={() => {
                    setPreviewImage(supplier.image);
                    setShowImageModal(true);
                  }}
                />
              ) : (
                <span style={{ color: "#6c757d", fontSize: "9px" }}>No Image</span>
              )}
            </td>

           <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
  {/* Edit */}
  <button
    className="btn btn-sm p-0 me-1"
    style={{
      background: "transparent",
      border: "none",
      padding: 0,
      transition: "transform 0.1s ease-in-out",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    onClick={() => handleEditSupplier(supplier)}
    title="Edit"
  >
    <span
      className="material-icons-two-tone"
      style={{ fontSize: "12px", color: "#ffc107", cursor: "pointer" }}
    >
      edit
    </span>
  </button>

  {/* Price List */}
  <button
    className="btn btn-sm p-0 me-1"
    style={{
      background: "transparent",
      border: "none",
      padding: 0,
      transition: "transform 0.1s ease-in-out",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    onClick={() => alert("Open Price List for " + supplier.customer_name)}
    title="Price List"
  >
    <span
      className="material-icons-two-tone"
      style={{ fontSize: "12px", color: "#0dcaf0", cursor: "pointer" }}
    >
      list_alt
    </span>
  </button>

  {/* Delete */}
  <button
    className="btn btn-sm p-0"
    style={{
      background: "transparent",
      border: "none",
      padding: 0,
      transition: "transform 0.1s ease-in-out",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    onClick={() => deleteRow(supplier.id)}
    title="Delete"
  >
    <span
      className="material-icons-two-tone"
      style={{ fontSize: "12px", color: "#dc3545", cursor: "pointer" }}
    >
      delete
    </span>
  </button>
</td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan="7"
            style={{
              textAlign: "center",
              color: "#6c757d",
              fontSize: "10px",
              padding: "6px",
              border: "1px solid #dee2e6",
            }}
          >
            No suppliers found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>



            {/* Form Modal */}
            {showModal && (
              <Fragment>
                <div className="modal-wrapper">
                  <div className="modal-backdrop fade show"></div>
                  <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                      <div className="modal-content" style={{ fontSize: "13px" }}>
                        <div className="modal-header py-2">
                          <h6 className="modal-title">
                            {editingSupplier ? "Edit Supplier" : "Add Supplier"}
                          </h6>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowModal(false)}
                          ></button>
                        </div>

                    <div
  className="modal-body p-2"
  style={{ maxHeight: "300px", overflowY: "auto" }}
>
  {editingSupplier && (
    <div className="mb-2">
      <label className="form-label">Customer Code</label>
      <input
        type="text"
        className="form-control form-control-sm"
        value={formData.customer_id}
        readOnly
      />
    </div>
  )}

  <div className="mb-2">
    <label className="form-label">Customer Name</label>
    <input
      type="text"
      className="form-control form-control-sm"
      value={formData.customer_name}
      onChange={(e) =>
        setFormData({ ...formData, customer_name: e.target.value })
      }
    />
  </div>

  <div className="mb-2">
    <label className="form-label">Customer Group</label>
    <select
      className="form-select form-select-sm"
      value={formData.customer_group}
      onChange={(e) =>
        setFormData({ ...formData, customer_group: e.target.value })
      }
    >
      <option value="">Select</option>
      <option value="Hospital">Hospital</option>
      <option value="Retail">Retail</option>
      <option value="Distributor">Distributor</option>
    </select>
  </div>

  <div className="mb-2">
    <label className="form-label">GST</label>
    <input
      type="text"
      className="form-control form-control-sm"
      value={formData.gst}
      onChange={(e) =>
        setFormData({ ...formData, gst: e.target.value })
      }
    />
  </div>

  <div className="mb-2">
    <label className="form-label">Address</label>
    <textarea
      className="form-control form-control-sm"
      value={formData.address}
      onChange={(e) =>
        setFormData({ ...formData, address: e.target.value })
      }
    ></textarea>
  </div>

<div className="mb-2 position-relative">
  <label className="form-label">Image</label>
  <input
    type="file"
    className="form-control form-control-sm"
    ref={fileInputRef}
    onChange={handleImageUpload}
  />
  {previewImage && (
    <div className="position-relative mt-1" style={{ width: "50px", height: "50px" }}>
      <img
        src={previewImage}
        alt="Preview"
        width="50"
        height="50"
        style={{ objectFit: "cover", borderRadius: "4px" }}
      />
      <span
        onClick={handleRemoveImage}
        style={{
          position: "absolute",
          top: "-5px",
          right: "-5px",
          background: "red",
          color: "white",
          borderRadius: "50%",
          width: "16px",
          height: "16px",
          fontSize: "12px",
          fontWeight: "bold",
          textAlign: "center",
          lineHeight: "16px",
          cursor: "pointer",
        }}
      >
        ×
      </span>
    </div>
  )}
</div>

</div>
                      <div className="modal-footer py-2">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setShowModal(false)}
                          >
                            Close
                          </button>
                          <button
                            id="saveSupplierBtn"
                            className="btn btn-sm btn-primary"
                            onClick={handleSaveSupplier}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            )}

            {/* Image Modal */}
            {showImageModal && (
              <div className="modal-wrapper">
                <div className="modal-backdrop fade show"></div>
                <div className="modal fade show d-block" tabIndex="-1">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content p-2">
                      <div className="modal-header py-1">
                        <h6 className="modal-title">Image Preview</h6>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowImageModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body text-center">
                        <img
                          src={previewImage}
                          alt="Preview"
                          style={{ maxWidth: "100%", maxHeight: "400px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SupplierMaster;