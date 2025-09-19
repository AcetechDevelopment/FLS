import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import React, { useState, useRef } from "react";

const SupplierMaster = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    gst: "",
    image: null,
  });


    // on key navigation 
  // refs for navigation
const inputRefs = useRef([]);

// Enter key navigation
const handleKeyDown = (e, index) => {
  if (e.key === "Enter") {
    e.preventDefault(); // stop form submit
    const next = inputRefs.current[index + 1];
    if (next) {
      next.focus();
    } else {
      // focus Save button if last field
      document.getElementById("saveSupplierBtn")?.focus();
    }
  }
};

  const fileInputRef = useRef(null); // ✅ reference for file input

  // ✅ Remove image + clear file input
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // clears input text
    }
  };

  // ✅ Generate Supplier Code
  const generateSupplierCode = () => {
    const nextNumber = suppliers.length + 1;
    return `SUP${String(nextNumber).padStart(3, "0")}`;
  };

  // Open modal for new supplier
  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      code: generateSupplierCode(),
      gst: "",
      image: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset input field on new supplier
    }
    setShowModal(true);
  };

  // Open modal for editing supplier
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset file input when editing
    }
    setShowModal(true);
  };

  // Save supplier (add or update)
  const handleSaveSupplier = () => {
    if (editingSupplier) {
      setSuppliers(
        suppliers.map((s) =>
          s.id === editingSupplier.id
            ? { ...formData, id: editingSupplier.id }
            : s
        )
      );
    } else {
      setSuppliers([...suppliers, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  // Delete supplier
  const deleteRow = (id) => {
    setSuppliers(suppliers.filter((s) => s.id !== id));
  };

  // ✅ Handle Image Upload (ignore cancel)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      // User clicked Cancel → keep old image + input
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
    };
    reader.readAsDataURL(file);
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
    head: [["Supplier Code", "Supplier Name", "Address", "GST No."]], // ✅ Added Address
    body: suppliers.map((s) => [s.code, s.name, s.address || "", s.gst]), // ✅ Added Address
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
    "Supplier Code": s.code,
    "Supplier Name": s.name,
    "Address": s.address || "", // ✅ Added Address
    "GST No.": s.gst,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
  XLSX.writeFile(workbook, "SupplierMaster.xlsx");
};

  // ✅ Print Table
  const handlePrint = () => {
  if (suppliers.length === 0) {
    alert("No suppliers available to print.");
    return;
  }

  // Clone the table
  const table = document.getElementById("supplier-table");
  const cloneTable = table.cloneNode(true);

  // Remove Image and Action columns from header
  const ths = cloneTable.querySelectorAll("thead th");
  if (ths.length >= 6) {
    ths[4].remove(); // Image
    ths[5].remove(); // Action
  }

  // Remove Image and Action columns from each row
  const trs = cloneTable.querySelectorAll("tbody tr");
  trs.forEach((tr) => {
    const tds = tr.querySelectorAll("td");
    if (tds.length >= 6) {
      tds[4].remove(); // Image
      tds[5].remove(); // Action
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
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">

<div className="d-flex flex-wrap gap-1 mb-3">
  {/* New Supplier */}
  <button
    className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center"
    style={{ borderRadius: "8px", fontSize: "13px" }}
    onClick={handleNewSupplier}
  >
    <span className="material-icons-two-tone me-1" style={{ fontSize: "12px" }}>
      add
    </span>
    New
  </button>

  {/* PDF */}
  <button
    className="btn btn-sm btn-danger py-1 px-2 d-flex align-items-center"
    style={{ borderRadius: "8px", fontSize: "13px" }}
    onClick={exportPDF}
  >
    <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
      picture_as_pdf
    </span>
    PDF
  </button>

  {/* Excel */}
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
    <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
      grid_on
    </span>
    Excel
  </button>

  {/* Print */}
  <button
    className="btn btn-sm btn-primary py-1 px-2 d-flex align-items-center"
    style={{ borderRadius: "8px", fontSize: "13px" }}
    onClick={handlePrint}
  >
    <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
      print
    </span>
    Print
  </button>
</div>

      {/* ✅ Responsive Table */}
      <div className="table-responsive">
        <table id="supplier-table" className="table table-bordered table-striped align-middle"   style={{ fontSize: "12px" }}>
          <thead className="table-primary" style={{ fontSize: "12px" }}>
<tr className="text-center">
  <th className="py-1 px-1">Customer Code</th>
  <th className="py-1 px-1">Customer Name</th>
  <th className="py-1 px-1">Address</th> {/* ✅ Added Address */}
  <th className="py-1 px-1">GST No.</th>
  <th className="py-1 px-1">Image</th>
  <th className="py-1 px-1" style={{ minWidth: "140px" }}>Action</th>
</tr>
</thead>

<tbody>
  {suppliers
    .filter((supplier) => {
      const query = search.toLowerCase();
      return (
        supplier.name?.toLowerCase().includes(query) ||
        supplier.gst?.toLowerCase().includes(query) ||
        supplier.code?.toLowerCase().includes(query) ||
        supplier.address?.toLowerCase().includes(query)
      );
    })
    .map((supplier) => (
    <tr key={supplier.id} className="text-center" style={{ fontSize: "12px" }}>
        <td className="py-0 px-1">{supplier.code}</td>
        <td className="py-0 px-1">{supplier.name}</td>
        <td className="py-0 px-1">{supplier.gst}</td>
        <td className="py-0 px-1">{supplier.address}</td>
        <td className="py-0 px-1 text-center">
          {supplier.image ? (
            <img
              src={supplier.image}
              alt="Supplier"
              width="25"
              height="25"
              style={{
                cursor: "pointer",
                borderRadius: "4px",
                objectFit: "cover",
              }}
              onClick={() => {
                setPreviewImage(supplier.image);
                setShowImageModal(true);
              }}
            />
          ) : (
            <span className="text-muted" style={{ fontSize: "11px" }}>
              No Image
            </span>
          )}
        </td>
        <td className="py-0 px-1">
          {/* Edit */}
   {/* Edit */}
<button
  className="btn btn-sm p-0 me-1"
  style={{ background: "transparent", border: "none", cursor: "pointer" }}
  onClick={() => handleEditSupplier(supplier)}
  title="Edit"
>
  <span
    className="material-icons-two-tone text-warning"
    style={{ fontSize: "16px", cursor: "pointer" }}
  >
    edit
  </span>
</button>

{/* Price List */}
<button
  className="btn btn-sm p-0 me-1"
  style={{ background: "transparent", border: "none", cursor: "pointer" }}
  onClick={() => alert("Open Price List for " + supplier.name)}
  title="Price List"
>
  <span
    className="material-icons-two-tone text-info"
    style={{ fontSize: "16px", cursor: "pointer" }}
  >
    list_alt
  </span>
</button>

{/* Delete */}
<button
  className="btn btn-sm p-0"
  style={{ background: "transparent", border: "none", cursor: "pointer" }}
  onClick={() => deleteRow(supplier.id)}
  title="Delete"
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
  {suppliers.filter((supplier) => {
    const query = search.toLowerCase();
    return (
      supplier.name?.toLowerCase().includes(query) ||
      supplier.gst?.toLowerCase().includes(query) ||
      supplier.code?.toLowerCase().includes(query) ||
      supplier.address?.toLowerCase().includes(query)
    );
  }).length === 0 && (
    <tr>
      <td
        colSpan="6"
        className="text-center text-muted py-2"
        style={{ fontSize: "12px" }}
      >
        No suppliers found
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

{showModal && (
  <div className="modal fade show d-block" tabIndex="-1">
    <div className="modal-dialog modal-sm modal-dialog-scrollable">
      <div className="modal-content" style={{ fontSize: "13px" }}>
        {/* ✅ Modal Header */}
        <div className="modal-header py-2">
          <h6 className="modal-title">
            {editingSupplier ? "Edit Supplier" : "Add Supplier"}
          </h6>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModal(false)}
            style={{ fontSize: "10px" }}
          ></button>
        </div>

        {/* ✅ Scrollable Modal Body */}
        <div
          className="modal-body p-2"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {/** ✅ Refs for Enter Navigation */}
          {(() => {
            if (!inputRefs.current) inputRefs.current = [];
          })()}

          {/* Supplier Code */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "12px" }}>
              Customer Code
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.code}
              readOnly
              ref={(el) => (inputRefs.current[0] = el)}
              onKeyDown={(e) => handleKeyDown(e, 0)}
            />
          </div>

          {/* Supplier Name */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "12px" }}>
              Customer Name
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              ref={(el) => (inputRefs.current[1] = el)}
              onKeyDown={(e) => handleKeyDown(e, 1)}
            />
          </div>

          {/* Supplier Group */}
<div className="mb-2">
  <label className="form-label" style={{ fontSize: "12px" }}>
    Customer Group
  </label>
  <select
    className="form-select form-select-sm"
    value={formData.group}
    onChange={(e) =>
      setFormData({ ...formData, group: e.target.value })
    }
    ref={(el) => (inputRefs.current[2] = el)}
    onKeyDown={(e) => handleKeyDown(e, 2)}
  >
    <option value="">  Select Type </option>  {/* ✅ placeholder option */}
    <option value="Hospital">Hospital</option>
    <option value="Hotel">Hotel</option>
  </select>
</div>

          {/* GST Number */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "12px" }}>
              GST No.
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.gst}
              maxLength={15}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                if (value.length <= 15) {
                  setFormData({ ...formData, gst: value });
                }
              }}
              ref={(el) => (inputRefs.current[3] = el)}
              onKeyDown={(e) => handleKeyDown(e, 3)}
            />
          </div>

          {/* Address */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "12px" }}>
              Address
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              ref={(el) => (inputRefs.current[4] = el)}
              onKeyDown={(e) => handleKeyDown(e, 4)}
            />
          </div>

          {/* Upload Image */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "12px" }}>
              Upload Image
            </label>
            <input
              type="file"
              className="form-control form-control-sm"
              accept="image/*"
              onChange={handleImageUpload}
              ref={(el) => (inputRefs.current[5] = el)}
              onKeyDown={(e) => handleKeyDown(e, 5)}
            />

            {formData.image && (
              <div
                className="position-relative d-inline-block mt-2"
                style={{ width: "70px", height: "70px" }}
              >
                <img
                  src={formData.image}
                  alt="Preview"
                  width="70"
                  height="70"
                  style={{ borderRadius: "6px", border: "1px solid #ddd" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    fontSize: "12px",
                    lineHeight: "18px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Modal Footer */}
        <div className="modal-footer py-2">
          <button
            id="saveSupplierBtn"
            className="btn btn-primary btn-sm"
            onClick={handleSaveSupplier}
          >
            {editingSupplier ? "Update" : "Add"}
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Supplier Image</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowImageModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img src={previewImage} alt="Supplier" className="img-fluid rounded" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierMaster;