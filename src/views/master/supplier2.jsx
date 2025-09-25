import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// API Base URL
const API_BASE_URL = "https://10.9.76.62/FLS/public/api";

// Auth token helper
const getAuthToken = () => {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    toast.error("Session expired. Please login again.");
    window.location.href = "/login";
    return null;
  }
  return token;
};

const SupplierMaster = () => {
  // State
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    customer_name: "",
    customer_code: "",
    customer_group: "",
    gst: "",
    address: "",
    image: null,
  });

  // Refs
  const inputRefs = useRef([]);
  const fileInputRef = useRef(null);

  // Effect: Focus main container when modals close
  useEffect(() => {
    if (!showModal && !showImageModal) {
      document.getElementById('supplier-container')?.focus();
    }
  }, [showModal, showImageModal]);

  // Effect: Load suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ✅ API Functions
  const fetchSuppliers = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/customer/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setSuppliers(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.message || 'Error loading customers');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper Functions
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateSupplierCode = () => {
    const nextNumber = suppliers.length + 1;
    return `SUP${String(nextNumber).padStart(3, "0")}`;
  };

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

  // ✅ CRUD Functions
  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      id: "",
      customer_name: "",
      customer_code: generateSupplierCode(),
      customer_group: "",
      gst: "",
      address: "",
      image: null
    });
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowModal(true);
  };

  const handleEditSupplier = async (supplier) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(
        `${API_BASE_URL}/customer/edit/${supplier.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        const data = response.data.data;
        setEditingSupplier(data);
        setFormData({
          id: data.id,
          customer_name: data.customer_name || '',
          customer_code: data.customer_code || '',
          customer_group: data.customer_group || '',
          gst: data.gst || '',
          address: data.address || '',
          image: data.image || null
        });
        setPreviewImage(data.image || null);
        setShowModal(true);
      } else {
        toast.error(response.data.message || 'Failed to fetch supplier details');
      }
    } catch (error) {
      console.error('Error editing supplier:', error);
      toast.error(error.response?.data?.message || 'Error loading supplier details');
    }
  };

  const handleSaveSupplier = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      if (!formData.customer_name || !formData.customer_code || !formData.gst) {
        toast.error('Please fill all required fields');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('id', formData.id);
      formDataToSend.append('customer_name', formData.customer_name);
      formDataToSend.append('customer_code', formData.customer_code);
      formDataToSend.append('customer_group', formData.customer_group);
      formDataToSend.append('gst', formData.gst);
      formDataToSend.append('address', formData.address);
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingSupplier 
        ? `${API_BASE_URL}/customer/update`
        : `${API_BASE_URL}/customer/create`;

      const response = await axios.post(url, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        toast.success(`Customer ${editingSupplier ? 'updated' : 'created'} successfully!`);
        fetchSuppliers();
        setShowModal(false);
      } else {
        toast.error(response.data.message || `Failed to ${editingSupplier ? 'update' : 'create'} customer`);
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast.error(error.response?.data?.message || `Error ${editingSupplier ? 'updating' : 'creating'} customer`);
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.delete(`${API_BASE_URL}/customer/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        toast.success('Customer deleted successfully!');
        setSuppliers(suppliers.filter(s => s.id !== id));
      } else {
        toast.error(response.data.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error(error.response?.data?.message || 'Error deleting customer');
    }
  };

  // ✅ Export Functions
  const exportPDF = () => {
    if (suppliers.length === 0) {
      alert("No customers available to export.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Customer Master", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Customer Code", "Customer Name", "Group", "Address", "GST"]],
      body: suppliers.map((s) => [
        s.customer_code,
        s.customer_name,
        s.customer_group || "",
        s.address || "",
        s.gst
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] },
    });

    doc.save("CustomerMaster.pdf");
  };

  const exportExcel = () => {
    if (suppliers.length === 0) {
      alert("No customers available to export.");
      return;
    }

    const data = suppliers.map((s) => ({
      "Customer Code": s.customer_code,
      "Customer Name": s.customer_name,
      "Group": s.customer_group || "",
      "Address": s.address || "",
      "GST No.": s.gst,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "CustomerMaster.xlsx");
  };

  const handlePrint = () => {
    if (suppliers.length === 0) {
      alert("No customers available to print.");
      return;
    }

    const table = document.getElementById("supplier-table");
    const cloneTable = table.cloneNode(true);

    const ths = cloneTable.querySelectorAll("thead th");
    if (ths.length >= 6) {
      ths[5].remove();
      ths[6].remove();
    }

    const trs = cloneTable.querySelectorAll("tbody tr");
    trs.forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length >= 6) {
        tds[5].remove();
        tds[6].remove();
      }
    });

    const printWindow = window.open("", "", "width=900,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Master</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #0d6efd; color: white; }
          </style>
        </head>
        <body>
          <h2>Customer Master</h2>
          ${cloneTable.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_code?.toLowerCase().includes(search.toLowerCase()) ||
      s.gst?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="supplier-page">
      <div className="container p-3" id="supplier-container" tabIndex="-1">
        {/* Loading Indicator */}
        {loading && (
          <div className="text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Toolbar */}
        <div className="d-flex flex-wrap gap-2 mb-2">
          <button
            className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center"
            onClick={handleNewSupplier}
          >
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
              add
            </span>
            New
          </button>

          <button
            className="btn btn-sm btn-danger py-1 px-2 d-flex align-items-center"
            onClick={exportPDF}
          >
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
              picture_as_pdf
            </span>
            PDF
          </button>

          <button
            className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center"
            onClick={exportExcel}
          >
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
              grid_on
            </span>
            Excel
          </button>

          <button
            className="btn btn-sm btn-primary py-1 px-2 d-flex align-items-center"
            onClick={handlePrint}
          >
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
              print
            </span>
            Print
          </button>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table id="supplier-table" className="table table-bordered table-hover">
            <thead className="table-primary">
              <tr className="text-center">
                <th>Code</th>
                <th>Name</th>
                <th>Group</th>
                <th>Address</th>
                <th>GST</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.customer_code}</td>
                  <td>{supplier.customer_name}</td>
                  <td>{supplier.customer_group}</td>
                  <td>{supplier.address}</td>
                  <td>{supplier.gst}</td>
                  <td className="text-center">
                    {supplier.image ? (
                      <img
                        src={supplier.image}
                        alt="Customer"
                        width="30"
                        height="30"
                        className="rounded cursor-pointer"
                        onClick={() => {
                          setPreviewImage(supplier.image);
                          setShowImageModal(true);
                        }}
                      />
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-link p-0 me-2"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <span className="material-icons-two-tone text-warning">
                        edit
                      </span>
                    </button>
                    <button
                      className="btn btn-sm btn-link p-0"
                      onClick={() => deleteRow(supplier.id)}
                    >
                      <span className="material-icons-two-tone text-danger">
                        delete
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Form Modal */}
        {showModal && (
          <>
            <div className="modal-backdrop fade show" />
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingSupplier ? "Edit Customer" : "Add Customer"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                    />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Customer Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.customer_code}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Customer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.customer_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customer_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Group</label>
                      <select
                        className="form-select"
                        value={formData.customer_group}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customer_group: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Group</option>
                        <option value="Hospital">Hospital</option>
                        <option value="Hotel">Hotel</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">GST Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.gst}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gst: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={handleImageUpload}
                        accept="image/*"
                        ref={fileInputRef}
                      />
                      {previewImage && (
                        <div className="mt-2">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="rounded"
                            style={{ maxWidth: "100px" }}
                          />
                          <button
                            className="btn btn-sm btn-danger ms-2"
                            onClick={handleRemoveImage}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveSupplier}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <>
            <div className="modal-backdrop fade show" />
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-body p-0">
                    <img
                      src={previewImage}
                      alt="Full size"
                      className="img-fluid"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowImageModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupplierMaster;
