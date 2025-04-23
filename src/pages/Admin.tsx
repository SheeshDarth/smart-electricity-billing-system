
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Socket, EnergyUsage, Billing } from "@/types/database";

interface SocketWithDetails extends Socket {
  energy_usage?: EnergyUsage[];
  billing?: Billing[];
}

const Admin = () => {
  const [socketNumber, setSocketNumber] = useState("");
  const [socketInfo, setSocketInfo] = useState<SocketWithDetails | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // simple auth check (should be enhanced)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      // optionally check role here
    });
  }, [navigate]);

  const handleFetchSocket = async () => {
    if (!socketNumber) return;

    try {
      const { data, error } = await supabase
        .from('sockets')
        .select("*, energy_usage(*), billing(*)")
        .eq("number", socketNumber)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "Socket Not Found",
          description: "Check the socket number and try again.",
          variant: "destructive",
        });
        setSocketInfo(null);
        return;
      }
      
      setSocketInfo(data as SocketWithDetails);
    } catch (error) {
      console.error("Error fetching socket:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching socket data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter Socket Number"
              value={socketNumber}
              onChange={e => setSocketNumber(e.target.value)}
            />
            <Button onClick={handleFetchSocket}>Search</Button>
          </div>
          {socketInfo && (
            <div>
              <h3 className="text-lg font-bold">Socket #{socketInfo.number}</h3>
              <div>User: {socketInfo.user_id}</div>
              <div>Total usage: {(socketInfo.energy_usage?.reduce((sum: number, u: any) => sum + u.amount, 0) || 0).toFixed(2)} kWh</div>
              {/* List billing info */}
              <div className="mt-4">
                <strong>Billing this month:</strong>
                <ul className="list-disc ml-5 mt-2">
                  {socketInfo.billing?.map((bill: any) => (
                    <li key={bill.id}>
                      {bill.period}: ₹{bill.amount.toFixed(2)} (Paid: {bill.paid ? "Yes" : "No"})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
