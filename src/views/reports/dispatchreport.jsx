import React, { useEffect, useState } from "react";
import { Table, Card, Button } from "react-bootstrap";
import { exportToPDF, exportToExcel, printReport, calculateTotals } from "../../utils/exportUtils";

const DispatchReport = () => {
  const [dispatchData, setDispatchData] = useState({
    hospital: [],
    hotel: [],
    others: [],
    overall: []
  });

  useEffect(() => {
    const storedData = localStorage.getItem("dispatchReportData");
    if (storedData) {
      setDispatchData(JSON.parse(storedData));
    }
  }, []);

  const hospitalTotals = calculateTotals(dispatchData.hospital || []);
  const hotelTotals = calculateTotals(dispatchData.hotel || []);
  const othersTotals = calculateTotals(dispatchData.others || []);
  const overallTotals = calculateTotals(dispatchData.overall || []);

  // ================== PDF Export ==================
  const exportPDF = () => {
    const sections = [
      { title: "Hospital", data: dispatchData.hospital || [] },
      { title: "Others", data: dispatchData.others || [] },
      { title: "Hotel", data: dispatchData.hotel || [] },
      { title: "Overall Dispatch Details", data: dispatchData.overall || [] },
    ];
    exportToPDF({
      title: "Dispatch Report",
      filename: "DispatchReport.pdf",
      sections,
      columns: ["Sl No", "Item", "Pieces", "Weight"],
    });
  };

  // ================== Excel Export ==================
  const exportExcel = () => {
    const sections = [
      { title: "Hospital", data: dispatchData.hospital || [] },
      { title: "Others", data: dispatchData.others || [] },
      { title: "Hotel", data: dispatchData.hotel || [] },
      { title: "Overall Dispatch Details", data: dispatchData.overall || [] },
    ];
    exportToExcel({
      filename: "DispatchReport.xlsx",
      sheetName: "Dispatch Report",
      sections,
      columns: ["Sl No", "Item", "Pieces", "Weight"],
    });
  };

  // ================== Print ==================
  const handlePrint = () => {
    const sections = [
      { title: "Hospital", data: dispatchData.hospital || [] },
      { title: "Others", data: dispatchData.others || [] },
      { title: "Hotel", data: dispatchData.hotel || [] },
      { title: "Overall Dispatch Details", data: dispatchData.overall || [] },
    ];
    printReport({
      title: "Dispatch Report",
      sections,
      columns: ["Sl No", "Item", "Pieces", "Weight"],
    });
  };

  return (
    <div className="container-fluid mt-3">
      <Card className="shadow-sm">
        <Card.Header className="py-2 px-3 d-flex justify-content-between align-items-center">
          <h5 style={{ fontSize: "14px" }}>
            DISPATCH REPORT
          </h5>
          <span style={{ fontSize: "12px" }}>
            DATE: {new Date().toLocaleDateString()}
          </span>
        </Card.Header>
        <Card.Body className="p-2">
          {/* Buttons */}

<div className="mb-3 row g-2 justify-content-center justify-content-md-start">
  <div className="col-12 col-sm-auto">
    <Button
      size="sm"
      variant="danger"
      className="w-100 d-flex align-items-center justify-content-center gap-1"
      onClick={exportPDF}
    >
      <span className="material-icons-two-tone" style={{ fontSize: "18px" }}>
        picture_as_pdf
      </span>
      <span>PDF</span>
    </Button>
  </div>

  <div className="col-12 col-sm-auto">
    <Button
      size="sm"
      className="w-100 d-flex align-items-center justify-content-center gap-1 text-white"
      style={{ backgroundColor: "#1D6F42", borderColor: "#1D6F42" }}
      onClick={exportExcel}
    >
      <span className="material-icons-two-tone" style={{ fontSize: "18px" }}>
        grid_on
      </span>
      <span>Excel</span>
    </Button>
  </div>

  <div className="col-12 col-sm-auto">
    <Button
      size="sm"
      className="w-100 d-flex align-items-center justify-content-center gap-1 text-white"
      style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1" }}
      onClick={handlePrint}
    >
      <span className="material-icons-two-tone" style={{ fontSize: "18px" }}>
        print
      </span>
      <span>Print</span>
    </Button>
  </div>
</div>

          <div className="row">
            {/* Hospital */}
            <div className="col-md-6">
              <h6 className="text-center bg-warning text-dark py-1">Hospital</h6>
              <Table bordered hover size="sm" className="text-center">
                <thead className="table-warning">
                  <tr>
                    <th>Sl No</th>
                    <th>Item</th>
                    <th>No of Pieces</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchData.hospital?.map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{row.item}</td>
                      <td>{row.pieces}</td>
                      <td>{row.weight}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td colSpan="2">TOTAL</td>
                    <td>{hospitalTotals.pieces}</td>
                    <td>{hospitalTotals.weight}</td>
                  </tr>
                </tbody>
              </Table>
            </div>

            {/* Others */}
            <div className="col-md-6">
              <h6 className="text-center bg-warning text-dark py-1">Others</h6>
              <Table bordered hover size="sm" className="text-center">
                <thead className="table-warning">
                  <tr>
                    <th>Sl No</th>
                    <th>Item</th>
                    <th>No of Pieces</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchData.others?.map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{row.item}</td>
                      <td>{row.pieces}</td>
                      <td>{row.weight}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td colSpan="2">TOTAL</td>
                    <td>{othersTotals.pieces}</td>
                    <td>{othersTotals.weight}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>

          <div className="row mt-3">
            {/* Hotel */}
            <div className="col-md-6">
              <h6 className="text-center bg-success text-white py-1">Hotel</h6>
              <Table bordered hover size="sm" className="text-center">
                <thead className="table-success">
                  <tr>
                    <th>Sl No</th>
                    <th>Item</th>
                    <th>No of Pieces</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchData.hotel?.map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{row.item}</td>
                      <td>{row.pieces}</td>
                      <td>{row.weight}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td colSpan="2">Grand Total</td>
                    <td>{hotelTotals.pieces}</td>
                    <td>{hotelTotals.weight}</td>
                  </tr>
                </tbody>
              </Table>
            </div>

            {/* Overall */}
            <div className="col-md-6">
              <h6 className="text-center bg-info text-white py-1">Overall Dispatch Details</h6>
              <Table bordered hover size="sm" className="text-center">
                <thead className="table-info">
                  <tr>
                    <th>Sl No</th>
                    <th>Item</th>
                    <th>Pieces</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchData.overall?.map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{row.item}</td>
                      <td>{row.pieces}</td>
                      <td>{row.weight}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td colSpan="2">Grand Total</td>
                    <td>{overallTotals.pieces}</td>
                    <td>{overallTotals.weight}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DispatchReport;
