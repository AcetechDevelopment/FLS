import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { DispatchPrintUtils } from "../../utils/printdispatch";
import { toast } from "react-toastify";
import { apiService } from "../../services/api";
import Loading from "../../components/Loading";

const DispatchPage = () => {
  const [formData, setFormData] = useState({
    inwardNo: "",
    inwardCode: "",
    customerName: "",
    address: "",
    customerId: "",
  });

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch inward details
  const fetchInwardDetails = async (inwardCode) => {
    if (!inwardCode) return toast.warn("⚠️ Please enter Inward Number!");

    try {
      setLoading(true);
      const response = await apiService.getInwardData(inwardCode);

      const inward = response.inward;
      if (inward && inward.customer) {
        const customerId =
          inward.customer.customer_id ||
          inward.customer.id ||
          inward.customer?.customer?.id ||
          "";
        const inwardId = inward.id ||"";

        setFormData({
          inwardNo: inwardId,
          inwardCode: inward.inward_id || "",
          customerName: inward.customer.customer_name || "",
          address: inward.customer.address || "",
          customerId: customerId,
        });

        setMaterials(inward.items || []);
      } else {
        toast.warn("⚠️ No inward details found for this number!");
        setFormData({
          inwardNo: "",
          inwardCode: "",
          customerName: "",
          address: "",
          customerId: "",
        });
        setMaterials([]);
      }
    } catch (err) {
      toast.error("❌ Failed to fetch inward details.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Save dispatch (FormData format)
  const handleSave = async (printAfterSave = false) => {
    if (!materials.length) {
      toast.warn("⚠️ No materials to save!");
      return;
    }

    if (!formData.customerId || !formData.inwardNo) {
      toast.error("❌ Missing customer or inward details!");
      return;
    }

    try {
      const filtered = materials.filter(
        (m) => m.material_id && (m.total_qty || m.count || m.qty || 0) > 0
      );

      if (!filtered.length) {
        toast.warn("⚠️ No valid materials found.");
        return;
      }

      // 🔸 Prepare FormData (like inward page)
      const formDataToSend = new FormData();
      formDataToSend.append("customer_id", formData.customerId);
      formDataToSend.append("inward_id", formData.inwardCode);

      filtered.forEach((m) => {
        formDataToSend.append("material_id[]", m.material_id);
        formDataToSend.append(
          "qty[]",
          m.total_qty || m.count || m.qty || m.quantity || 0
        );
      });

      const res = await apiService.createDispatch(formDataToSend);

      toast.success("✅ Dispatch saved successfully!");

      if (printAfterSave) DispatchPrintUtils.Print({ ...formData, materials });
    } catch (err) {
      toast.error("❌ Failed to save dispatch.");
    }
  };

  return (
    <div className="container mt-3" style={{ fontSize: "12px" }}>
      {/* 🔹 Input Row */}
      <div className="row align-items-center g-2 mb-2">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "24px", borderRadius: "8px" }}
            placeholder="Inward Number"
            value={formData.inwardCode}
            onChange={(e) =>
              setFormData({ ...formData, inwardCode: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchInwardDetails(formData.inwardCode);
            }}
          />
        </div>

        <div className="col-md-3">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ fontSize: "10px", height: "24px", borderRadius: "8px" }}
            placeholder="Customer Name"
            value={formData.customerName}
            readOnly
          />
        </div>

        <div className="col-md-4">
          <textarea
            className="form-control form-control-sm"
            style={{ fontSize: "11px", height: "26px", borderRadius: "8px" }}
            placeholder="Address"
            value={formData.address}
            readOnly
          />
        </div>
      </div>

      {/* 🔹 Materials Table */}
      <div className="card shadow-sm">
        <div className="card-body p-2">
          {loading ? (
            <Loading message="Loading inward details..." />
          ) : materials.length > 0 ? (
            <>
              <h6 className="fw-bold mb-2">Inward Details</h6>
              <table
                className="table table-bordered table-sm mb-2"
                style={{ fontSize: "11px" }}
              >
                <thead className="table-light text-center">
                  <tr>
                    <th style={{ width: "60px" }}>Sl.No</th>
                    <th>Material Name</th>
                    <th style={{ width: "120px" }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, i) => (
                    <tr key={i} className="text-center">
                      <td>{i + 1}</td>
                      <td>{m.material_name}</td>
                      <td>{m.total_qty || m.count || m.qty || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-center text-muted mb-0">
              No inward details available
            </p>
          )}
        </div>
      </div>

      {/* 🔹 Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          className="btn btn-primary btn-sm"
          style={{ padding: "3px 10px", fontSize: "12px", borderRadius: "8px" }}
          onClick={() => handleSave(false)}
        >
          Save
        </button>

        <button
          className="btn btn-success btn-sm"
          style={{ padding: "3px 10px", fontSize: "12px", borderRadius: "8px" }}
          onClick={() => handleSave(true)}
        >
          Save & Print
        </button>
      </div>
    </div>
  );
};

export default DispatchPage;