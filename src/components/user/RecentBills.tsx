
import React from "react";
import { Button } from "@/components/ui/button";
import { Billing } from "@/types/database";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecentBillsProps {
  billing: Billing[];
  onBillingUpdate: (updatedBilling: Billing[]) => void;
}

const RecentBills: React.FC<RecentBillsProps> = ({ billing, onBillingUpdate }) => {
  const handlePay = async (billId: string) => {
    try {
      // Simulate payment (update paid column)
      await (supabase as any)
        .from('billing')
        .update({ paid: true })
        .eq("id", billId);

      toast({ 
        title: "Payment Successful", 
        description: "Thank you for your payment." 
      });

      // Update local state
      const updatedBilling = billing.map(bill => 
        bill.id === billId ? {...bill, paid: true} : bill
      );
      onBillingUpdate(updatedBilling);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was a problem processing your payment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold">Recent Bills</h3>
      {billing.length === 0 && <div>No billing records yet.</div>}
      {billing.map(bill => (
        <div key={bill.id} className="border rounded-lg p-2 mt-2 flex justify-between items-center bg-muted">
          <div>
            <div>Period: {bill.period}</div>
            <div>Amount: ₹{bill.amount.toFixed(2)}</div>
            <div>
              Status: {bill.paid ? 
                <span className="text-green-600">Paid</span> : 
                <span className="text-red-500">Unpaid</span>}
            </div>
          </div>
          {!bill.paid && (
            <Button onClick={() => handlePay(bill.id)} size="sm">Pay</Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecentBills;
