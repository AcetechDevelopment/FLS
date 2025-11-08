import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import React, { useState, useRef, useEffect, Fragment } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
  const [supplierGroups, setSupplierGroups] = useState([]);
  const [groupsLoaded, setGroupsLoaded] = useState(false);

  const fileInputRef = useRef(null);

  // ✅ Form state
  const [formData, setFormData] = useState({
    id: "",
    customer_name: "",
    customer_id: "",
    group_id: "",
    gst: "",
    address: "",
    image: null,
  });

  // ✅ Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSupplierGroups();
      await fetchSuppliers();
      setLoading(false);
    };
    loadData();
  }, []);

  // ✅ Fetch groups
  const fetchSupplierGroups = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/supplier-group/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSupplierGroups(res.data?.data || []);
      setGroupsLoaded(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch supplier groups.");
      setGroupsLoaded(true);
    }
  };

  // ✅ Fetch customers
  const fetchSuppliers = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/customer/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data?.data || [];
      const mappedList = list.map((item) => {
        const group = supplierGroups.find((g) => String(g.id) === String(item.group_id));
        return { ...item, group_name: group ? group.supplier_name : "" };
      });
      setSuppliers(mappedList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch suppliers.");
    }
  };

  // ✅ Image handling
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setFormData({ ...formData, image: file });
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ✅ Add new
  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      id: "",
      customer_name: "",
      customer_id: "",
      group_id: "",
      gst: "",
      address: "",
      image: null,
    });
    setPreviewImage(null);
    setShowModal(true);
  };

  // ✅ Edit supplier
  const handleEditSupplier = async (supplier) => {
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await axios.get(`${API_BASE_URL}/customer/edit/${supplier.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || {};
      setEditingSupplier(data);
      setFormData({
        id: data.id || "",
        customer_name: data.customer_name || "",
        customer_id: data.customer_id || "",
        group_id: data.group_id || "",
        gst: data.gst || "",
        address: data.address || "",
        image: data.image || null,
      });
      setPreviewImage(data.image || null);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load supplier details.");
    }
  };

  // ✅ Save
  const handleSaveSupplier = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) return toast.error("Unauthorized! Please login again.");
      if (!formData.customer_name || !formData.gst) {
        toast.error("Please fill all required fields");
        setIsSaving(false);
        return;
      }

      const formDataToSend = new FormData();
      if (editingSupplier) formDataToSend.append("id", formData.id);
      formDataToSend.append("customer_name", formData.customer_name.trim());
      formDataToSend.append("customer_id", formData.customer_id.trim());
      formDataToSend.append("group_id", formData.group_id || ""); // ✅ correct field
      formDataToSend.append("gst", formData.gst.trim());
      formDataToSend.append("address", formData.address || "");

      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      } else if (typeof formData.image === "string" && formData.image !== "") {
        formDataToSend.append("image_url", formData.image);
      }

      const url = editingSupplier
        ? `${API_BASE_URL}/customer/update`
        : `${API_BASE_URL}/customer/create`;

      const res = await axios.post(url, formDataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.status === "success" || res.data?.success) {
        toast.success(`Customer ${editingSupplier ? "updated" : "created"} successfully`);
        setShowModal(false);
        setFormData({
          id: "",
          customer_name: "",
          customer_id: "",
          group_id: "",
          gst: "",
          address: "",
          image: null,
        });
        setPreviewImage(null);
        setEditingSupplier(null);
        await fetchSuppliers();
      } else {
        toast.error(res.data?.message || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while saving supplier.");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Delete
  const deleteRow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await axios.delete(`${API_BASE_URL}/customer/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.status === "success") {
        toast.success("Customer deleted successfully!");
        fetchSuppliers();
      } else toast.error("Delete failed.");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting customer.");
    }
  };

  // ✅ Export PDF
  const exportPDF = () => {
    if (suppliers.length === 0) return alert("No data to export.");
    const doc = new jsPDF();
    doc.text("Supplier Master", 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [["Code", "Name", "Group", "Address", "GST"]],
      body: suppliers.map((s) => [
        s.customer_id,
        s.customer_name,
        s.group_name || s.group_id || "",
        s.address,
        s.gst,
      ]),
      theme: "grid",
    });
    doc.save("SupplierMaster.pdf");
  };

  // ✅ Export Excel
  const exportExcel = () => {
    if (suppliers.length === 0) return alert("No data to export.");
    const data = suppliers.map((s) => ({
      Code: s.customer_id,
      Name: s.customer_name,
      Group: s.group_name || s.group_id || "",
      Address: s.address,
      "GST No.": s.gst,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
    XLSX.writeFile(wb, "SupplierMaster.xlsx");
  };

  // ✅ Print
  const handlePrint = () => {
    const w = window.open("", "", "width=900,height=600");
    w.document.write("<h2>Supplier Master</h2>");
    w.document.write(document.getElementById("supplier-table").outerHTML);
    w.print();
  };

  // ✅ Filter
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.group_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Fragment>
      <div className="container-fluid p-3">
        {/* Toolbar */}
        <div className="d-flex flex-wrap gap-2 mb-2">
          <button className="btn btn-sm btn-success" onClick={handleNewSupplier}>
            + New
          </button>
          <button className="btn btn-sm btn-danger" onClick={exportPDF}>
            PDF
          </button>
          <button className="btn btn-sm btn-primary" onClick={exportExcel}>
            Excel
          </button>
          <button className="btn btn-sm btn-secondary" onClick={handlePrint}>
            Print
          </button>
          <input
            type="text"
            placeholder="Search..."
            className="form-control form-control-sm ms-auto"
            style={{ width: "200px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="table-responsive border">
          <table id="supplier-table" className="table table-sm text-center">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Group</th>
                <th>Address</th>
                <th>GST</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((s) => (
                  <tr key={s.id}>
                    <td>{s.customer_id}</td>
                    <td>{s.customer_name}</td>
                    <td>{s.group_name || s.group_id}</td>
                    <td>{s.address}</td>
                    <td>{s.gst}</td>
                    <td>
                      {s.image ? (
                        <img
                          src={s.image}
                          alt="img"
                          width="25"
                          height="25"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setPreviewImage(s.image);
                            setShowImageModal(true);
                          }}
                        />
                      ) : (
                        "No"
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-1"
                        onClick={() => handleEditSupplier(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteRow(s.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No suppliers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
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

                <div className="modal-body">
                  {editingSupplier && (
                    <div className="mb-2">
                      <label>Customer Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.customer_id}
                        readOnly
                      />
                    </div>
                  )}

                  <div className="mb-2">
                    <label>Customer Name</label>
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
                    <label>Customer Group</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.group_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          group_id: e.target.value ? Number(e.target.value) : "",
                        })
                      }
                    >
                      <option value="">Select</option>
                      {supplierGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.supplier_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label>GST</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.gst}
                      onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label>Address</label>
                    <textarea
                      className="form-control form-control-sm"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    ></textarea>
                  </div>

                  <div className="mb-2">
                    <label>Image</label>
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    {previewImage && (
                      <div className="mt-2 position-relative" style={{ width: "60px" }}>
                        <img
                          src={previewImage}
                          alt="preview"
                          width="60"
                          height="60"
                          style={{ objectFit: "cover", borderRadius: "5px" }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="btn-close btn-close-white position-absolute top-0 end-0 bg-danger"
                        ></button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer py-2">
                  <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleSaveSupplier}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image modal */}
        {showImageModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header py-2">
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
        )}
      </div>
    </Fragment>
  );
};

export default SupplierMaster;
