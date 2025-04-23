
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Power } from "lucide-react";

interface SocketControlProps {
  isOn: boolean;
  onToggle: () => void;
  deviceName?: string;
}

const SocketControl = ({ isOn, onToggle, deviceName = "Smart Socket" }: SocketControlProps) => {
  return (
    <Card className={isOn ? "border-energy-low" : "border-muted"}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Socket Status
        </CardTitle>
        <Power className={`h-5 w-5 ${isOn ? "text-energy-low" : "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>{deviceName}</span>
          <Switch 
            checked={isOn} 
            onCheckedChange={onToggle}
            className={isOn ? "data-[state=checked]:bg-energy-low" : ""}
          />
        </div>
        <div className={`text-sm font-medium ${isOn ? "text-energy-low" : "text-muted-foreground"}`}>
          {isOn ? "ON" : "OFF"}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocketControl;
