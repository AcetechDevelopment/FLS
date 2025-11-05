import React, { useState, useEffect } from "react";
import { Card, Table, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = "https://115.124.111.111/FLS/public/api";

const PriceMaster = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [priceList, setPriceList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Allow only numeric input for price
  const isNumberKey = (e) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
  };

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Unauthorized. Please login again.");
        return;
      }

      const res = await axios.get(`${BASE_URL}/options/getcustomers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || [];
      if (!Array.isArray(data) || data.length === 0) {
        setCustomers([]);
        toast.info("No customers found.");
        return;
      }

      const formatted = data.map((cus) => ({
        id: String(cus.id ?? cus.customer_id ?? cus.customerId),
        name: cus.name ?? cus.customer_name ?? cus.customerName ?? "Unnamed Customer",
      }));

      setCustomers(formatted);
      setSelectedCustomer(formatted[0]?.id ?? ""); // select first customer by default
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.error("Failed to load customers.");
    }
  };

  // Fetch prices for selected customer
  const fetchPriceList = async (customerId) => {
    if (!customerId) {
      setPriceList([]);
      return;
    }
    try {
      setLoading(true);
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Unauthorized. Please login again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BASE_URL}/price-master/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { customer_id: customerId }, // send customer_id as param
      });

      const data = res.data?.data || [];
      setPriceList(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching price master:", err);
      toast.error("Failed to load price data.");
      setLoading(false);
    }
  };

  // Handle customer change
  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    fetchPriceList(customerId);
  };

  // Initial load
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch prices for default customer
  useEffect(() => {
    if (selectedCustomer) {
      fetchPriceList(selectedCustomer);
    }
  }, [selectedCustomer]);

  const handlePriceChange = (id, value) => {
    setPriceList((prev) =>
      prev.map((row) => (row.id === id ? { ...row, price: value } : row))
    );
  };

  return (
    <div className="container-fluid mt-3">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white py-2" style={{ fontSize: "12px" }}>
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

          {/* Price Table */}
          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" /> Loading...
            </div>
          ) : (
            <Table bordered hover responsive className="table-sm mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "60px" }}>Sl.No</th>
                  <th>Material</th>
                  <th>Customer</th>
                  <th style={{ width: "100px" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {priceList.length > 0 ? (
                  priceList.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td>{idx + 1}</td>
                      <td>{row.material_name ?? row.materialName}</td>
                      <td>{row.customer_name ?? row.customerName ?? customers.find(c => c.id === selectedCustomer)?.name}</td>
                      <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={row.price ?? ""}
                          onKeyDown={isNumberKey}
                          onChange={(e) => handlePriceChange(row.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-2">
                      {selectedCustomer
                        ? "No price data found for this customer."
                        : "Please select a customer."}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PriceMaster;
