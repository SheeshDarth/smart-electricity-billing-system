/**
 * Builds a small standards-compliant PDF for the legacy demo billing route.
 * The values are estimates from the supplied demo data, not an official bill.
 */
type BillLine = {
  timestamp: string;
  amount: number;
  cumulativeEnergy: number;
  bill: number;
};

const toPdfAscii = (value: string) => value.normalize("NFKD").replace(/[^\x20-\x7E]/g, "?");
const escapePdfText = (value: string) => toPdfAscii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const wrapLine = (value: string, limit = 86) => {
  const words = toPdfAscii(value).split(/\s+/);
  const result: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && (line.length + word.length + 1) > limit) {
      result.push(line);
      line = word;
    } else {
      line += (line ? " " : "") + word;
    }
  }
  if (line) result.push(line);
  return result;
};

export const generateBillPDF = (
  month: string,
  usage: number,
  cost: number,
  cumulativeData: BillLine[] = [],
): string => {
  if (!Number.isFinite(usage) || usage < 0 || !Number.isFinite(cost) || cost < 0) {
    throw new Error("Bill totals must be finite, non-negative numbers.");
  }

  const rows = cumulativeData.map((item) => {
    if (!Number.isFinite(item.amount) || item.amount < 0 || !Number.isFinite(item.cumulativeEnergy) || item.cumulativeEnergy < 0 || !Number.isFinite(item.bill) || item.bill < 0) {
      throw new Error("Usage data contains an invalid value.");
    }
    const date = new Date(item.timestamp);
    if (Number.isNaN(date.getTime())) throw new Error("Usage data contains an invalid timestamp.");
    return date.toISOString().slice(0, 10) + " | daily " + item.amount.toFixed(2) + " kWh | cumulative " + item.cumulativeEnergy.toFixed(2) + " kWh | estimate INR " + item.bill.toFixed(2);
  });

  if (cumulativeData.length > 0) {
    const last = cumulativeData[cumulativeData.length - 1];
    if (Math.abs(last.cumulativeEnergy - usage) > 0.01 || Math.abs(last.bill - cost) > 0.02) {
      throw new Error("Bill summary does not match the final usage row.");
    }
  }

  const reportLines = [
    "WATTWISE ENERGY BILL ESTIMATE",
    "DEMO ONLY - NOT AN OFFICIAL UTILITY BILL OR PAYMENT REQUEST",
    "Billing period: " + toPdfAscii(month),
    "Generated (UTC): " + new Date().toISOString(),
    "Total usage: " + usage.toFixed(2) + " kWh",
    "Estimated amount: INR " + cost.toFixed(2),
    "",
    "Daily usage | cumulative usage | cumulative estimated amount",
    ...(rows.length > 0 ? rows : ["No interval usage rows were supplied."]),
  ].flatMap((line) => wrapLine(line));

  const linesPerPage = 50;
  const pageLines: string[][] = [];
  for (let index = 0; index < reportLines.length; index += linesPerPage) {
    pageLines.push(reportLines.slice(index, index + linesPerPage));
  }
  const pages = pageLines.length > 0 ? pageLines : [["WATTWISE ENERGY BILL ESTIMATE"]];
  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const kids = pages.map((_, index) => (4 + index * 2) + " 0 R").join(" ");
  objects.push("<< /Type /Pages /Kids [" + kids + "] /Count " + pages.length + " >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  pages.forEach((lines, index) => {
    const pageId = 4 + index * 2;
    const contentId = pageId + 1;
    objects.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents " + contentId + " 0 R >>");
    let stream = "BT\n/F1 9 Tf\n50 744 Td\n13 TL\n";
    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) stream += "T*\n";
      stream += "(" + escapePdfText(line) + ") Tj\n";
    });
    stream += "ET\n";
    objects.push("<< /Length " + stream.length + " >>\nstream\n" + stream + "endstream");
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += (index + 1) + " 0 obj\n" + object + "\nendobj\n";
  });
  const xrefOffset = pdf.length;
  pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += String(offset).padStart(10, "0") + " 00000 n \n";
  });
  pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF";
  return "data:application/pdf;base64," + btoa(pdf);
};
