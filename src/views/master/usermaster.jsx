import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import { apiService } from "../../services/api";
import Loading from "../../components/Loading";
import { exportTableToPDF, exportTableToExcel, printTable } from "../../utils/exportUtils";

// Debounce function outside the component
const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const UserMaster = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ✅ Removed unused: visiblePasswords
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    role_id: 3,
    password: "",
  });

  // ✅ Removed unused: inputRefs is largely unused in the logic flow now, 
  // but kept for the `handleKeyDown` focus logic in the modal inputs.
  const inputRefs = useRef([]);

  // ✅ Removed unused/simplified: roleMap is only needed for handleEditUser 
  // (if API returns 'role' name instead of 'role_id') and handleSaveUser validation.
  // roleDisplayMap is used for display.

  // Role mapping for display (Memoized as it's static)
  const roleDisplayMap = useMemo(() => ({ 1: "Admin", 2: "Manager", 3: "User" }), []);

  // Role map lookup (for mapping role names to IDs if necessary)
  const roleMap = useMemo(() => ({ Admin: 1, Manager: 2, User: 3 }), []);


  // --- API Calls (Wrapped in useCallback) ---

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      const userData = data?.data || data?.users || [];
      // Normalize role property for display/export use
      const normalizedUsers = userData.map(user => ({
          ...user,
          role: user.role || roleDisplayMap[user.role_id] || 'N/A'
      }));

      setUsers(normalizedUsers);
    } catch (error) {
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleDisplayMap]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ Memoized change handler for form data update
  const handleFormChange = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Ensure we check for existence before focusing
      const next = inputRefs.current[index + 1]; 
      if (next) next.focus();
    }
  }, []);

  const handleNewUser = useCallback(() => {
    setEditingUser(null);
    setFormData({ name: "", mobile: "", email: "", role_id: 3, password: "" });
    setShowModal(true);
  }, []);

  const handleEditUser = useCallback((user) => {
    setEditingUser(user);
    // Use role_id if available, otherwise try to map role name from user.role
    const initialRoleId = user.role_id || roleMap[user.role] || 0; 
    
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      role_id: initialRoleId,
      password: "", 
    });
    setShowModal(true);
  }, [roleMap]);

  const handleSaveUser = useCallback(async () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const mobile = formData.mobile.trim();
    const password = formData.password?.trim();
    const roleId = formData.role_id;

    // Basic validation
    if (!name) return toast.warning("Please enter a name.");
    if (!email) return toast.warning("Please enter an email.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return toast.warning("Please enter a valid email address.");
    if (!/^\d{10}$/.test(mobile))
      return toast.warning("Mobile number must be 10 digits.");
    if (!editingUser && (!password || password.length < 8))
      return toast.warning("Password must be at least 8 characters.");
    if (!roleId || roleId === 0)
      return toast.warning("Please select a role.");

    // Duplicate Checks
    const isDuplicate = users.some(u => {
      const isCurrent = editingUser && u.id === editingUser.id;
      if (isCurrent) return false;

      const nameMatch = (u.name?.trim().toLowerCase() === name.toLowerCase());
      const emailMatch = (u.email?.trim().toLowerCase() === email.toLowerCase());

      return nameMatch || emailMatch;
    });

    if (isDuplicate) {
      const duplicateByName = users.find(u => u.name?.trim().toLowerCase() === name.toLowerCase() && (!editingUser || u.id !== editingUser.id));
      if (duplicateByName) return toast.error("Name already exists!");
      const duplicateByEmail = users.find(u => u.email?.trim().toLowerCase() === email.toLowerCase() && (!editingUser || u.id !== editingUser.id));
      if (duplicateByEmail) return toast.error("Email already exists!");
      return;
    }

    // Payload construction
    const payload = {
      name,
      email,
      mobile,
      role_id: roleId,
      ...(editingUser && { id: editingUser.id }), 
      ...(password && { password }),
    };

    try {
      if (editingUser) {
        await apiService.updateUser(editingUser.id, payload);
        toast.success("User updated successfully");
      } else {
        await apiService.createUser(payload);
        toast.success("User added successfully");
      }

      // Reset form & refresh
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        mobile: "",
        role_id: 3,
      });

      fetchUsers();

    } catch (error) {
      const defaultMsg = editingUser ? "Failed to update user" : "Failed to add user";
      const errorMessage = error.response?.data?.message || defaultMsg;
      
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;
        if (errorData.mobile) {
            toast.error(errorData.mobile[0]);
        } else if (errorData.email) {
            toast.error(errorData.email[0]);
        } else {
            toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    }
  }, [formData, editingUser, users, fetchUsers]);

  const deleteRow = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiService.deleteUser(id);
      toast.success("User deleted successfully");
      setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
    } catch (error) {
      toast.error("Failed to delete user");
      fetchUsers();
    }
  }, [fetchUsers]);

  // --- Search & Filtering (Memoized for performance) ---

  const debouncedSetSearch = useMemo(() => debounce(setSearch, 300), []);
  const handleSearchChange = useCallback((e) => {
    debouncedSetSearch(e.target.value);
  }, [debouncedSetSearch]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const lowerCaseSearch = search.toLowerCase();

    return users.filter(
      (u) =>
        (u.name?.toLowerCase() || "").includes(lowerCaseSearch) ||
        (u.mobile || "").includes(lowerCaseSearch) ||
        (u.role?.toLowerCase() || "").includes(lowerCaseSearch)
    );
  }, [users, search]);

  // --- Export Functions (Wrapped in useCallback) ---

  const exportPDF = useCallback(() => {
    const headers = ["Name", "Phone", "Role", "Email"];
    const rows = users.map((u) => [u.name, u.mobile, u.role, u.email]);
    exportTableToPDF({
      title: "User Master",
      filename: "UserMaster.pdf",
      headers,
      rows,
    });
  }, [users]);

  const exportExcel = useCallback(() => {
    const headers = ["Name", "Phone", "Role", "Email"];
    const rows = users.map((u) => [u.name, u.mobile, u.role, u.email]);
    exportTableToExcel({
      filename: "UserMaster.xlsx",
      sheetName: "Users",
      headers,
      rows,
    });
  }, [users]);

  const handlePrint = useCallback(() => {
    const headers = ["Name", "Phone", "Role", "Email"];
    const rows = users.map((u) => [u.name, u.mobile, u.role, u.email]);
    printTable({
      title: "User Master",
      headers,
      rows,
    });
  }, [users]);


  // --- Render ---

  return (
    <div className="container">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-2 px-2">
        {/* Action Buttons */}
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

        {/* Search Box */}
        <div style={{ width: "250px" }}>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="🔍 Search user..."
            onChange={handleSearchChange}
            style={{ borderRadius: "8px" }}
          />
        </div>
      </div>

      {/* Responsive Table */}
      <div className="table-responsive">
        <table
          id="user-table"
          className="table table-bordered align-middle"
          style={{
            fontSize: "10px",
            borderColor: "#dee2e6",
            marginBottom: "0",
          }}
        >
          <thead
            style={{
              backgroundColor: "#009efb",
              color: "#fff",
              fontSize: "10px",
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
            {loading ? (
              <tr>
                <td colSpan="5">
                  <Loading message="Loading users..." />
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id} 
                  className="text-center"
                  style={{ fontSize: "10px", lineHeight: "1" }}
                >
                  <td className="py-0 px-1 align-middle">{user.name}</td>
                  <td className="py-0 px-1 align-middle">{user.mobile}</td>
                  <td className="py-0 px-1 align-middle">{user.email}</td>
                  
                  <td className="py-0 px-1 align-middle">
                    {user.role_id ? roleDisplayMap[user.role_id] : user.role || "-"} 
                  </td>

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
              ))
            ) : (
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
                    onChange={(e) => handleFormChange('name', e.target.value)}
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
                    onChange={(e) => handleFormChange('email', e.target.value)}
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
                        handleFormChange('mobile', value);
                    }}
                    maxLength={10}
                    ref={(el) => (inputRefs.current[2] = el)}
                    onKeyDown={(e) => handleKeyDown(e, 2)}
                  />
                </div>

                {/* Password - show only for new user */}
                {!editingUser && (
                  <div className="mb-1">
                    <label className="form-label mb-0" style={{ fontSize: "12px" }}>
                      Password
                    </label>
                    <input
                      // ✅ Simplified type toggle: relying on password being empty on edit
                      type={formData.showPassword ? "text" : "password"} 
                      className="form-control form-control-sm"
                      style={{ height: "26px" }}
                      value={formData.password || ""}
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      onFocus={() => handleFormChange('showPassword', true)}
                      onBlur={() => handleFormChange('showPassword', false)}
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
                    onChange={(e) => handleFormChange('role_id', Number(e.target.value))}
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
                  ref={(el) => (inputRefs.current[5] = el)}
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