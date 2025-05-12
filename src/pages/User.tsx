
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Socket, EnergyUsage, Billing } from "@/types/database";
import UserProfile from "@/components/user/UserProfile";
import RecentBills from "@/components/user/RecentBills";
import EnergyUsageLogs from "@/components/user/EnergyUsageLogs";
import BillHandler from "@/components/user/BillHandler";

const UNIT_COST = 7.5; // INR per kWh as in dashboard

const User = () => {
  const [userData, setUserData] = useState<any | null>(null);
  const [energyUsage, setEnergyUsage] = useState<EnergyUsage[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSockets, setUserSockets] = useState<Socket[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        return;
      }

      setUserData(session.user);

      try {
        // Get user's sockets
        const { data: socketsData } = await (supabase as any)
          .from('sockets')
          .select("id,number")
          .eq("user_id", session.user.id);

        const userSockets = socketsData as Socket[] || [];
        setUserSockets(userSockets);

        if (userSockets.length === 0) {
          setLoading(false);
          return;
        }

        // Get socket ID for the first socket (for demo)
        const socketId = userSockets[0]?.id;

        if (socketId) {
          // Get usage for current socket, order by timestamp to ensure cumulative calculation is correct
          const { data: usageData } = await (supabase as any)
            .from('energy_usage')
            .select("*")
            .eq("socket_id", socketId)
            .gte("timestamp", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
            .order("timestamp", { ascending: true });

          setEnergyUsage(usageData as EnergyUsage[] || []);

          // Get billing
          const { data: billsData } = await (supabase as any)
            .from('billing')
            .select("*")
            .eq("socket_id", socketId)
            .order("period", { ascending: false });

          setBilling(billsData as Billing[] || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load your data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });
  }, [navigate]);

  // Generate cumulative data with proper bill accumulation
  const { cumulative, totalUsage, currentBill } = React.useMemo(() => {
    let cumSum = 0;
    let billSum = 0;
    
    const cumulativeData = energyUsage.map((usage) => {
      cumSum += usage.amount;
      billSum = cumSum * UNIT_COST; // Calculate bill based on cumulative energy
      
      return {
        ...usage,
        cumulativeEnergy: cumSum,
        bill: billSum,
      };
    });
    
    return {
      cumulative: cumulativeData,
      totalUsage: cumSum,
      currentBill: billSum,
    };
  }, [energyUsage]);

  // Calculate daily usage for latest entry
  const latestDailyUsage = energyUsage.length > 0 ? energyUsage[energyUsage.length - 1].amount : 0;

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-energy-low/10 to-white">
      <Card className="w-full max-w-lg mt-10 animate-fade-in">
        <CardHeader>
          <CardTitle>User Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfile 
            email={userData?.email} 
            totalUsage={totalUsage} 
            unitCost={UNIT_COST} 
          />

          <BillHandler
            latestDailyUsage={latestDailyUsage}
            unitCost={UNIT_COST}
            currentBill={currentBill}
            totalUsage={totalUsage}
            cumulative={cumulative}
          />

          <RecentBills 
            billing={billing} 
            onBillingUpdate={setBilling} 
          />

          <EnergyUsageLogs energyUsage={energyUsage} />
        </CardContent>
      </Card>
    </div>
  );
};

export default User;
