import React, { useState, useEffect } from "react";
import { Card, Table, Form } from "react-bootstrap";

const PriceMaster = () => {
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: "ABC Customers" },
    { id: 2, name: "XYZ Traders" },
  ]);

  const isNumberKey = (e) => {
  const char = e.key;
  const allowedChars = "0123456789";
  const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

  // Allow control keys
  if (controlKeys.includes(char)) return;

  // Block invalid characters
  if (!allowedChars.includes(char)) {
    e.preventDefault();
  }
};

  const [selectedSupplier, setSelectedSupplier] = useState(1); // default supplier
  const [priceList, setPriceList] = useState([
    { id: 1, material: "Cable", supplier: "ABC Suppliers", price: 120 },
    { id: 2, material: "Switch", supplier: "ABC Suppliers", price: 50 },
  ]);

  // Mimic fetching from API when supplier changes
  useEffect(() => {
    if (selectedSupplier === "1" || selectedSupplier === 1) {
      setPriceList([
        { id: 1, material: "Cable", supplier: "ABC Suppliers", price: 120 },
        { id: 2, material: "Switch", supplier: "ABC Suppliers", price: 50 },
      ]);
    } else if (selectedSupplier === "2" || selectedSupplier === 2) {
      setPriceList([
        { id: 3, material: "Bulb", supplier: "XYZ Traders", price: 30 },
        { id: 4, material: "Fan", supplier: "XYZ Traders", price: 200 },
      ]);
    }
  }, [selectedSupplier]);

  const handlePriceChange = (id, value) => {
    setPriceList(
      priceList.map((row) =>
        row.id === id ? { ...row, price: value } : row
      )
    );
  };

  return (
    <div className="container-fluid mt-3">
      <Card className="shadow-sm border-0">
        <Card.Header
          className="bg-primary text-white py-2"
          style={{ fontSize: "12px" }}
        >
          <h6 className="mb-0" style={{ fontSize: "12px" }}>
            Price Master
          </h6>
        </Card.Header>

        <Card.Body style={{ fontSize: "11px" }}>
          {/* Supplier Dropdown */}
          <div className="mb-3" style={{ maxWidth: "300px" }}>
            <Form.Select
              size="sm"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              style={{ fontSize: "11px" }}
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Table */}
       <Table bordered hover responsive className="table-sm mb-0 text-center price-table">
  <thead className="table-light">
    <tr>
      <th className="table-header" style={{ width: "60px" }}>Sl.No</th>
      <th className="table-header">Material</th>
      <th className="table-header">  Customer     </th>
      <th className="table-header" style={{ width: "100px" }}>Price</th>
    </tr>
  </thead>
  <tbody>
    {priceList.length > 0 ? (
      priceList.map((row, idx) => (
        <tr key={row.id} className="compact-row">
          <td>{idx + 1}</td>
          <td>{row.material}</td>
          <td>{row.supplier}</td>
          <td>
            <Form.Control
              type="text"
              size="sm"
              value={row.price}
              onKeyDown={isNumberKey}
              onChange={(e) => handlePriceChange(row.id, e.target.value)}
              className="price-input"
            />
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="4" className="text-center text-muted py-2 no-data">
          {selectedSupplier
            ? "No price data found for this supplier."
            : "Please select a supplier."}
        </td>
      </tr>
    )}
  </tbody>
</Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PriceMaster;
