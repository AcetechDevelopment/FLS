import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";   // ✅ Correct way
import * as XLSX from "xlsx";

const UserMaster = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    role: "User",
  });

  // Open modal for new user
  const handleNewUser = () => {
    setEditingUser(null);
    setFormData({ name: "", phone: "", password: "", role: "User" });
    setShowModal(true);
  };

  // Open modal for editing user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData(user);
    setShowModal(true);
  };

  // Save user (add or update)
  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id ? { ...formData, id: editingUser.id } : u
        )
      );
    } else {
      setUsers([...users, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  // Delete user
  const deleteRow = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };
// ✅ Export PDF
const exportPDF = () => {
  if (users.length === 0) {
    alert("No users available to export.");
    return;
  }

  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text("User Master", 14, 15);

  // ✅ Removed Password column
  autoTable(doc, {
    startY: 25,
    head: [["Name", "Phone", "Role"]], 
    body: users.map((u) => [u.name, u.phone, u.role]), 
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 123, 255] }, // Bootstrap blue header
  });

  doc.save("UserMaster.pdf");
};

// ✅ Export Excel
const exportExcel = () => {
  if (users.length === 0) {
    alert("No users available to export.");
    return;
  }

  // ✅ Removed Password column
  const data = users.map((u) => ({
    Name: u.name,
    Phone: u.phone,
    Role: u.role,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  XLSX.writeFile(workbook, "UserMaster.xlsx");
};

// ✅ Print Table
const handlePrint = () => {
  if (users.length === 0) {
    alert("No users available to print.");
    return;
  }

  // ✅ Build table without Password column
  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        ${users
          .map(
            (u) => `
          <tr>
            <td>${u.name}</td>
            <td>${u.phone}</td>
            <td>${u.role}</td>
          </tr>
        `
          )
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


  // ✅ Filtered users
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
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
<div className="d-flex justify-content-between align-items-center mb-3">
  {/* ✅ Action Buttons */}
<div className="d-flex flex-wrap gap-1 mb-2">
  {/* New User */}
  <button
    className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center"
    onClick={handleNewUser}
  >
    <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
      add
    </span>
    New
  </button>

  {/* PDF */}
  <button
    className="btn btn-sm btn-danger py-1 px-2 d-flex align-items-center"
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
    style={{ backgroundColor: "#1D6F42", borderColor: "#1D6F42" }}
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
    onClick={handlePrint}
  >
    <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
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
    />
  </div>
</div>


      {/* ✅ Responsive Table */}
  

      <div className="table-responsive">
  <table
    id="user-table"
    className="table table-bordered table-striped align-middle"
    style={{ fontSize: "12px" }} // ✅ smaller font
  >
    <thead className="table-primary" style={{ fontSize: "12px" }}>
      <tr className="text-center">
        <th className="py-1 px-1">Name</th>
        <th className="py-1 px-1">Phone No</th>
        <th className="py-1 px-1">Password</th>
        <th className="py-1 px-1">Role</th>
        <th className="py-1 px-1" style={{ minWidth: "100px" }}>Action</th>
      </tr>
    </thead>

    <tbody>
      {filteredUsers.map((user) => (
        <tr className="text-center" key={user.id} style={{ fontSize: "13px" }}>
          <td className="py-1 px-1">{user.name}</td>
          <td className="py-1 px-1">{user.phone}</td>

          {/* Password with show on focus/blur */}
          <td className="py-1 px-1">
            <input
              type={visiblePasswords[user.id] ? "text" : "password"}
              className="form-control form-control-sm border-0 bg-transparent p-0"
              value={user.password}
              readOnly
              onFocus={() =>
                setVisiblePasswords((prev) => ({ ...prev, [user.id]: true }))
              }
              onBlur={() =>
                setVisiblePasswords((prev) => ({ ...prev, [user.id]: false }))
              }
              style={{ width: "90px", fontSize: "12px" }}
            />
          </td>

          <td className="py-1 px-1">{user.role}</td>
          <td className="py-1 px-1">
            <button
              className="btn btn-sm p-0 me-1"
              style={{ background: "transparent", border: "none" }}
              onClick={() => handleEditUser(user)}
            >
              <span className="material-icons-two-tone text-warning" style={{ fontSize: "16px" }}>edit</span>
            </button>
            <button
              className="btn btn-sm p-0"
              style={{ background: "transparent", border: "none" }}
              onClick={() => deleteRow(user.id)}
            >
              <span className="material-icons-two-tone text-danger" style={{ fontSize: "16px" }}>delete</span>
            </button>
          </td>
        </tr>
      ))}
      {filteredUsers.length === 0 && (
        <tr>
          <td colSpan="5" className="text-center text-muted py-1" style={{ fontSize: "12px" }}>
            No users found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {/* Modal */}
{showModal && (
  <div className="modal fade show d-block" tabIndex="-1">
    <div className="modal-dialog modal-sm"> {/* ✅ smaller modal */}
      <div className="modal-content">
        <div className="modal-header py-2 px-3"> {/* ✅ reduced padding */}
          <h5 className="modal-title" style={{ fontSize: "14px" }}>
            {editingUser ? "Edit User" : "Add User"}
          </h5>
          <button
            type="button"
            className="btn-close btn-sm"
            onClick={() => setShowModal(false)}
          ></button>
        </div>

        <div className="modal-body p-2" style={{ fontSize: "13px" }}>
          {/* Name */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "13px" }}>
              Name
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Phone */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "13px" }}>
              Phone No
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setFormData({ ...formData, phone: value });
                }
              }}
              inputMode="numeric"
              maxLength="10"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "13px" }}>
              Password
            </label>
            <input
              type={formData.showPassword ? "text" : "password"} 
              className="form-control form-control-sm"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              onFocus={() =>
                setFormData({ ...formData, showPassword: true })
              }
              onBlur={() =>
                setFormData({ ...formData, showPassword: false })
              }
            />
          </div>

          {/* Role */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "13px" }}>
              Role
            </label>
            <select
              className="form-select form-select-sm"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>

        <div className="modal-footer py-2 px-3">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={handleSaveUser}
          >
            {editingUser ? "Update" : "Add"}
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