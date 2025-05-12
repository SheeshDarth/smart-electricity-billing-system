
import React from "react";

interface UserProfileProps {
  email: string;
  totalUsage: number;
  unitCost: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ email, totalUsage, unitCost }) => {
  return (
    <div className="mb-4">
      <div>Email: {email}</div>
      <div>Total Usage this month: <strong>{totalUsage.toFixed(2)} kWh</strong></div>
      <div className="text-muted-foreground text-sm">
        Data updates every hour. <br />Unit Price: ₹{unitCost}/kWh
      </div>
    </div>
  );
};

export default UserProfile;
