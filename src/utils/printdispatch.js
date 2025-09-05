// src/utils/printDispatch.js
export const DispatchPrintUtils = {
  Print: (dispatchData) => {
    if (!dispatchData?.materials?.length) {
      return alert("No dispatch materials to print.");
    }

    // ✅ Calculate totals
    const totalQty = dispatchData.materials.reduce(
      (sum, m) => sum + (Number(m.qty) || 0),
      0
    );
    const totalAmount = dispatchData.materials.reduce(
      (sum, m) => sum + ((Number(m.qty) || 0) * (Number(m.price) || 0)),
      0
    );

    // ✅ Updated Dispatch Challan header
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
              <b>Reference</b>: ${dispatchData.referenceNo || "-"}
            </td>
            <td style="width:34%; vertical-align:top; text-align:center; font-weight:bold;">
              NOT FOR SALE
            </td>
            <td style="width:33%; vertical-align:top; text-align:right;">
              <b>Delivery Challan No</b>: ${dispatchData.dispatchNo || "-"}<br/>
              <b>Dispatch Date</b>: ${
                dispatchData.date
                  ? new Date(dispatchData.date).toLocaleDateString()
                  : "-"
              }<br/>
              <b>541/542 Reference</b>: ${dispatchData.ref541 || "-"}
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

    // ✅ Materials Table (with Price & Amount)
    const materialsTable = `
      <table border="1" cellspacing="0" cellpadding="4" 
             style="width:100%; margin-top:15px; text-align:center; border-collapse:collapse; font-family: Arial, sans-serif; font-size: 9px;">
        <thead style="background:#f0f0f0; color:black; font-size: 9px; font-weight:bold;">
          <tr>
            <th>Sl.No</th>
            <th>Material</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${dispatchData.materials
            .map(
              (m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${m.material || "-"}</td>
              <td>${m.qty ?? m.quantity ?? "-"}</td>
              <td>${m.price ?? "-"}</td>
              <td>${(Number(m.qty) || 0) * (Number(m.price) || 0)}</td>
            </tr>
          `
            )
            .join("")}
          <tr style="font-weight:bold; background:#f9f9f9;">
            <td colspan="2" style="text-align:right;">TOTAL</td>
            <td>${totalQty}</td>
            <td>-</td>
            <td>${totalAmount}</td>
          </tr>
        </tbody>
      </table>
    `;

    // ✅ Open print preview
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>Dispatch Challan</title></head>
        <body>${challanHeader}${materialsTable}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  },
};
