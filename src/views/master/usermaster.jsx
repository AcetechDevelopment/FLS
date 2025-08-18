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
    <div className="container mt-4">
      <h3>User Master</h3>

      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
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
      </div>

      {/* ✅ Responsive Table */}
      <div className="table-responsive">
        <table id="user-table" className="table table-bordered table-striped align-middle">
          <thead className="table-primary">
            <tr>
              <th>Name</th>
              <th>Phone No</th>
              <th>Password</th>
              <th>Role</th>
              <th style={{ minWidth: "120px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
  {filteredUsers.map((user) => (
    <tr key={user.id}>
      <td>{user.name}</td>
      <td>{user.phone}</td>

      {/* 👇 Password with show on focus/blur */}
      <td>
        <input
          type={visiblePasswords[user.id] ? "text" : "password"}
          className="form-control form-control-sm border-0 bg-transparent"
          value={user.password}
          readOnly
          onFocus={() =>
            setVisiblePasswords((prev) => ({ ...prev, [user.id]: true }))
          }
          onBlur={() =>
            setVisiblePasswords((prev) => ({ ...prev, [user.id]: false }))
          }
          style={{ width: "100px" }}
        />
      </td>

      <td>{user.role}</td>
      <td>
        <button
          className="btn p-0 me-2"
          style={{ background: "transparent", border: "none", boxShadow: "none" }}
          onClick={() => handleEditUser(user)}
        >
          <span className="material-icons-two-tone text-warning">edit</span>
        </button>
        <button
          className="btn p-0"
          style={{ background: "transparent", border: "none", boxShadow: "none" }}
          onClick={() => deleteRow(user.id)}
        >
          <span className="material-icons-two-tone text-danger">delete</span>
        </button>
      </td>
    </tr>
  ))}
  {filteredUsers.length === 0 && (
    <tr>
      <td colSpan="5" className="text-center text-muted">
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
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? "Edit User" : "Add User"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
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
                  <label className="form-label">Phone No</label>
                  <input
                    type="text"
                    className="form-control"
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

                {/* <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div> */}



                <div className="mb-3">
  <label className="form-label">Password</label>
  <input
    type={formData.showPassword ? "text" : "password"}   // 👈 toggle type
    className="form-control"
    value={formData.password}
    onChange={(e) =>
      setFormData({ ...formData, password: e.target.value })
    }
    onFocus={() => setFormData({ ...formData, showPassword: true })}   // 👈 show on focus
    onBlur={() => setFormData({ ...formData, showPassword: false })}   // 👈 hide on blur
  />
</div>

                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
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
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveUser}>
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
