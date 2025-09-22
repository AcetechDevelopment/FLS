export const PrintUtils = {
  Print: (materials) => {
    if (!materials.length) return alert("No materials to print.");

    // ✅ Calculate totals
    const totalQty = materials.reduce(
      (sum, m) => sum + (Number(m.qty) || Number(m.quantity) || 0),
      0
    );

    // ✅ Challan header + company details (structured like DispatchPrintUtils)
    const challanHeader = `
      <div style="font-family: Arial, sans-serif; font-size: 11px;">
        <h3 style="text-align:center; margin:0; font-size: 14px; font-weight:bold;">
          DELIVERY CHALLAN
        </h3>

        <table border="1" cellspacing="0" cellpadding="4" 
               style="width:100%; margin-top:5px; border-collapse: collapse; font-size: 11px;">
          <tr>
            <!-- FROM Section -->
            <td rowspan="2" style="width:65%; vertical-align:top; text-align:left;">
              <b>FROM:</b><br/>
              FABRIQUE LAUNDROMAT SERVICES PVT. LTD.<br/>
              No 100, Muruganchery Village<br/>
              Aranvoyalkuppam<br/>
              Thiruvallur-602 025<br/>
              GST No : 33AACCF5181G2ZZ
            </td>

            <!-- RECEIVED DATE -->
            <td style="width:15%;"><b>RECEIVED DATE:-</b></td>
            <td style="width:20%; text-align:center;">17.09.2025</td>
          </tr>
          <tr>
            <!-- SENDING DATE -->
            <td><b>SENDING DATE:-</b></td>
            <td style="text-align:center;">18.09.2025</td>
          </tr>
          <tr>
            <!-- TO Section -->
            <td style="vertical-align:top; text-align:left;">
              <b>TO:</b><br/>
              APOLLO HOSPITALS<br/>
              <b>TONDAIRPET, CHENNAI</b>
            </td>

            <!-- Sl.No -->
            <td><b>Sl.No</b></td>
            <td style="text-align:center;">1074</td>
          </tr>
        </table>
      </div>
    `;

    // ✅ Materials Table (with TOTAL row)
    const materialsTable = `
      <table border="1" cellspacing="0" cellpadding="4" 
             style="width:100%; margin-top:10px; text-align:center; border-collapse:collapse; font-family: Arial, sans-serif; font-size: 11px;">
        <thead style="background:#f0f0f0; color:black; font-size: 11px; font-weight:bold;">
          <tr>
            <th>Sl.No</th>
            <th>Description</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          ${materials
            .map(
              (m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${m.material || "-"}</td>
              <td>${m.qty ?? m.quantity ?? "-"}</td>
            </tr>
          `
            )
            .join("")}
          <tr style="font-weight:bold; background:#f9f9f9;">
            <td colspan="2" style="text-align:right;">TOTAL</td>
            <td>${totalQty}</td>
          </tr>
        </tbody>
      </table>
    `;

    // ✅ Open print preview
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>Delivery Challan</title></head>
        <body style="margin:20px;">${challanHeader}${materialsTable}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  },
};
