
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";

interface SettingsProps {
  unitCost: number;
  powerThreshold: number;
  monthlyLimit: number;
  onUpdate: (settings: {
    unitCost: number;
    powerThreshold: number;
    monthlyLimit: number;
  }) => void;
  onReset: () => void;
}

const SettingsPanel = ({ 
  unitCost, 
  powerThreshold, 
  monthlyLimit, 
  onUpdate,
  onReset
}: SettingsProps) => {
  const [localUnitCost, setLocalUnitCost] = React.useState(unitCost);
  const [localPowerThreshold, setLocalPowerThreshold] = React.useState(powerThreshold);
  const [localMonthlyLimit, setLocalMonthlyLimit] = React.useState(monthlyLimit);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      unitCost: localUnitCost,
      powerThreshold: localPowerThreshold,
      monthlyLimit: localMonthlyLimit
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unitCost">Cost per Unit (₹/kWh)</Label>
            <Input 
              id="unitCost" 
              type="number" 
              step="0.01" 
              min="0"
              value={localUnitCost} 
              onChange={e => setLocalUnitCost(parseFloat(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="powerThreshold">Power Threshold Alert (kW)</Label>
            <Input 
              id="powerThreshold" 
              type="number" 
              step="0.1" 
              min="0"
              value={localPowerThreshold} 
              onChange={e => setLocalPowerThreshold(parseFloat(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">Monthly Energy Limit (kWh)</Label>
            <Input 
              id="monthlyLimit" 
              type="number" 
              step="1" 
              min="0"
              value={localMonthlyLimit} 
              onChange={e => setLocalMonthlyLimit(parseFloat(e.target.value))}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button type="submit">
              Update Settings
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>
              Reset Monthly
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
