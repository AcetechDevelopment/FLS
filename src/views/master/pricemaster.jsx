import React, { useState, useEffect } from "react";
import { Card, Table, Form } from "react-bootstrap";

const PriceMaster = () => {
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: "ABC Suppliers" },
    { id: 2, name: "XYZ Traders" },
  ]);

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
          <Table bordered hover responsive className="table-sm mb-0 text-center">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: "10px", width: "60px" }}>Sl.No</th>
                <th style={{ fontSize: "10px" }}>Material</th>
                <th style={{ fontSize: "10px" }}>Supplier</th>
                <th style={{ fontSize: "10px", width: "100px" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {priceList.length > 0 ? (
                priceList.map((row, idx) => (
                  <tr key={row.id}>
                    <td style={{ fontSize: "11px" }}>{idx + 1}</td>
                    <td style={{ fontSize: "11px" }}>{row.material}</td>
                    <td style={{ fontSize: "11px" }}>{row.supplier}</td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={row.price}
                        onChange={(e) =>
                          handlePriceChange(row.id, e.target.value)
                        }
                        style={{
                          fontSize: "11px",
                          width: "70px",
                          margin: "auto",
                          textAlign: "center",
                          padding: "2px 4px",
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center text-muted py-2"
                    style={{ fontSize: "11px" }}
                  >
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
