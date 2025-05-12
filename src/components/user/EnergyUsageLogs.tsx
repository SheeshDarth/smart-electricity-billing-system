
import React from "react";
import { EnergyUsage } from "@/types/database";

interface EnergyUsageLogsProps {
  energyUsage: EnergyUsage[];
}

const EnergyUsageLogs: React.FC<EnergyUsageLogsProps> = ({ energyUsage }) => {
  return (
    <div>
      <h3 className="font-semibold mb-2">Energy Usage Logs</h3>
      <ul className="text-xs max-h-44 overflow-y-auto">
        {energyUsage.map(u => (
          <li key={u.id}>• {new Date(u.timestamp).toLocaleDateString()}: {u.amount.toFixed(2)} kWh</li>
        ))}
      </ul>
    </div>
  );
};

export default EnergyUsageLogs;
