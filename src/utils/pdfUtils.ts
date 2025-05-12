
/**
 * Utility to generate a PDF URL for energy bills.
 *
 * In a real app, connect to an API or backend for real PDF generation.
 */
export const generateBillPDF = (
  month: string,
  usage: number,
  cost: number,
  cumulativeData: Array<{
    timestamp: string;
    amount: number;
    cumulativeEnergy: number;
    bill: number;
  }> = []
): string => {
  // Format the cumulative data for PDF display
  const dataString = cumulativeData.map(item => (
    `Date: ${new Date(item.timestamp).toLocaleDateString()}, ` +
    `Daily Usage: ${item.amount.toFixed(2)} kWh, ` + 
    `Cumulative Usage: ${item.cumulativeEnergy.toFixed(2)} kWh, ` +
    `Cumulative Bill: ₹${item.bill.toFixed(2)}`
  )).join('\n');

  // Create a simplified PDF data structure
  const pdfContent = {
    title: `Energy Bill - ${month}`,
    usage: usage.toFixed(2),
    cost: cost.toFixed(2),
    items: cumulativeData.map(item => ({
      date: new Date(item.timestamp).toLocaleDateString(),
      dailyUsage: item.amount.toFixed(2),
      cumUsage: item.cumulativeEnergy.toFixed(2),
      cumBill: item.bill.toFixed(2)
    }))
  };

  // Convert to JSON string and encode
  const jsonStr = JSON.stringify(pdfContent);
  const encoded = btoa(jsonStr);

  // Return as data URL that will be downloadable
  return `data:application/pdf;base64,${encoded}`;
};

