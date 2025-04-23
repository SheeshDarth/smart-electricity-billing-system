import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Socket, EnergyUsage, Billing } from "@/types/database";
import CumulativeBillTable from "@/components/user/CumulativeBillTable";
import DownloadBillButton from "@/components/user/DownloadBillButton";

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
          // Get usage for current socket
          const { data: usageData } = await (supabase as any)
            .from('energy_usage')
            .select("*")
            .eq("socket_id", socketId)
            .gte("timestamp", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
            .order("timestamp", { ascending: true }); // ascending for cumulative

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

  const totalUsage = energyUsage.reduce((acc, u) => acc + u.amount, 0);
  const currentBill = totalUsage * UNIT_COST;

  // generate cumulative sums for each log
  const cumulative = [];
  let cumSum = 0;
  for (const usage of energyUsage) {
    cumSum += usage.amount;
    cumulative.push({
      ...usage,
      cumulativeEnergy: cumSum,
      bill: cumSum * UNIT_COST,
    });
  }

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
      setBilling(billing.map(bill => 
        bill.id === billId ? {...bill, paid: true} : bill
      ));
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was a problem processing your payment.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-energy-low/10 to-white">
      <Card className="w-full max-w-lg mt-10 animate-fade-in">
        <CardHeader>
          <CardTitle>User Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div>Email: {userData?.email}</div>
            <div>Total Usage this month: <strong>{totalUsage.toFixed(2)} kWh</strong></div>
            <div className="text-muted-foreground text-sm">Data updates every hour. <br />Unit Price: ₹{UNIT_COST}/kWh</div>
          </div>

          {/* ----- Cumulative Table Component ----- */}
          <CumulativeBillTable
            cumulative={cumulative}
            currentBill={currentBill}
            onDownloadPDF={() => {}}
          />
          {/* Render DownloadBillButton just below the table, with no duplicated button */}
          {cumulative.length > 0 && (
            <div className="mb-4">
              <DownloadBillButton totalUsage={totalUsage} currentBill={currentBill} />
            </div>
          )}
          {/* ----- End Cumulative Table Component ----- */}

          <div className="mb-4">
            <h3 className="font-semibold">Recent Bills</h3>
            {billing.length === 0 && <div>No billing records yet.</div>}
            {billing.map(bill => (
              <div key={bill.id} className="border rounded-lg p-2 mt-2 flex justify-between items-center bg-muted">
                <div>
                  <div>Period: {bill.period}</div>
                  <div>Amount: ₹{bill.amount.toFixed(2)}</div>
                  <div>Status: {bill.paid ? <span className="text-green-600">Paid</span> : <span className="text-red-500">Unpaid</span>}</div>
                </div>
                {!bill.paid && (
                  <Button onClick={() => handlePay(bill.id)} size="sm">Pay</Button>
                )}
              </div>
            ))}
          </div>
          {/* keep simple logs below for reference */}
          <div>
            <h3 className="font-semibold mb-2">Energy Usage Logs</h3>
            <ul className="text-xs max-h-44 overflow-y-auto">
              {energyUsage.map(u => (
                <li key={u.id}>• {u.timestamp.slice(0, 10)}: {u.amount.toFixed(2)} kWh</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default User;
