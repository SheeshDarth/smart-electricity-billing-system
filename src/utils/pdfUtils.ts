
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
  // This is a placeholder PDF. In a production app, you would generate an actual PDF here.
  // The Base64 string simulates a PDF file with the bill details.
  
  // Format the cumulative data for PDF display
  const dataString = cumulativeData.map(item => (
    `Date: ${new Date(item.timestamp).toLocaleDateString()}, ` +
    `Daily Usage: ${item.amount.toFixed(2)} kWh, ` + 
    `Cumulative Usage: ${item.cumulativeEnergy.toFixed(2)} kWh, ` +
    `Cumulative Bill: ₹${item.bill.toFixed(2)}`
  )).join('\n');

  // Create a placeholder PDF data URL with clearer title showing it's a cumulative bill
  return `data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb
    2cgL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJd
    IC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL1Jlc2
    91cmNlcyA8PCAvRm9udCA8PCAvRjEgNCAwIFIgPj4gPj4gL0NvbnRlbnRzIDUgMCBSID4+CmVuZG9iago0
    IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL1RpbWVzLVJvbWFuID
    4+CmVuZG9iago1IDAgb2JqCjw8IC9MZW5ndGggMTQ0ID4+CnN0cmVhbQpCVAovRjEgMTggVGYKNzAgMjUw
    IFRECihFbmVyZ3kgQmlsbCBmb3I6ICR7bW9udGh9KSBUagoxMDAgMjIwIFRECihUb3RhbCBVc2FnZTogJHt1
    c2FnZS50b0ZpeGVkKDIpfSBrV2gpIFRqCjEwMCAxOTAgVEQKKFRvdGFsIEJpbGw6IOKCuSR7Y29zdC50b0Z
    peGVkKDIpfSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCj
    AwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAw
    MDAwMDAyMTQgMDAwMDAgbiAKMDAwMDAwMDI4MiAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3
    QgMSAwIFIgPj4Kc3RhcnR4cmVmCjQyNwolJUVPRgo=`;
};
