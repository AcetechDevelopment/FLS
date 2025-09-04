export const PrintUtils = {
  Print: (materials) => {
    if (!materials.length) return alert("No materials to print.");

    // ✅ Challan header + company details
    const challanHeader = `
      <div style="border:1px solid black; padding:10px; font-family: Arial, sans-serif; font-size: 10px;">
        <h4 style="text-align:center; margin:0; font-size: 11px;">THE ACEDIGITAL TECHNOLOGIES PRIVATE LIMITED</h4>
        <p style="text-align:center; margin:0; font-size: 9px;">
          Office: No 15, Lalith Towers, Kambar Street, GST Road, Alandur, Chennai-600016<br/>
          Warehouse: No:100, Murugencherry Village, Aranvoyalk Post, Thiruvallur-602025<br/>
          Phone: 9842856792
        </p>

        <table style="width:100%; margin-top:10px; border-collapse: collapse; font-size: 9px;">
          <tr>
            <td style="width:33%; vertical-align:top;">
              <b>PAN</b>: AAHCT2375H<br/>
              <b>GSTIN</b>: 33AAHCT2375H1ZB<br/>
              <b>Reference</b>:
            </td>
            <td style="width:34%; vertical-align:top; text-align:center; font-weight:bold;">
              NOT FOR SALE
            </td>
            <td style="width:33%; vertical-align:top; text-align:right;">
              <b>Delivery Challan No</b>: DC20251756961678<br/>
              <b>Dispatch Date</b>: 04-Sep-2025<br/>
              <b>541/542 Reference</b>: 541-2025-1004623
            </td>
          </tr>
        </table>

        <table border="1" cellspacing="0" cellpadding="4" style="width:100%; margin-top:10px; border-collapse: collapse; font-size: 9px;">
          <tr>
            <td style="width:33%; vertical-align:top;">
              <b>Bill From</b><br/>
              ACEDIGITAL<br/>
              THEACE DIGITAL TECHNOLOGIES PRIVATE LIMITED,<br/>
              NO 100 THIRUVALLUR HIGH ROAD,<br/>
              THIRUVALLUR TALUK, CHENNAI, 602025<br/>
              Tamil Nadu, India.<br/>
              <b>GSTIN</b>: 33AAHCT2375H1ZB<br/>
              <b>Vendor Code</b>: C8141N0
            </td>
            <td style="width:34%; vertical-align:top;">
              <b>Bill To</b><br/>
              WIPRO ENTERPRISES (P) LIMITED<br/>
              NO.9B/10A, PHASE 1, PEENYA INDUSTRIAL AREA,<br/>
              BANGALORE<br/>
              <b>GSTIN</b>: 29AAJCA0072C1Z1<br/>
              <b>Vendor Code</b>: B5700X0
            </td>
            <td style="width:33%; vertical-align:top;">
              <b>Ship To</b><br/>
              WIPRO ENTERPRISES (P) LIMITED<br/>
              NO.9B/10A, PHASE 1, PEENYA INDUSTRIAL AREA,<br/>
              BANGALORE<br/>
              <b>Mode Of Transport</b>: Road
            </td>
          </tr>
        </table>
      </div>
    `;

    // ✅ Materials Table
    const materialsTable = `
      <table border="1" cellspacing="0" cellpadding="4" 
             style="width:100%; margin-top:15px; text-align:center; border-collapse:collapse; font-family: Arial, sans-serif; font-size: 9px;">
        <thead style="background:#f0f0f0; color:black; font-size: 9px; font-weight:bold;">
          <tr>
            <th style="font-weight:bold;">Sl.No</th>
            <th style="font-weight:bold;">Material</th>
            <th style="font-weight:bold;">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${materials.map((m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${m.material || "-"}</td>
              <td>${m.qty ?? m.quantity ?? "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    // ✅ Combine & open print preview
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>Delivery Challan</title></head>
        <body>${challanHeader}${materialsTable}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  },
};