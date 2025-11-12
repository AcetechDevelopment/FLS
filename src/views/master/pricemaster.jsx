import React, { useState, useEffect } from "react";
import { Card, Table, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { apiService } from "../../services/api";
import Loading from "../../components/Loading";

const PriceMaster = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Allow only numeric input for price
  const isNumberKey = (e) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
  };

  // Fetch customers + materials
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getPriceMasterCustomer();
      const customersData = res?.customers || res?.data || [];

      if (!Array.isArray(customersData) || customersData.length === 0) {
        setCustomers([]);
        toast.info("No customers found.");
        setLoading(false);
        return;
      }

      const formattedCustomers = customersData.map((cus) => ({
        id: String(cus.id),
        name: cus.customer_name,
        materials: cus.materials || [],
      }));

      setCustomers(formattedCustomers);
      setSelectedCustomer(formattedCustomers[0]?.id ?? "");
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load customers.");
      setLoading(false);
    }
  };

  // Load materials for selected customer
  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    const selected = customers.find((c) => c.id === customerId);
    setMaterials(selected?.materials || []);
  };

  // Initial load
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Auto-load materials for default customer
  useEffect(() => {
    if (selectedCustomer && customers.length > 0) {
      const selected = customers.find((c) => c.id === selectedCustomer);
      setMaterials(selected?.materials || []);
    }
  }, [selectedCustomer, customers]);

  // Handle price change
  const handlePriceChange = (id, value) => {
    setMaterials((prev) =>
      prev.map((mat) =>
        mat.id === id ? { ...mat, default_price: value } : mat
      )
    );
  };

  // ✅ Save updated prices
  const handleSave = async () => {
    if (!selectedCustomer) {
      toast.warn("Please select a customer first.");
      return;
    }

    const payload = {
      customer_id: selectedCustomer,
      materials: materials.map((m) => ({
        id: m.id,
        default_price: m.default_price || "0",
      })),
    };

    try {
      setSaving(true);
      const res = await apiService.updatePriceMaster(payload);

      if (res.data?.message) {
        toast.success(res.data.message);
      } else {
        toast.success("Prices updated successfully.");
      }

      setSaving(false);
    } catch (err) {
      toast.error("Failed to update prices.");
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid mt-3">
      <Card className="shadow-sm border-0">
        <Card.Header
          className="bg-primary text-white py-2"
          style={{ fontSize: "12px" }}
        >
          <h6 className="mb-0">Price Master</h6>
        </Card.Header>

        <Card.Body style={{ fontSize: "11px" }}>
          {/* Customer Dropdown */}
          <div className="mb-3" style={{ maxWidth: "300px" }}>
            <Form.Select
              size="sm"
              value={selectedCustomer}
              onChange={(e) => handleCustomerChange(e.target.value)}
              style={{ fontSize: "11px" }}
              disabled={customers.length === 0}
            >
              <option value="">-- Select Customer --</option>
              {customers.map((cus) => (
                <option key={cus.id} value={cus.id}>
                  {cus.name}
                </option>
              ))}
            </Form.Select>
          </div>

              

          {/* Materials Table */}
          {loading ? (
            <Loading message="Loading customers and materials..." />
          ) : (
            <>
              <Table
                bordered
                hover
                responsive
                className="table-sm mb-0 text-center"
              >
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "60px" }}>Sl.No</th>
                    <th>Material</th>
                    <th>Weight</th>
                    <th>Default Price</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length > 0 ? (
                    materials.map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td>{idx + 1}</td>
                        <td>{row.material_name}</td>
                        <td>{row.weight}</td>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={row.default_price ?? ""}
                            onKeyDown={isNumberKey}
                            onChange={(e) =>
                              handlePriceChange(row.id, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-2">
                        {selectedCustomer
                          ? "No materials found for this customer."
                          : "Please select a customer."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* ✅ Save Button */}
              {materials.length > 0 && (
                <div className="text-end mt-3">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loading message="Saving..." inline size="sm" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PriceMaster;
