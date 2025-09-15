import React, { useEffect, useState } from "react";
import { Table, Card, Button } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const CategoryWise = () => {
  const [reportData, setReportData] = useState({
    hospital: [],
    hotel: [],
    others: [],
    overall: []
  });

  useEffect(() => {
    const storedData = localStorage.getItem("supplierGroupData");
    if (storedData) {
      setReportData(JSON.parse(storedData));
    }
  }, []);

  const calculateTotals = (rows) => {
    return rows.reduce(
      (acc, row) => {
        acc.pieces += Number(row.pieces || 0);
        acc.weight += Number(row.weight || 0);
        return acc;
      },
      { pieces: 0, weight: 0 }
    );
  };

  const hospitalTotals = calculateTotals(reportData.hospital || []);
  const hotelTotals = calculateTotals(reportData.hotel || []);
  const othersTotals = calculateTotals(reportData.others || []);
  const overallTotals = calculateTotals(reportData.overall || []);

  // ================== PDF Export ==================
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Category Wise Processed Line Details", 14, 15);

    const addTable = (title, data) => {
      doc.setFontSize(12);
      doc.text(title, 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 25);

      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 25,
        head: [["Sl No", "Item", "Pieces", "Weight"]],
        body: data.map((row, idx) => [idx + 1, row.item, row.pieces, row.weight]),
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 123, 255] },
        foot: [["TOTAL", "", 
          data.reduce((a, r) => a + Number(r.pieces || 0), 0),
          data.reduce((a, r) => a + Number(r.weight || 0), 0)
        ]]
      });
    };

    addTable("Hospital", reportData.hospital || []);
    addTable("Others", reportData.others || []);
    addTable("Hotel", reportData.hotel || []);
    addTable("Overall Processed Line Details", reportData.overall || []);

    doc.save("CategoryWiseReport.pdf");
  };

  // ================== Excel Export ==================
  const exportExcel = () => {
    const sheets = [
      { name: "Hospital", data: reportData.hospital },
      { name: "Others", data: reportData.others },
      { name: "Hotel", data: reportData.hotel },
      { name: "Overall", data: reportData.overall }
    ];

    const workbook = XLSX.utils.book_new();

    sheets.forEach(sheet => {
      if (sheet.data && sheet.data.length > 0) {
        const data = sheet.data.map((row, idx) => ({
          "Sl No": idx + 1,
          "Item": row.item,
          "Pieces": row.pieces,
          "Weight": row.weight
        }));

        // Add totals row
        data.push({
          "Sl No": "",
          "Item": "TOTAL",
          "Pieces": sheet.data.reduce((a, r) => a + Number(r.pieces || 0), 0),
          "Weight": sheet.data.reduce((a, r) => a + Number(r.weight || 0), 0)
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
      }
    });

    XLSX.writeFile(workbook, "CategoryWiseReport.xlsx");
  };

  // ================== Print ==================
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=900,height=600");
    let content = `<html><head><title>Category Wise Report</title>
      <style>
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: center; }
        th { background-color: #0d6efd; color: white; }
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

    addPrintTable("Hospital", reportData.hospital || []);
    addPrintTable("Others", reportData.others || []);
    addPrintTable("Hotel", reportData.hotel || []);
    addPrintTable("Overall Processed Linen Details", reportData.overall || []);

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
            CATEGORY WISE PROCESSED LINE DETAILS
          </h5>
          <span style={{ fontSize: "12px" }}>
            DATE: {new Date().toLocaleDateString()}
          </span>
        </Card.Header>
        <Card.Body className="p-2">
<div className="mb-3 d-flex justify-content-start gap-2">
  {/* PDF */}
  <Button
    size="sm"
    variant="danger"
    className="d-flex align-items-center px-3 py-1"
    onClick={exportPDF}
  >
    <span className="material-icons-two-tone me-1" style={{ fontSize: "16px" }}>
      picture_as_pdf
    </span>
    PDF
  </Button>

  {/* Excel */}
  {/* <Button
    size="sm"
    className="d-flex align-items-center px-3 py-1 text-white"
    style={{ backgroundColor: "#1D6F42", borderColor: "#1D6F42" }}
    onClick={exportExcel}
  >
    <span className="material-icons-two-tone me-1" style={{ fontSize: "16px" }}>
      grid_on
    </span>
    Excel
  </Button> */}

  {/* Print */}
  <Button
    size="sm"
    variant="primary"
    className="d-flex align-items-center px-3 py-1"
    onClick={handlePrint}
  >
    <span className="material-icons-two-tone me-1" style={{ fontSize: "16px" }}>
      print
    </span>
    Print
  </Button>
</div>

          <div className="row">
            {/* Hospital Table */}
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
                  {reportData.hospital?.map((row, idx) => (
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

            {/* Others Table */}
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
                  {reportData.others?.map((row, idx) => (
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
            {/* Hotel Table */}
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
                  {reportData.hotel?.map((row, idx) => (
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

            {/* Overall Processed Linen Table */}
            <div className="col-md-6">
              <h6 className="text-center bg-info text-white py-1">
                Overall Processed Line Details
              </h6>
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
                  {reportData.overall?.map((row, idx) => (
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

export default CategoryWise;
