import React, { useState, useEffect } from "react";
import { Card, Table, Form } from "react-bootstrap";
import axios from "axios";

const PriceMaster = () => {
  const [suppliers, setSuppliers] = useState([]); // supplier list from API
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [priceList, setPriceList] = useState([]);

  // Fetch suppliers for dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get("/api/suppliers"); // 👈 your supplier API
        setSuppliers(res.data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };

    fetchSuppliers();
  }, []);

  // Fetch prices when supplier changes
  useEffect(() => {
    if (selectedSupplier) {
      const fetchPrices = async () => {
        try {
          const res = await axios.get(`/api/prices/${selectedSupplier}`); 
          // 👆 e.g. /api/prices/2 (supplierId)
          setPriceList(res.data);
        } catch (err) {
          console.error("Error fetching prices:", err);
        }
      };

      fetchPrices();
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
          {/* Supplier Dropdown Above Table */}
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