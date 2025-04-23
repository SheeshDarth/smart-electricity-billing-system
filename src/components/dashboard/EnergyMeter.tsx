
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Gauge, Zap } from "lucide-react";

interface EnergyMeterProps {
  title: string;
  value: number;
  unit: string;
  icon: "power" | "voltage" | "current" | "energy";
  max: number;
  thresholdPercent?: number;
}

const EnergyMeter = ({ title, value, unit, icon, max, thresholdPercent = 80 }: EnergyMeterProps) => {
  // Calculate percentage of max value
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  // Determine color based on percentage
  const getColorClass = () => {
    if (percentage >= thresholdPercent) return "text-energy-critical";
    if (percentage >= thresholdPercent * 0.8) return "text-energy-high";
    if (percentage >= thresholdPercent * 0.6) return "text-energy-medium";
    return "text-energy-low";
  };

  // Get progress color
  const getProgressColor = () => {
    if (percentage >= thresholdPercent) return "bg-energy-critical";
    if (percentage >= thresholdPercent * 0.8) return "bg-energy-high";
    if (percentage >= thresholdPercent * 0.6) return "bg-energy-medium";
    return "bg-energy-low";
  };

  // Custom progress styles
  const progressStyles = {
    indicator: {
      backgroundColor: percentage >= thresholdPercent ? 'hsl(0, 84.2%, 60.2%)' : 
                        percentage >= thresholdPercent * 0.8 ? '#f87171' :
                        percentage >= thresholdPercent * 0.6 ? '#facc15' : '#4ade80'
    }
  };

  // Icon selection
  const renderIcon = () => {
    switch (icon) {
      case "power":
      case "energy":
        return <Zap className={cn("h-5 w-5", getColorClass())} />;
      default:
        return <Gauge className={cn("h-5 w-5", getColorClass())} />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {renderIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
        </div>
        <Progress
          value={percentage}
          className="h-2 mt-2"
          indicatorClassName={getProgressColor()}
        />
      </CardContent>
    </Card>
  );
};

export default EnergyMeter;
