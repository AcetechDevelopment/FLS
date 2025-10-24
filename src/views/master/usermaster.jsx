import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "https://115.124.111.111/FLS/public/api/auth";

const UserMaster = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    role: "User",
  });

  const inputRefs = useRef([]);

  const roleMap = { Admin: 1, Manager: 2, User: 3 };

// inside handleSaveUser
const payload = {
  name: formData.name,
  mobile: formData.mobile,
  email: formData.email,
  role_id: roleMap[formData.role] || null,
};

  // Fetch users from API
const fetchUsers = async () => {
  try {
    const token = sessionStorage.getItem("authToken");
    const { data } = await axios.get(`${API_BASE}/userlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("API userlist data:", data);

    setUsers(data.data || data.users || []);
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch users");
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = inputRefs.current[index + 1];
      if (next) next.focus();
    }
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setFormData({ name: "", mobile: "", email: "", role: "User" });
    setShowModal(true);
  };

// When editing a user, make sure all fields are populated correctly
const handleEditUser = (user) => {
  setEditingUser(user);
  setFormData({
    name: user.name || "",
    email: user.email || "", // ✅ ensure email field is set
    mobile: user.mobile || "",
    role_id: user.role_id || roleMap[user.role] || 0, // ✅ handle role_id properly
  });
  setShowModal(true);
};

// const handleSaveUser = async () => {
//   const token = sessionStorage.getItem("authToken");

//   const payload = {
//     email: formData.name, // change to your email field if you have one
//     role_id: getRoleId(formData.role),
//     mobile: formData.mobile
//   };

//   try {
//     if (editingUser) {
//       // Update user
//       await axios.post(`${API_BASE}/update_user/${editingUser.id}`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("User updated successfully");
//     } else {
//       // Add new user
//       await axios.post(`${API_BASE}/register`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("User added successfully");
//     }

//     setShowModal(false);
//     fetchUsers();
//   } catch (error) {
//     console.error(error.response?.data || error);
//     toast.error(error.response?.data?.message || "Failed to save user");
//   }
// };

const handleSaveUser = async () => {
  const token = sessionStorage.getItem("authToken");
  if (!token) return toast.error("Unauthorized. Please login again.");

  // ✅ Basic validation
  if (!formData.name || !formData.email || !formData.mobile || !formData.role_id) {
    return toast.warning("Please fill all required fields");
  }

  const payload = {
    id: editingUser?.id, // 🔹 Backend needs this for update
    name: formData.name.trim(),
    email: formData.email.trim(),
    mobile: formData.mobile.trim(),
    password: formData.password?.trim() || undefined, // optional if not changing
    role_id: formData.role_id,
  };

  try {
    let response;

    if (editingUser) {
      // 🔹 Update existing user using PUT
      response = await axios.put(
        "https://115.124.111.111/FLS/public/api/auth/update_user",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("✅ User updated successfully");

      const updatedUser = response.data?.data || { ...editingUser, ...payload };

      // ✅ Update the user in local state instantly
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? updatedUser : u))
      );

    } else {
      // 🔹 Create new user
      response = await axios.post(
        "https://115.124.111.111/FLS/public/api/auth/register",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("✅ User added successfully");

      const newUser = response.data?.data || payload;
      setUsers((prev) => [...prev, newUser]);
    }

    // ✅ Reset form and close modal
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", mobile: "", role_id: "" });

  } catch (error) {
    console.error("Error saving user:", error);
    const errMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to save user";
    toast.error(`❌ ${errMsg}`);
  }
};


  const deleteRow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const token = sessionStorage.getItem("authToken");
    try {
      await axios.delete(`${API_BASE}/delete_user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    }
  };

  // Export PDF
  const exportPDF = () => {
    if (users.length === 0) return toast.warning("No users available to export");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("User Master", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Name", "Phone", "Role"]],
      body: users.map((u) => [u.name, u.mobile, u.role]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] },
    });

    doc.save("UserMaster.pdf");
  };

  // Export Excel
  const exportExcel = () => {
    if (users.length === 0) return toast.warning("No users available to export");

    const data = users.map((u) => ({ Name: u.name, Phone: u.mobile, Role: u.role }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "UserMaster.xlsx");
  };

  // Print table
  const handlePrint = () => {
    if (users.length === 0) return toast.warning("No users available to print");

    const tableHTML = `
      <table>
        <thead>
          <tr><th>Name</th><th>Phone</th><th>Role</th></tr>
        </thead>
        <tbody>
          ${users
            .map((u) => `<tr><td>${u.name}</td><td>${u.mobile}</td><td>${u.role}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    `;

    const printWindow = window.open("", "", "width=900,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>User Master</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0d6efd; color: white; }
          </style>
        </head>
        <body>
          <h2>User Master</h2>
          ${tableHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      {/* Toolbar */}
      {/* <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <button className="btn btn-outline-primary me-2" onClick={handleNewUser}>
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
      </div> */}

      {/* Toolbar */}
<div className="d-flex justify-content-between align-items-center mb-2 px-2">
  {/* ✅ Action Buttons */}
  <div className="d-flex flex-wrap gap-2">
    {/* New User */}
    <button
      className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center"
      style={{ borderRadius: "8px", fontSize: "13px" }}
      onClick={handleNewUser}
    >
      <span
        className="material-icons-two-tone me-1"
        style={{ fontSize: "12px" }}
      >
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
      <span
        className="material-icons-two-tone me-1"
        style={{ fontSize: "14px" }}
      >
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
      <span
        className="material-icons-two-tone me-1"
        style={{ fontSize: "14px" }}
      >
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
      <span
        className="material-icons-two-tone me-1"
        style={{ fontSize: "14px" }}
      >
        print
      </span>
      Print
    </button>
  </div>

  {/* ✅ Search Box */}
  <div style={{ width: "250px" }}>
    <input
      type="text"
      className="form-control form-control-sm"
      placeholder="🔍 Search user..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{ borderRadius: "8px" }}
    />
  </div>
</div>

      {/* ✅ Responsive Table */}
  

<div className="table-responsive">
  <table
    id="user-table"
    className="table table-bordered align-middle"
    style={{
      fontSize: "10px",       // reduced font size
      borderColor: "#dee2e6",
      marginBottom: "0",
    }}
  >
    <thead
      style={{
        backgroundColor: "#009efb",
        color: "#fff",
        fontSize: "10px",    // reduced font size
      }}
    >
      <tr className="text-center">
        <th className="py-0 px-1">Name</th>
        <th className="py-0 px-1">Phone No</th>
        <th className="py-0 px-1">Email</th>
        <th className="py-0 px-1">Role</th>
        <th className="py-0 px-1" style={{ minWidth: "100px" }}>Action</th>
      </tr>
    </thead>

    <tbody style={{ lineHeight: "1" }}>
      {filteredUsers.map((user) => (
        <tr
          key={user.id}
          className="text-center"
          style={{ fontSize: "10px", lineHeight: "1" }}
        >
          <td className="py-0 px-1 align-middle">{user.name}</td>
          <td className="py-0 px-1 align-middle">{user.mobile}</td>
          <td className="py-0 px-1 align-middle">{user.email}</td>

          {/* Password placeholder
          <td className="py-0 px-1 text-center align-middle" style={{ width: "120px" }}>
            <input
              type="password"
              className="form-control form-control-sm border-0 bg-transparent text-center p-0 m-0"
              value={user.password ? user.password : "••••••"}
              readOnly
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              style={{
                fontSize: "10px",
                height: "16px",
                lineHeight: "1",
              }}
            />
          </td> */}

          <td className="py-0 px-1 align-middle">
            {user.role_id ? { 1: "Admin", 2: "Manager", 3: "User" }[user.role_id] : user.role || "-"}
          </td>

          {/* Action buttons */}
        	<td className="py-0 px-1 align-middle">
  <button
    className="btn btn-sm p-0 me-1"
    style={{ background: "transparent", border: "none", padding: 0 }}
    onClick={() => handleEditUser(user)}
  >
    <span
      className="material-icons-two-tone text-warning"
      style={{ fontSize: "15px", verticalAlign: "middle", cursor: "pointer" }}
    >
      edit
    </span>
  </button>
  <button
    className="btn btn-sm p-0"
    style={{ background: "transparent", border: "none", padding: 0 }}
    onClick={() => deleteRow(user.id)}
  >
    <span
      className="material-icons-two-tone text-danger"
      style={{ fontSize: "15px", verticalAlign: "middle", cursor: "pointer" }}
    >
      delete
    </span>
  </button>
</td>

        </tr>
      ))}

      {filteredUsers.length === 0 && (
        <tr>
          <td colSpan="5" className="text-center text-muted" style={{ fontSize: "10px", padding: "2px 0" }}>
            No users found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


      {/* Modal */}
{showModal && (
  <div
    className="modal fade show d-block"
    tabIndex="-1"
    style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
  >
    <div className="modal-dialog modal-sm modal-dialog-centered">
      <div className="modal-content" style={{ fontSize: "13px" }}>
        
        {/* Header */}
        <div className="modal-header py-1 px-2">
          <h5 className="modal-title" style={{ fontSize: "14px" }}>
            {editingUser ? "Edit User" : "Add User"}
          </h5>
          <button
            type="button"
            className="btn-close btn-sm"
            onClick={() => setShowModal(false)}
          ></button>
        </div>

        {/* Body */}
      <div className="modal-body p-2">

  {/* Name */}
  <div className="mb-1">
    <label className="form-label mb-0" style={{ fontSize: "12px" }}>
      Name
    </label>
    <input
      type="text"
      className="form-control form-control-sm"
      style={{ height: "26px" }}
      value={formData.name || ""}
      onChange={(e) =>
        setFormData({ ...formData, name: e.target.value })
      }
      ref={(el) => (inputRefs.current[0] = el)}
      onKeyDown={(e) => handleKeyDown(e, 0)}
    />
  </div>

  {/* Email */}
  <div className="mb-1">
    <label className="form-label mb-0" style={{ fontSize: "12px" }}>
      Email
    </label>
    <input
      type="email"
      className="form-control form-control-sm"
      style={{ height: "26px" }}
      value={formData.email || ""}
      onChange={(e) =>
        setFormData({ ...formData, email: e.target.value })
      }
      ref={(el) => (inputRefs.current[1] = el)}
      onKeyDown={(e) => handleKeyDown(e, 1)}
    />
  </div>

  {/* Mobile */}
  <div className="mb-1">
    <label className="form-label mb-0" style={{ fontSize: "12px" }}>
      Mobile
    </label>
    <input
      type="text"
      className="form-control form-control-sm"
      style={{ height: "26px" }}
      value={formData.mobile || ""}
      onChange={(e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value))
          setFormData({ ...formData, mobile: value });
      }}
      maxLength={10}
      ref={(el) => (inputRefs.current[2] = el)}
      onKeyDown={(e) => handleKeyDown(e, 2)}
    />
  </div>

  {/* Password */}
{/* Password - show only for new user */}
{!editingUser && (
  <div className="mb-1">
    <label className="form-label mb-0" style={{ fontSize: "12px" }}>
      Password
    </label>
    <input
      type={formData.showPassword ? "text" : "password"}
      className="form-control form-control-sm"
      style={{ height: "26px" }}
      value={formData.password || ""}
      onChange={(e) =>
        setFormData({ ...formData, password: e.target.value })
      }
      onFocus={() =>
        setFormData({ ...formData, showPassword: true })
      }
      onBlur={() =>
        setFormData({ ...formData, showPassword: false })
      }
      ref={(el) => (inputRefs.current[3] = el)}
      onKeyDown={(e) => handleKeyDown(e, 3)}
    />
  </div>
)}

  {/* Role */}
  <div className="mb-1">
    <label className="form-label mb-0" style={{ fontSize: "12px" }}>
      Role
    </label>
    <select
      className="form-select form-select-sm"
      value={formData.role_id || 0}
      onChange={(e) =>
        setFormData({ ...formData, role_id: Number(e.target.value) })
      }
      ref={(el) => (inputRefs.current[4] = el)}
      onKeyDown={(e) => handleKeyDown(e, 4)}
    >
      <option value={0}>Select Role</option>
      <option value={1}>Admin</option>
      <option value={2}>Manager</option>
      <option value={3}>User</option>
    </select>
  </div>

</div>
        {/* Footer */}
        <div className="modal-footer py-1 px-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={handleSaveUser}
            ref={(el) => (inputRefs.current[4] = el)}
          >
            {editingUser ? "Update" : "Add"}
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  </div>
)}

    </div>

  );
};

export default UserMaster;