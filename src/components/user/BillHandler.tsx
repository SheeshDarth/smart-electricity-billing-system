
import React from "react";
import { toast } from "@/components/ui/use-toast";
import { generateBillPDF } from "@/utils/pdfUtils";
import BillingCard from "@/components/dashboard/BillingCard";
import CumulativeBillTable from "@/components/user/CumulativeBillTable";
import DownloadBillButton from "@/components/user/DownloadBillButton";

interface BillHandlerProps {
  latestDailyUsage: number;
  unitCost: number;
  currentBill: number;
  totalUsage: number;
  cumulative: Array<{
    id: string;
    timestamp: string;
    amount: number;
    cumulativeEnergy: number;
    bill: number;
  }>;
}

const BillHandler: React.FC<BillHandlerProps> = ({
  latestDailyUsage,
  unitCost,
  currentBill,
  totalUsage,
  cumulative,
}) => {
  const getCurrentBillingPeriod = () => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const handleBillDownload = () => {
    // Enhanced bill download logic with better error handling
    if (cumulative.length > 0) {
      try {
        const periodLabel = getCurrentBillingPeriod();
        const pdfUrl = generateBillPDF(periodLabel, totalUsage, currentBill, cumulative);
        const fileName = `Energy-Bill-${periodLabel.replace(/\s/g, "-")}.pdf`;
        
        // Create download link
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          link.remove();
          toast({
            title: "Bill downloaded",
            description: "Your energy bill has been downloaded successfully.",
          });
        }, 100);
      } catch (error) {
        console.error("PDF download error:", error);
        toast({
          title: "Download failed",
          description: "There was a problem generating your bill. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No data available",
        description: "There is no usage data available to generate a bill.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Billing Card */}
      <div className="mb-6">
        <BillingCard
          currentUsage={latestDailyUsage}
          unitCost={unitCost}
          billingPeriod={getCurrentBillingPeriod()}
          onDownloadBill={handleBillDownload}
          cumulativeCost={currentBill}
        />
      </div>

      {/* Cumulative Table Component */}
      <CumulativeBillTable
        cumulative={cumulative}
        currentBill={currentBill}
      />
      
      {/* Render DownloadBillButton just below the table */}
      {cumulative.length > 0 && (
        <div className="mb-4">
          <DownloadBillButton 
            totalUsage={totalUsage} 
            currentBill={currentBill}
            cumulativeData={cumulative}
          />
        </div>
      )}
    </>
  );
};

export default BillHandler;
