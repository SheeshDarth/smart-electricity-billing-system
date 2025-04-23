
import React from "react";
import { generateBillPDF } from "@/utils/pdfUtils";

interface DownloadBillButtonProps {
  totalUsage: number;
  currentBill: number;
}

const DownloadBillButton: React.FC<DownloadBillButtonProps> = ({
  totalUsage,
  currentBill,
}) => {
  const handleDownloadPDF = () => {
    const periodLabel = (() => {
      const now = new Date();
      const month = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      return month;
    })();

    const pdfUrl = generateBillPDF(periodLabel, totalUsage, currentBill);
    const fileName = `Bill-${periodLabel.replace(/\s/g, "-")}.pdf`;
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
    >
      Download PDF Bill
    </button>
  );
};

export default DownloadBillButton;
