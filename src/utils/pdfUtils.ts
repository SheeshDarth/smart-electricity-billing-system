
/**
 * Utility to generate a fake PDF URL for demonstration.
 *
 * In a real app, connect to an API or backend for real bills.
 */
export const generateBillPDF = (
  month: string,
  usage: number,
  cost: number
): string => {
  // This is a placeholder PDF. Replace with real implementation as needed.
  return `data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCgoKLSBTVU1NQVJZLSAKQmlsbCBmb3I6ICQ
    {month}ClVzYWdlOiAke3VzYWdlfSBraWgKUm91bmQ6ICQke2Nvc3R9IHJz
    CkkgYXMgYSBwbGFjZWhvbGRlciBmb3IgRE1PIHB1cnBvc2VzLi4u`;
};
