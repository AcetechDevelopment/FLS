import React, { useEffect, useState } from "react";
import { Table, Card, Button } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

  const calculateTotals = (rows) =>
    rows.reduce(
      (acc, row) => {
        acc.pieces += Number(row.pieces || 0);
        acc.weight += Number(row.weight || 0);
        return acc;
      },
      { pieces: 0, weight: 0 }
    );

  const hospitalTotals = calculateTotals(dispatchData.hospital || []);
  const hotelTotals = calculateTotals(dispatchData.hotel || []);
  const othersTotals = calculateTotals(dispatchData.others || []);
  const overallTotals = calculateTotals(dispatchData.overall || []);

  // ================== PDF Export ==================
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Dispatch Report", 14, 15);

    const addTable = (title, data) => {
      const topY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 25;

      doc.setFontSize(12);
      doc.text(title, 14, topY);

      autoTable(doc, {
        startY: topY + 5,
        head: [["Sl No", "Item", "Pieces", "Weight"]],
        body: data.map((row, idx) => [idx + 1, row.item, row.pieces, row.weight]),
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [40, 167, 69] },
        foot: [["TOTAL", "",
          data.reduce((a, r) => a + Number(r.pieces || 0), 0),
          data.reduce((a, r) => a + Number(r.weight || 0), 0)
        ]]
      });
    };

    addTable("Hospital", dispatchData.hospital || []);
    addTable("Others", dispatchData.others || []);
    addTable("Hotel", dispatchData.hotel || []);
    addTable("Overall Dispatch Details", dispatchData.overall || []);

    doc.save("DispatchReport.pdf");
  };

  // ================== Excel Export ==================
  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    let worksheetData = [];

    const addTable = (title, data) => {
      worksheetData.push([title]);
      worksheetData.push(["Sl No", "Item", "Pieces", "Weight"]);

      data.forEach((row, idx) => {
        worksheetData.push([idx + 1, row.item, row.pieces, row.weight]);
      });

      worksheetData.push([
        "",
        "TOTAL",
        data.reduce((a, r) => a + Number(r.pieces || 0), 0),
        data.reduce((a, r) => a + Number(r.weight || 0), 0)
      ]);

      worksheetData.push([]);
    };

    addTable("Hospital", dispatchData.hospital || []);
    addTable("Others", dispatchData.others || []);
    addTable("Hotel", dispatchData.hotel || []);
    addTable("Overall Dispatch Details", dispatchData.overall || []);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dispatch Report");

    XLSX.writeFile(workbook, "DispatchReport.xlsx");
  };

  // ================== Print ==================
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=900,height=600");
    let content = `<html><head><title>Dispatch Report</title>
      <style>
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: center; }
        th { background-color: #28a745; color: white; }
        h4 { text-align: center; }
      </style></head><body>`;
    
    const addPrintTable = (title, data) => {
      content += `<h4>${title}</h4><table><thead>
        <tr><th>Sl No</th><th>Item</th><th>Pieces</th><th>Weight</th></tr></thead><tbody>`;
      data.forEach((row, idx) => {
        content += `<tr>
          <td>${idx + 1}</td>
          <td>${row.item}</td>
          <td>${row.pieces}</td>
          <td>${row.weight}</td>
        </tr>`;
      });
      const totalPieces = data.reduce((a, r) => a + Number(r.pieces || 0), 0);
      const totalWeight = data.reduce((a, r) => a + Number(r.weight || 0), 0);
      content += `<tr style="font-weight:bold"><td colspan="2">TOTAL</td><td>${totalPieces}</td><td>${totalWeight}</td></tr>`;
      content += `</tbody></table><br/>`;
    };

    addPrintTable("Hospital", dispatchData.hospital || []);
    addPrintTable("Others", dispatchData.others || []);
    addPrintTable("Hotel", dispatchData.hotel || []);
    addPrintTable("Overall Dispatch Details", dispatchData.overall || []);

    content += `</body></html>`;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
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

<div className="mb-3 d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
  {/* PDF */}
  <Button
    size="sm"
    variant="danger"
    className="d-flex align-items-center px-3 py-1"
    onClick={exportPDF}
  >
    <span
      className="material-icons-two-tone me-1 d-flex align-items-center"
      style={{ fontSize: "16px", lineHeight: "1" }}
    >
      picture_as_pdf
    </span>
    PDF
  </Button>

  {/* Excel */}
  <Button
    size="sm"
    className="d-flex align-items-center px-3 py-1 text-white"
    style={{ backgroundColor: "#1D6F42", borderColor: "#1D6F42" }}
    onClick={exportExcel}
  >
    <span
      className="material-icons-two-tone me-1 d-flex align-items-center"
      style={{ fontSize: "16px", lineHeight: "1" }}
    >
      grid_on
    </span>
    Excel
  </Button>

  {/* Print */}
  <Button
    size="sm"
    style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1" }}
    className="d-flex align-items-center px-3 py-1 text-white"
    onClick={handlePrint}
  >
    <span
      className="material-icons-two-tone me-1 d-flex align-items-center"
      style={{ fontSize: "16px", lineHeight: "1" }}
    >
      print
    </span>
    Print
  </Button>
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
