function pdfAscii(value) {
  return String(value ?? "")
    .replace(/₹/g, "INR ")
    .replace(/[·•]/g, "-")
    .replace(/[–—]/g, "-")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");
}

function escapePdfText(value) {
  return pdfAscii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatMoney(currency, value) {
  return currency + " " + Number(value).toFixed(2);
}

function drawText(text, x, y, size = 10, bold = false, color = "0.12 0.19 0.22") {
  return color + " rg BT /" + (bold ? "F2" : "F1") + " " + size + " Tf "
    + x + " " + y + " Td (" + escapePdfText(text) + ") Tj ET\n";
}

function drawRule(y, color = "0.84 0.88 0.89") {
  return color + " RG 48 " + y + " m 547 " + y + " l S\n";
}

function clipped(value, limit = 76) {
  const text = pdfAscii(value);
  return text.length > limit ? text.slice(0, limit - 3) + "..." : text;
}

function tariffHour(hour) {
  return String(hour).padStart(2, "0") + ":00";
}

function tariffDescription(bill) {
  if (bill.tariffMode !== "time-of-use") {
    return "Energy charge at " + Number(bill.ratePerKwh).toFixed(4) + " " + pdfAscii(bill.currency) + "/kWh";
  }
  return "Energy charge by time-of-use tariff";
}

function tariffScheduleLine(component, currency) {
  const name = component.name || (tariffHour(component.startHour) + "-" + tariffHour(component.endHour));
  return name + " " + tariffHour(component.startHour) + "-" + tariffHour(component.endHour)
    + " @ " + pdfAscii(currency) + " " + Number(component.ratePerKwh).toFixed(4) + "/kWh";
}

export function createEnergyBillPdf(bill) {
  if (!bill || bill.documentType !== "wattwise-energy-estimate" || bill.estimatedOnly !== true) {
    throw new TypeError("A Wattwise estimated e-bill is required");
  }
  const currency = pdfAscii(bill.currency);
  const start = new Date(bill.periodStart).toISOString();
  const end = new Date(bill.periodEnd).toISOString();
  const generated = new Date(bill.generatedAt).toISOString();
  const tariffSchedule = bill.tariffMode === "time-of-use"
    ? (Array.isArray(bill.tariffComponents) ? bill.tariffComponents : []).map((component) => tariffScheduleLine(component, currency))
    : [];
  const scopeStartY = 176 - (tariffSchedule.length * 16);
  const content = [
    "0.04 0.15 0.19 rg 0 742 595 100 re f\n",
    drawText("WATTWISE", 48, 802, 22, true, "1 1 1"),
    drawText("ELECTRICITY E-BILL  |  ESTIMATE", 48, 778, 11, true, "0.65 0.95 0.87"),
    drawText("READING-BASED COST ESTIMATE - NOT AN OFFICIAL UTILITY INVOICE", 48, 756, 8, false, "1 1 1"),
    drawText("BILL REFERENCE", 48, 712, 8, true, "0.39 0.48 0.51"),
    drawText(clipped(bill.billReference, 42), 48, 694, 11, true),
    drawText("GENERATED (UTC)", 330, 712, 8, true, "0.39 0.48 0.51"),
    drawText(generated, 330, 694, 9),
    drawRule(675),
    drawText("SITE AND METER", 48, 651, 8, true, "0.39 0.48 0.51"),
    drawText(clipped(bill.siteName, 68), 48, 632, 12, true),
    drawText("Customer: " + clipped(bill.customerName || "Not provided", 55), 48, 612, 9),
    drawText("Meter: " + clipped(bill.meterId, 45), 330, 632, 10, true),
    drawText("Tariff timezone: " + clipped(bill.timezone, 38), 330, 612, 9),
    drawRule(592),
    drawText("BILLING COVERAGE", 48, 568, 8, true, "0.39 0.48 0.51"),
    drawText("From (UTC): " + start, 48, 548, 9),
    drawText("Through (UTC): " + end, 48, 530, 9),
    drawRule(510),
    drawText("USAGE SUMMARY", 48, 486, 8, true, "0.39 0.48 0.51"),
    drawText("Validated interval energy", 48, 462, 10),
    drawText(Number(bill.energyKwh).toFixed(3) + " kWh", 390, 462, 11, true),
    drawText("Accepted intervals", 48, 440, 10),
    drawText(String(bill.readingCount), 390, 440, 10, true),
    drawText("Duplicate intervals ignored", 48, 418, 10),
    drawText(String(bill.duplicatesIgnored), 390, 418, 10, true),
    drawRule(398),
    drawText("ESTIMATED CHARGES", 48, 374, 8, true, "0.39 0.48 0.51"),
    drawText(tariffDescription(bill), 48, 350, 10),
    drawText(formatMoney(currency, bill.energyCharge), 390, 350, 12, true),
    drawRule(334),
    drawText("Estimated energy total", 48, 310, 11, true),
    drawText(formatMoney(currency, bill.energyCharge), 390, 310, 14, true),
    ...(bill.supplierBillAmount === null ? [] : [
      drawText("Supplier-stated total (reviewer entered)", 48, 282, 9),
      drawText(formatMoney(currency, bill.supplierBillAmount), 390, 282, 10, true),
      drawText("Estimate minus supplier-stated total", 48, 262, 9),
      drawText(formatMoney(currency, bill.variance), 390, 262, 10, true),
    ]),
    drawRule(238),
    drawText("CALCULATION AND SCOPE", 48, 214, 8, true, "0.39 0.48 0.51"),
    drawText("Tariff: " + clipped(bill.tariffVersion, 42) + "  |  Calculation: " + clipped(bill.calculationVersion, 32), 48, 194, 8),
    ...tariffSchedule.map((line, index) => drawText("Tariff band: " + clipped(line, 92), 48, 176 - (index * 16), 8)),
    drawText("This estimate uses only the validated interval readings shown above.", 48, scopeStartY, 8),
    drawText("Taxes, fixed/demand charges, arrears, and export credits are excluded.", 48, scopeStartY - 16, 8),
    drawText("No payment is collected; this is not an official amount due.", 48, scopeStartY - 32, 8),
    drawRule(scopeStartY - 52),
    drawText("Generated locally by Wattwise from the selected CSV and tariff assumptions.", 48, scopeStartY - 72, 8, false, "0.39 0.48 0.51"),
    drawText("Classification: " + clipped(bill.classification, 54), 48, scopeStartY - 88, 8, false, "0.39 0.48 0.51"),
  ].join("");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    "<< /Length " + new TextEncoder().encode(content).byteLength + " >>\nstream\n" + content + "endstream",
  ];
  let output = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(new TextEncoder().encode(output).byteLength);
    output += (index + 1) + " 0 obj\n" + objects[index] + "\nendobj\n";
  }
  const xrefOffset = new TextEncoder().encode(output).byteLength;
  output += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) output += String(offset).padStart(10, "0") + " 00000 n \n";
  output += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF\n";
  return new TextEncoder().encode(output);
}
