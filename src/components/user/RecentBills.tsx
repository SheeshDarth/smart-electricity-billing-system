import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Billing } from "@/types/database";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecentBillsProps {
  billing: Billing[];
  onBillingUpdate: (updatedBilling: Billing[]) => void;
}

const RecentBills: React.FC<RecentBillsProps> = ({ billing, onBillingUpdate }) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleDemoPaymentStatus = async (billId: string) => {
    if (updatingId) return;
    setUpdatingId(billId);
    try {
      const { data, error } = await (supabase as any)
        .from("billing")
        .update({ paid: true })
        .eq("id", billId)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("The demo billing record was not updated.");

      onBillingUpdate(billing.map((bill) => bill.id === billId ? { ...bill, paid: true } : bill));
      toast({
        title: "Demo status updated",
        description: "Only the demo billing record changed. No payment was processed.",
      });
    } catch (error) {
      console.error("Demo billing status update failed:", error);
      toast({
        title: "Status update failed",
        description: error instanceof Error ? error.message : "The demo record could not be updated.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold">Recent Bills</h3>
      <p className="text-xs text-muted-foreground">Demo only. These records are estimates; no payment is processed.</p>
      {billing.length === 0 && <div>No billing records yet.</div>}
      {billing.map((bill) => (
        <div key={bill.id} className="border rounded-lg p-2 mt-2 flex justify-between items-center bg-muted">
          <div>
            <div>Period: {bill.period}</div>
            <div>Amount: INR {bill.amount.toFixed(2)}</div>
            <div>Status: {bill.paid ? <span className="text-green-600">Demo marked paid</span> : <span className="text-red-500">Demo unpaid</span>}</div>
          </div>
          {!bill.paid && (
            <Button onClick={() => handleDemoPaymentStatus(bill.id)} size="sm" disabled={updatingId !== null}>
              {updatingId === bill.id ? "Saving…" : "Mark demo paid"}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecentBills;
