
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download } from "lucide-react";

interface BillingCardProps {
  currentUsage: number;
  unitCost: number;
  billingPeriod: string;
  onDownloadBill: () => void;
  cumulativeCost?: number;
}

const BillingCard = ({ 
  currentUsage, 
  unitCost, 
  billingPeriod, 
  onDownloadBill,
  cumulativeCost
}: BillingCardProps) => {
  // Calculate the daily cost (not cumulative)
  const dailyCost = currentUsage * unitCost;
  
  // Use cumulative cost if provided, otherwise fall back to daily cost
  const totalCost = cumulativeCost !== undefined ? cumulativeCost : dailyCost;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Billing Summary</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-xs text-muted-foreground">
          {billingPeriod}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span>Current Usage:</span>
            <span>{currentUsage.toFixed(2)} kWh</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Unit Cost:</span>
            <span>₹{unitCost.toFixed(2)}/kWh</span>
          </div>
          {cumulativeCost !== undefined && (
            <div className="flex justify-between items-center text-sm">
              <span>Cumulative Usage:</span>
              <span>{(cumulativeCost / unitCost).toFixed(2)} kWh</span>
            </div>
          )}
          <div className="flex justify-between items-center font-medium text-emerald-600">
            <span>{cumulativeCost !== undefined ? 'Total Cumulative Cost:' : 'Daily Cost:'}</span>
            <span>₹{totalCost.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onDownloadBill}>
          <Download className="mr-2 h-4 w-4" />
          Download demo estimate PDF
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BillingCard;
