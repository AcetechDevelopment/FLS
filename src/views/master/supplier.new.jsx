import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// API Base URL
const API_BASE_URL = "https://10.9.76.62/FLS/public/api";

const SupplierMaster = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Return focus to the main container when modal closes
  useEffect(() => {
    if (!showModal && !showImageModal) {
      document.getElementById('supplier-container')?.focus();
    }
  }, [showModal, showImageModal]);

  const [formData, setFormData] = useState({
    id: "",
    customer_name: "",
    customer_code: "",
    customer_group: "",
    gst: "",
    address: "",
    image: null,
  });

  const inputRefs = useRef([]);
  const fileInputRef = useRef(null);

  // ✅ Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/customer/view`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data.status === 200) {
        setSuppliers(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        // Optionally redirect to login page here
      } else {
        toast.error(error.response?.data?.message || "Error loading customers");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Handle form input keydown for navigation
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

  // Handle image removal
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      id: "",
      customer_name: "",
      customer_code: "",
      customer_group: "",
      gst: "",
      address: "",
      image: "",
    });
    setShowModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      id: supplier.id,
      customer_name: supplier.name,
      customer_code: supplier.code,
      customer_group: supplier.group,
      gst: supplier.gst,
      address: supplier.address,
      image: supplier.image,
    });
    setPreviewImage(supplier.image);
    setShowModal(true);
  };

  const handleSaveSupplier = async () => {
    try {
      const payload = {
        name: formData.customer_name,
        group: formData.customer_group,
        gst: formData.gst,
        address: formData.address,
        image: formData.image,
      };

      if (!formData.customer_name) {
        toast.error("Customer name is required");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/customer/${editingSupplier ? 'update' : 'create'}/${
          editingSupplier?.id || ''
        }`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data.status === 200) {
        toast.success(response.data.message);
        setShowModal(false);
        fetchSuppliers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error(error.response?.data?.message || "Error saving supplier");
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/customer/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data.status === 200) {
        toast.success("Supplier deleted successfully");
        fetchSuppliers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error(error.response?.data?.message || "Error deleting supplier");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Code", "Name", "Group", "Address", "GST"]],
      body: suppliers.map((row) => [
        row.code,
        row.name,
        row.group,
        row.address,
        row.gst,
      ]),
    });
    doc.save("suppliers.pdf");
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      suppliers.map((row) => ({
        Code: row.code,
        Name: row.name,
        Group: row.group,
        Address: row.address,
        GST: row.gst,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
    XLSX.writeFile(workbook, "suppliers.xlsx");
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase()) ||
      s.gst?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main-container">
      <div className="container-fluid p-3" id="supplier-container" tabIndex="-1">
        {/* Loading Indicator */}
        {loading && (
          <div className="text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        
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
        <div className="table-responsive">
          <table
            id="supplier-table"
            className="table table-bordered table-striped align-middle"
            style={{ fontSize: "12px" }}
          >
            <thead className="table-primary">
              <tr className="text-center">
                <th>Code</th>
                <th>Name</th>
                <th>Group</th>
                <th>Address</th>
                <th>GST</th>
                <th>Image</th>
                <th style={{ minWidth: "140px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="text-center">
                    <td>{supplier.code}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.group}</td>
                    <td>{supplier.address}</td>
                    <td>{supplier.gst}</td>
                    <td>
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
                        <span className="text-muted">No Image</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm p-0 me-1"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => handleEditSupplier(supplier)}
                        title="Edit"
                      >
                        <span
                          className="material-icons-two-tone text-warning"
                          style={{ fontSize: "16px" }}
                        >
                          edit
                        </span>
                      </button>
                      <button
                        className="btn btn-sm p-0 me-1"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          alert("Open Price List for " + supplier.name)
                        }
                        title="Price List"
                      >
                        <span
                          className="material-icons-two-tone text-info"
                          style={{ fontSize: "16px" }}
                        >
                          list_alt
                        </span>
                      </button>
                      <button
                        className="btn btn-sm p-0"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => deleteRow(supplier.id)}
                        title="Delete"
                      >
                        <span
                          className="material-icons-two-tone text-danger"
                          style={{ fontSize: "16px" }}
                        >
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No suppliers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Form Modal */}
        {showModal && (
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
                    <div className="mb-2">
                      <label className="form-label">Customer Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.customer_code}
                        readOnly
                      />
                    </div>

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
                        <option value="Hotel">Hotel</option>
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">GST</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.gst}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gst: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      ></textarea>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Image</label>
                      <div className="d-flex align-items-center">
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          onChange={handleImageUpload}
                          ref={fileInputRef}
                        />
                        {formData.image && (
                          <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={handleRemoveImage}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {previewImage && (
                        <div className="mt-2 text-center">
                          <img
                            src={previewImage}
                            alt="Preview"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              borderRadius: "6px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer py-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                    <button
                      id="saveSupplierBtn"
                      type="button"
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
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div className="modal-wrapper">
            <div className="modal-backdrop fade show" />
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-body text-center">
                    <img
                      src={previewImage}
                      alt="Full Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "80vh",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowImageModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierMaster;
