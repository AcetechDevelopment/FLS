export const PrintUtils = {
  Print: (materials) => {
    if (!materials.length) return alert("No materials to print.");

    // ✅ Challan header + company details (as per screenshot)
    const challanHeader = `
      <div style="border:1px solid black; padding:10px; font-family: Arial, sans-serif; font-size: 11px;">
        <h3 style="text-align:center; margin:0; font-size: 14px; font-weight:bold;">
          DELIVERY CHALLAN
        </h3>

        <table border="1" cellspacing="0" cellpadding="4" 
               style="width:100%; margin-top:10px; border-collapse: collapse; font-size: 11px;">
          <tr>
            <td style="width:70%; vertical-align:top;">
              <b>FROM:</b><br/>
              FABRIQUE LAUNDROMAT SERVICES PVT. LTD.<br/>
              No 100, Muruganchery Village<br/>
              Aranvoyalkuppam<br/>
              Thiruvallur-602 025<br/>
              GST No : 33AACCF5181G2ZZ
            </td>
            <td style="width:30%; vertical-align:top;">
              <b>RECEIVED DATE:</b> 17.09.2025<br/><br/>
              <b>SENDING DATE:</b> 18.09.2025
            </td>
          </tr>
          <tr>
            <td colspan="2" style="vertical-align:top;">
              <b>TO:</b><br/>
              APOLLO HOSPITALS<br/>
              <b>TONDAIRPET, CHENNAI</b>
            </td>
          </tr>
        </table>

        <table border="1" cellspacing="0" cellpadding="4" 
               style="width:100%; margin-top:10px; border-collapse: collapse; font-size: 11px;">
          <tr>
            <td style="width:50px;"><b>Sl.No</b></td>
            <td><b>1074</b></td>
          </tr>
        </table>
      </div>
    `;

    // ✅ Materials Table
    const materialsTable = `
      <table border="1" cellspacing="0" cellpadding="4" 
             style="width:100%; margin-top:15px; text-align:center; border-collapse:collapse; font-family: Arial, sans-serif; font-size: 11px;">
        <thead style="background:#f0f0f0; color:black; font-size: 11px; font-weight:bold;">
          <tr>
            <th>Sl.No</th>
            <th>Material</th>
            <th>Qty</th>
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