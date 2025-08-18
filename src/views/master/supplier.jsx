import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

  // ✅ Generate Supplier Code
  const generateSupplierCode = () => {
    const nextNumber = suppliers.length + 1;
    return `SUP${String(nextNumber).padStart(3, "0")}`;
  };

  // Open modal for new supplier
  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setFormData({ name: "", code: generateSupplierCode(), gst: "", image: null });
    setShowModal(true);
  };

  // Open modal for editing supplier
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setShowModal(true);
  };

  // Save supplier (add or update)
  const handleSaveSupplier = () => {
    if (editingSupplier) {
      setSuppliers(
        suppliers.map((s) =>
          s.id === editingSupplier.id ? { ...formData, id: editingSupplier.id } : s
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

  // ✅ Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
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
      head: [["Supplier Code", "Supplier Name", "GST No."]],
      body: suppliers.map((s) => [s.code, s.name, s.gst]),
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

    const printContents = document.getElementById("supplier-table").outerHTML;
    const printWindow = window.open("", "", "width=900,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Supplier Master</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0d6efd; color: white; }
          </style>
        </head>
        <body>
          <h2>Supplier Master</h2>
          ${printContents}
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
    <div className="container mt-4">
      <h3>Supplier Master</h3>

      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <button className="btn btn-outline-primary me-2" onClick={handleNewSupplier}>
            New
          </button>
          <button className="btn btn-outline-secondary me-2" onClick={exportPDF}>
            PDF
          </button>
          <button className="btn btn-outline-secondary me-2" onClick={exportExcel}>
            Excel
          </button>
          <button className="btn btn-outline-secondary" onClick={handlePrint}>
            Print
          </button>
        </div>

        <div>
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ✅ Responsive Table */}
      <div className="table-responsive">
        <table id="supplier-table" className="table table-bordered table-striped align-middle">
          <thead className="table-primary">
            {/* <tr>
              <th>Supplier Code</th>
              <th>Supplier Name</th>
              <th>GST No.</th>
              <th>Image</th>
              <th style={{ minWidth: "140px" }}>Action</th>
            </tr> */}

            <tr>
  <th>Supplier Code</th>
  <th>Supplier Name</th>
   <th>Address</th>  {/* ✅ Added Address */}
  <th>GST No.</th>

  <th>Image</th>
  <th style={{ minWidth: "140px" }}>Action</th>
</tr>
          </thead>

         <tbody>
  {filteredSuppliers.map((supplier) => (
    <tr key={supplier.id}>
      <td>{supplier.code}</td>
      <td>{supplier.name}</td>
      <td>{supplier.gst}</td>
      <td>{supplier.address}</td> {/* ✅ Added Address */}
      <td>
        {supplier.image ? (
          <img
            src={supplier.image}
            alt="Supplier"
            width="40"
            height="40"
            style={{ cursor: "pointer", borderRadius: "5px" }}
            onClick={() => {
              setPreviewImage(supplier.image);
              setShowImageModal(true);
            }}
          />
        ) : (
          <span className="text-muted">No Image</span>
        )}
      </td>
      <td>
        {/* Edit */}
        <button
          className="btn p-0 me-2"
          style={{ background: "transparent", border: "none", boxShadow: "none" }}
          onClick={() => handleEditSupplier(supplier)}
          title="Edit"
        >
          <span className="material-icons-two-tone text-warning">edit</span>
        </button>

        {/* Price List */}
        <button
          className="btn p-0 me-2"
          style={{ background: "transparent", border: "none", boxShadow: "none" }}
          onClick={() => alert("Open Price List for " + supplier.name)}
          title="Price List"
        >
          <span className="material-icons-two-tone text-info">list_alt</span>
        </button>

        {/* Delete */}
        <button
          className="btn p-0"
          style={{ background: "transparent", border: "none", boxShadow: "none" }}
          onClick={() => deleteRow(supplier.id)}
          title="Delete"
        >
          <span className="material-icons-two-tone text-danger">delete</span>
        </button>
      </td>
    </tr>
  ))}
  {filteredSuppliers.length === 0 && (
    <tr>
      <td colSpan="6" className="text-center text-muted">
        No suppliers found
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>

      {/* Modal (Add/Edit Supplier) */}
   {showModal && (
  <div className="modal fade show d-block" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {editingSupplier ? "Edit Supplier" : "Add Supplier"}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label">Supplier Code</label>
            <input
              type="text"
              className="form-control"
              value={formData.code}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Supplier Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">GST No.</label>
            <input
              type="text"
              className="form-control"
              value={formData.gst}
              onChange={(e) =>
                setFormData({ ...formData, gst: e.target.value })
              }
            />
          </div>

          {/* ✅ Address Field */}
          <div className="mb-3">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Upload Image</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="mt-2"
                width="80"
                height="80"
              />
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSaveSupplier}>
            {editingSupplier ? "Update" : "Add"}
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
