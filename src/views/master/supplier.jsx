import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useRef, useEffect, Fragment } from "react";
import { toast } from "react-toastify";
import { apiService } from "../../services/api";
import Loading from "../../components/Loading";
import { exportTableToPDF, exportTableToExcel, printTable } from "../../utils/exportUtils";

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


  const inputRefs = useRef([]);
  const fileInputRef = useRef(null);

  // Return focus to the main container when modal closes
  useEffect(() => {
    if (!showModal && !showImageModal) {
      document.getElementById("supplier-container")?.focus();
    }
  }, [showModal, showImageModal]);


  const [formData, setFormData] = useState({
    id: "",
    customer_name: "",
    customer_id: "",
    group_id: "",
    gst: "",
    address: "",
    image: null,
  });

  // ✅ Fetch suppliers

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const resData = await apiService.getCustomers();
      const list =
        resData?.data ||
        resData?.customers ||
        resData?.list ||
        (Array.isArray(resData) ? resData : []);

      if (list.length > 0) {
        // ✅ Map group_id → supplier_name

const mappedList = list.map((item) => {
  const group = supplierGroups.find(
    (g) => String(g.id) === String(item.group_id)
  );
  return {
    ...item,
    group_name: group ? group.supplier_name : "", // ✅ Add readable group name
  };
});
setSuppliers(mappedList);

      } else {
        toast.warn("No customers found.");
      }
    } catch (error) {
      toast.error("Failed to fetch suppliers.");
    } finally {
      setLoading(false);
    }
  };

const fetchSupplierGroups = async () => {
  try {
    const groupsData = await apiService.getSupplierGroups();
    if (groupsData && Array.isArray(groupsData)) {
      setSupplierGroups(groupsData);
      setGroupsLoaded(true); // ✅ mark ready
    } else {
      toast.warn("No supplier groups found.");
      setGroupsLoaded(true); // ✅ still mark ready to avoid waiting forever
    }
  } catch (error) {
    toast.error("Failed to fetch supplier groups.");
    setGroupsLoaded(true);
  }
};

  // // ✅ Add this right below
  // useEffect(() => {
  //   fetchSupplierGroups(); // first load groups
  // }, []);

  // useEffect(() => {
  //   if (groupsLoaded) {
  //     fetchSuppliers(); // only load suppliers after groups loaded
  //   }
  // }, [groupsLoaded]);
  
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    await fetchSupplierGroups();
    await fetchSuppliers();
    setLoading(false);
  };
  loadData();
}, []);


  // ✅ Remove image
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreviewImage(null);
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
      customer_id: "",
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
    // ✅ Try both possible endpoints — fallback if edit fails
    let response;
    try {
      response = await apiService.editCustomer(supplier.id);
    } catch {
      response = await apiService.getCustomer(supplier.id);
    }

    // ✅ Normalize response
    const resData = response;
    const data = resData?.data || resData?.customer || resData;

    if (data && Object.keys(data).length > 0) {

      setEditingSupplier(data);
      setFormData({
        id: data.id || "",
        customer_name: data.customer_name || "",
        customer_id: data.customer_id || supplier.customer_id || "",
        customer_group: data.group_id || "",
        gst: data.gst || "",
        address: data.address || "",
        image: data.image || null,
      });

      setPreviewImage(data.image || null);
      setShowModal(true);
    } else {
      toast.error(resData?.message || "Failed to fetch supplier details.");
    }
  } catch (error) {
    if (error.response) {
      toast.error(
        error.response.data?.message ||
          "Server error while fetching details."
      );
    } else {
      toast.error("Network error while loading supplier details.");
    }
  }
};

// ✅ Save supplier (Create or Update)
const handleSaveSupplier = async () => {
  if (isSaving) return;
  setIsSaving(true);

  try {
    // ✅ Basic validation
    if (!formData.customer_name || !formData.gst) {
      toast.error("Please fill all required fields");
      setIsSaving(false);
      return;
    }

    // ✅ Prepare form data
    const formDataToSend = new FormData();
    if (editingSupplier) formDataToSend.append("id", formData.id);
    formDataToSend.append("customer_name", formData.customer_name.trim());
    formDataToSend.append("customer_id", formData.customer_id.trim());
    formDataToSend.append(
      "customer_group",
      formData.customer_group !== "" ? formData.customer_group : ""
    );
    formDataToSend.append("gst", formData.gst.trim());
    formDataToSend.append("address", formData.address || "");

    if (formData.image instanceof File) {
      formDataToSend.append("image", formData.image);
    } else if (typeof formData.image === "string" && formData.image !== "") {
      formDataToSend.append("image_url", formData.image);
    }

    const response = editingSupplier
      ? await apiService.updateCustomer(formDataToSend)
      : await apiService.createCustomer(formDataToSend);

    if (
      response.status === "success" ||
      response.success === true ||
      response.message?.toLowerCase().includes("success")
    ) {
      toast.success(
        response.message || `Customer ${editingSupplier ? "updated" : "created"} successfully!`
      );

      // ✅ Reset form and close modal
      setFormData({
        id: "",
        customer_name: "",
        customer_id: "",
        customer_group: "",
        gst: "",
        address: "",
        image: null,
      });
      setPreviewImage(null);
      setEditingSupplier(null);
      setShowModal(false);

      // ✅ Refresh list
      await fetchSuppliers();
    } else {
      toast.error(response.message || "Failed to save customer");
    }
  } catch (error) {
    toast.error("Something went wrong while saving supplier.");
  } finally {
    setIsSaving(false);
  }
};

// ✅ Delete supplier
const deleteRow = async (id) => {
  if (!window.confirm("Are you sure you want to delete this customer?")) return;

  try {
    const response = await apiService.deleteCustomer(id);

    if (
      response.status === "success" ||
      response.success === true ||
      response.message?.toLowerCase().includes("success")
    ) {
      toast.success(response.message || "Customer deleted successfully!");
      fetchSuppliers();
    } else {
      toast.error(response.message || "Failed to delete customer");
    }
  } catch (error) {

    if (error.response) {
      toast.error(
        error.response.data?.message ||
          "Server error while deleting customer"
      );
    } else if (error.request) {
      toast.error("No response from server. Please check your network.");
    } else {
      toast.error("Unexpected error occurred while deleting customer.");
    }
  }
};

  // ✅ Export PDF
  const exportPDF = () => {
    const headers = ["Code", "Name", "Group", "Address", "GST"];
    const rows = suppliers.map((s) => [
      s.customer_id,
      s.customer_name,
      s.customer_group || "",
      s.address || "",
      s.gst,
    ]);
    exportTableToPDF({
      title: "Supplier Master",
      filename: "SupplierMaster.pdf",
      headers,
      rows,
    });
  };

  // ✅ Export Excel
  const exportExcel = () => {
    const headers = ["Code", "Name", "Group", "Address", "GST No."];
    const rows = suppliers.map((s) => [
      s.customer_id,
      s.customer_name,
      s.customer_group || "",
      s.address || "",
      s.gst,
    ]);
    exportTableToExcel({
      filename: "SupplierMaster.xlsx",
      sheetName: "Suppliers",
      headers,
      rows,
    });
  };

  // ✅ Print
  const handlePrint = () => {
    const headers = ["Code", "Name", "Group", "Address", "GST"];
    const rows = suppliers.map((s) => [
      s.customer_id,
      s.customer_name,
      s.customer_group || "",
      s.address || "",
      s.gst,
    ]);
    printTable({
      title: "Supplier Master",
      headers,
      rows,
    });
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
                border: "1.5px solid #2f2f2f", // Outer bold border
                borderRadius: "4px",
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
                  borderCollapse: "collapse", // ✅ Perfect alignment for Excel-like lines
                  tableLayout: "fixed",
                }}
              >
                {/* Header */}
                <thead
                  style={{
                    backgroundColor: "#e3f0fd",
                    color: "#000",
                    fontWeight: "700",
                  }}
                >
                  <tr>
                    {["Code", "Name", "Group", "Address", "GST", "Image", "Action"].map(
                      (header, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "6px 5px",
                            border: "1.5px solid #2f2f2f", // 🟩 Equal border thickness for all sides
                            textAlign: "center",
                            verticalAlign: "middle",
                            background: "#e3f0fd",
                          }}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                {/* Body */}
                {/* <tbody>
                  {Array.isArray(filteredSuppliers) && filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier, index) => (
                      <tr
                        key={supplier.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f6f8fa",
                          transition: "background-color 0.15s ease-in-out",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#e0ebff")
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          index % 2 === 0 ? "#ffffff" : "#f6f8fa")
                        }
                      >
                        <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                          {supplier.customer_id}
                        </td>
                        <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                          {supplier.customer_name}
                        </td>
                        <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                          {supplier.customer_group}
                        </td>
                        <td
                          style={{
                            padding: "4px 5px",
                            border: "1.5px solid #2f2f2f",
                            textAlign: "left",
                          }}
                        >
                          {supplier.address}
                        </td>
                        <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                          {supplier.gst}
                        </td>
                        <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                          {supplier.image ? (
                            <img
                              src={supplier.image}
                              alt="Supplier"
                              width="20"
                              height="20"
                              style={{
                                borderRadius: "2px",
                                objectFit: "cover",
                                cursor: "pointer",
                                transition: "transform 0.2s ease-in-out",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform = "scale(1.1)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                              }
                              onClick={() => {
                                setPreviewImage(supplier.image);
                                setShowImageModal(true);
                              }}
                            />
                          ) : (
                            <span style={{ color: "#6c757d", fontSize: "9px" }}>
                              No Image
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                         
                          <button
                            className="btn btn-sm p-0 me-1"
                            style={{
                              background: "transparent",
                              border: "none",
                              transition: "transform 0.1s ease-in-out",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                            onClick={() => handleEditSupplier(supplier)}
                            title="Edit"
                          >
                            <span
                              className="material-icons-two-tone"
                              style={{
                                fontSize: "12px",
                                color: "#ffc107",
                                cursor: "pointer",
                              }}
                            >
                              edit
                            </span>
                          </button>
                          <button
                            className="btn btn-sm p-0 me-1"
                            style={{
                              background: "transparent",
                              border: "none",
                              transition: "transform 0.1s ease-in-out",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                            onClick={() =>
                              alert("Open Price List for " + supplier.customer_name)
                            }
                            title="Price List"
                          >
                            <span
                              className="material-icons-two-tone"
                              style={{
                                fontSize: "12px",
                                color: "#0dcaf0",
                                cursor: "pointer",
                              }}
                            >
                              list_alt
                            </span>
                          </button>

                          <button
                            className="btn btn-sm p-0"
                            style={{
                              background: "transparent",
                              border: "none",
                              transition: "transform 0.1s ease-in-out",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                            onClick={() => deleteRow(supplier.id)}
                            title="Delete"
                          >
                            <span
                              className="material-icons-two-tone"
                              style={{
                                fontSize: "12px",
                                color: "#dc3545",
                                cursor: "pointer",
                              }}
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
                          border: "1.5px solid #2f2f2f",
                          fontWeight: "500",
                        }}
                      >
                        No suppliers found
                      </td>
                    </tr>
                  )}
                </tbody> */}
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7">
                        <Loading message="Loading suppliers..." />
                      </td>
                    </tr>
                  ) : Array.isArray(filteredSuppliers) && filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier, index) => (
                      // existing supplier rows
                      <tr
                        key={supplier.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f6f8fa",
                          transition: "background-color 0.15s ease-in-out",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#e0ebff")
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          index % 2 === 0 ? "#ffffff" : "#f6f8fa")
                        }
                      >
                        <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                          {supplier.customer_id}
                        </td>
                        <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                          {supplier.customer_name}
                        </td>
<td>{supplier.group_name || supplier.group_id}</td>
                        
                        <td
                          style={{
                            padding: "4px 5px",
                            border: "1.5px solid #2f2f2f",
                            textAlign: "left",
                          }}
                        >
                          {supplier.address}
                        </td>
                        <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                          {supplier.gst}
                        </td>
                        <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                          {supplier.image ? (
                            <img
                              src={supplier.image}
                              alt="Supplier"
                              width="20"
                              height="20"
                              style={{
                                borderRadius: "2px",
                                objectFit: "cover",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setPreviewImage(supplier.image);
                                setShowImageModal(true);
                              }}
                            />
                          ) : (
                            <span style={{ color: "#6c757d", fontSize: "9px" }}>No Image</span>
                          )}
                        </td>
                           <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                         
                          <button
                            className="btn btn-sm p-0 me-1"
                            style={{
                              background: "transparent",
                              border: "none",
                              transition: "transform 0.1s ease-in-out",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                            onClick={() => handleEditSupplier(supplier)}
                            title="Edit"
                          >
                            <span
                              className="material-icons-two-tone"
                              style={{
                                fontSize: "12px",
                                color: "#ffc107",
                                cursor: "pointer",
                              }}
                            >
                              edit
                            </span>
                          </button>
                          <button
                            className="btn btn-sm p-0 me-1"
                            style={{
                              background: "transparent",
                              border: "none",
                              transition: "transform 0.1s ease-in-out",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                            onClick={() =>
                              alert("Open Price List for " + supplier.customer_name)
                            }
                            title="Price List"
                          >
                            <span
                              className="material-icons-two-tone"
                              style={{
                                fontSize: "12px",
                                color: "#0dcaf0",
                                cursor: "pointer",
                              }}
                            >
                              list_alt
                            </span>
                          </button>

                          <button
                            className="btn btn-sm p-0"
                            style={{
                              background: "transparent",
                              border: "none",
                              transition: "transform 0.1s ease-in-out",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                            onClick={() => deleteRow(supplier.id)}
                            title="Delete"
                          >
                            <span
                              className="material-icons-two-tone"
                              style={{
                                fontSize: "12px",
                                color: "#dc3545",
                                cursor: "pointer",
                              }}
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
                          border: "1.5px solid #2f2f2f",
                          fontWeight: "500",
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
                            onClick={() => {
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
                            }}
                          ></button>
                        </div>

                        <div
                          className="modal-body p-2"
                          style={{ maxHeight: "300px", overflowY: "auto" }}
                        >
                          {/* Customer Code (Read-only in Edit Mode) */}
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

                          {/* Customer Name */}
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

                          {/* Customer Group */}
                          <div className="mb-2">
                            <label className="form-label">Customer Group</label>

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



                            {/* 
 <select
  className="form-select form-select-sm"
  value={formData.customer_group}
  onChange={(e) =>
    setFormData({
      ...formData,
      customer_group: e.target.value ? Number(e.target.value) : "",
    })
  }
>
  <option value="">Select</option>
  {supplierGroups.map((group) => (
    <option key={group.id} value={group.id}>
      {group.supplier_name}
    </option>
  ))}
</select> */}
                          </div>

                          {/* GST */}
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

                          {/* Address */}
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

                          {/* Image Upload */}
                          <div className="mb-2 position-relative">
                            <label className="form-label">Image</label>
                            <input
                              type="file"
                              className="form-control form-control-sm"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                            />
                            {previewImage && (
                              <div
                                className="position-relative mt-1"
                                style={{ width: "50px", height: "50px" }}
                              >
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

                        {/* Footer */}
                        <div className="modal-footer py-2">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setShowModal(false);
                              setFormData({
                                id: "",
                                customer_name: "",
                                customer_id: "",
                                customer_group: "",
                                gst: "",
                                address: "",
                                image: null,
                              });
                              setPreviewImage(null);
                              setEditingSupplier(null);
                            }}
                          >
                            Close
                          </button>

                          <button
                            id="saveSupplierBtn"
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
