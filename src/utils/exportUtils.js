import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

/**
 * Calculate totals for pieces and weight from rows
 */
export const calculateTotals = (rows) =>
  rows.reduce(
    (acc, row) => {
      acc.pieces += Number(row.pieces || 0);
      acc.weight += Number(row.weight || 0);
      return acc;
    },
    { pieces: 0, weight: 0 }
  );

/**
 * Export data to PDF
 * @param {Object} config - Configuration object
 * @param {string} config.title - PDF title
 * @param {string} config.filename - Output filename
 * @param {Array} config.sections - Array of sections with title and data
 * @param {Array} config.columns - Column headers
 */
export const exportToPDF = ({ title, filename, sections, columns = ["Sl No", "Item", "Pieces", "Weight"] }) => {
  if (!sections || sections.length === 0) {
    return toast.warning("No data available to export");
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  sections.forEach((section, index) => {
    const topY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 25;

    doc.setFontSize(12);
    doc.text(section.title, 14, topY);

    autoTable(doc, {
      startY: topY + 5,
      margin: { top: 5 },
      head: [columns],
      body: section.data.map((row, idx) => [
        idx + 1,
        row.item || row.name || "",
        row.pieces || 0,
        row.weight || 0,
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] },
      foot: [["TOTAL", "",
        section.data.reduce((a, r) => a + Number(r.pieces || 0), 0),
        section.data.reduce((a, r) => a + Number(r.weight || 0), 0)
      ]]
    });
  });

  doc.save(filename || `${title}.pdf`);
};

/**
 * Export data to Excel
 * @param {Object} config - Configuration object
 * @param {string} config.filename - Output filename
 * @param {string} config.sheetName - Sheet name
 * @param {Array} config.sections - Array of sections with title and data
 * @param {Array} config.columns - Column headers
 */
export const exportToExcel = ({ filename, sheetName, sections, columns = ["Sl No", "Item", "Pieces", "Weight"] }) => {
  if (!sections || sections.length === 0) {
    return toast.warning("No data available to export");
  }

  const workbook = XLSX.utils.book_new();
  let worksheetData = [];

  sections.forEach((section) => {
    worksheetData.push([section.title]);
    worksheetData.push(columns);

    section.data.forEach((row, idx) => {
      worksheetData.push([
        idx + 1,
        row.item || row.name || "",
        row.pieces || 0,
        row.weight || 0,
      ]);
    });

    worksheetData.push([
      "",
      "TOTAL",
      section.data.reduce((a, r) => a + Number(r.pieces || 0), 0),
      section.data.reduce((a, r) => a + Number(r.weight || 0), 0)
    ]);

    worksheetData.push([]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Report");
  XLSX.writeFile(workbook, filename || "Report.xlsx");
};

/**
 * Print data as HTML table
 * @param {Object} config - Configuration object
 * @param {string} config.title - Print title
 * @param {Array} config.sections - Array of sections with title and data
 * @param {Array} config.columns - Column headers
 */
export const printReport = ({ title, sections, columns = ["Sl No", "Item", "Pieces", "Weight"] }) => {
  if (!sections || sections.length === 0) {
    return toast.warning("No data available to print");
  }

  const printWindow = window.open("", "", "width=900,height=600");
  let content = `<html><head><title>${title}</title>
    <style>
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { border: 1px solid #ddd; padding: 6px; text-align: center; }
      th { background-color: #0d6efd; color: white; }
      h4 { text-align: center; }
    </style></head><body>`;

  sections.forEach((section) => {
    content += `<h4>${section.title}</h4><table><thead>
      <tr>${columns.map(col => `<th>${col}</th>`).join("")}</tr></thead><tbody>`;
    
    section.data.forEach((row, idx) => {
      content += `<tr>
        <td>${idx + 1}</td>
        <td>${row.item || row.name || ""}</td>
        <td>${row.pieces || 0}</td>
        <td>${row.weight || 0}</td>
      </tr>`;
    });

    const totalPieces = section.data.reduce((a, r) => a + Number(r.pieces || 0), 0);
    const totalWeight = section.data.reduce((a, r) => a + Number(r.weight || 0), 0);
    content += `<tr style="font-weight:bold"><td colspan="2">TOTAL</td><td>${totalPieces}</td><td>${totalWeight}</td></tr>`;
    content += `</tbody></table><br/>`;
  });

  content += `</body></html>`;
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};

/**
 * Export simple table data to PDF (for non-report pages)
 * @param {Object} config - Configuration object
 * @param {string} config.title - PDF title
 * @param {string} config.filename - Output filename
 * @param {Array} config.headers - Table headers
 * @param {Array} config.rows - Table rows
 */
export const exportTableToPDF = ({ title, filename, headers, rows }) => {
  if (!rows || rows.length === 0) {
    return toast.warning("No data available to export");
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  autoTable(doc, {
    startY: 25,
    head: [headers],
    body: rows,
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 123, 255] },
  });

  doc.save(filename || `${title}.pdf`);
};

/**
 * Export simple table data to Excel (for non-report pages)
 * @param {Object} config - Configuration object
 * @param {string} config.filename - Output filename
 * @param {string} config.sheetName - Sheet name
 * @param {Array} config.headers - Table headers
 * @param {Array} config.rows - Table rows
 */
export const exportTableToExcel = ({ filename, sheetName, headers, rows }) => {
  if (!rows || rows.length === 0) {
    return toast.warning("No data available to export");
  }

  const data = rows.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || "";
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Sheet1");
  XLSX.writeFile(workbook, filename || "Export.xlsx");
};

/**
 * Print simple table data (for non-report pages)
 * @param {Object} config - Configuration object
 * @param {string} config.title - Print title
 * @param {Array} config.headers - Table headers
 * @param {Array} config.rows - Table rows
 */
export const printTable = ({ title, headers, rows }) => {
  if (!rows || rows.length === 0) {
    return toast.warning("No data available to print");
  }

  const tableRows = rows
    .map((row) =>
      `<tr>${row.map((cell) => `<td>${cell || ""}</td>`).join("")}</tr>`
    )
    .join("");

  const tableHTML = `
    <table>
      <thead>
        <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  const printWindow = window.open("", "", "width=900,height=600");
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0d6efd; color: white; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        ${tableHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

