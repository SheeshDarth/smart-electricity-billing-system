
import React from "react";
import { DownloadIcon } from "lucide-react";
import { generateBillPDF } from "@/utils/pdfUtils";

interface DownloadBillButtonProps {
  totalUsage: number;
  currentBill: number;
  cumulativeData?: Array<{
    timestamp: string;
    amount: number;
    cumulativeEnergy: number;
    bill: number;
  }>;
}

const DownloadBillButton: React.FC<DownloadBillButtonProps> = ({
  totalUsage,
  currentBill,
  cumulativeData = [],
}) => {
  const handleDownloadPDF = () => {
    const periodLabel = (() => {
      const now = new Date();
      const month = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      return month;
    })();

    // Pass the cumulative data to the PDF generator
    const pdfUrl = generateBillPDF(periodLabel, totalUsage, currentBill, cumulativeData);
    const fileName = `Energy-Bill-${periodLabel.replace(/\s/g, "-")}.pdf`;
    
    // Create download link
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition w-fit"
      onClick={handleDownloadPDF}
      title={`Download your complete bill with all daily usage and cumulative totals (₹${currentBill.toFixed(2)})`}
    >
      <DownloadIcon className="h-4 w-4" />
      Download Cumulative Bill (₹{currentBill.toFixed(2)})
    </button>
  );
};

export default DownloadBillButton;
