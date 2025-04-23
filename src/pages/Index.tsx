
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Zap, AlertCircle, Clock } from "lucide-react";

// Dashboard components
import EnergyMeter from "@/components/dashboard/EnergyMeter";
import SocketControl from "@/components/dashboard/SocketControl";
import EnergyChart from "@/components/dashboard/EnergyChart";
import BillingCard from "@/components/dashboard/BillingCard";
import SettingsPanel from "@/components/dashboard/SettingsPanel";
import AlertBanner from "@/components/dashboard/AlertBanner";
import PaymentModal from "@/components/dashboard/PaymentModal";

// Utilities for mock data
import { 
  generateMockHistoryData, 
  generateRealTimeData, 
  findPeakUsage,
  generateBillPDF,
  getBillingPeriod,
  type PowerHistory,
  type EnergyData
} from "@/utils/mockData";

const Index = () => {
  // System state
  const [socketOn, setSocketOn] = useState(true);
  const [realTimeData, setRealTimeData] = useState<EnergyData>({
    voltage: 220,
    current: 1.2,
    power: 264,
    energy: 10.5,
    timestamp: Date.now()
  });
  const [historicalData, setHistoricalData] = useState<PowerHistory[]>(generateMockHistoryData());
  const [alerts, setAlerts] = useState<{ id: string; message: string; title: string; variant: 'default' | 'high' | 'critical' }[]>([]);
  
  // Settings state
  const [settings, setSettings] = useState({
    unitCost: 7.5,
    powerThreshold: 2.0,
    monthlyLimit: 30.0
  });
  
  // Payment related state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Update real-time data at regular intervals
  useEffect(() => {
    if (!socketOn) return; // Don't update if socket is off
    
    const interval = setInterval(() => {
      const newData = generateRealTimeData();
      setRealTimeData(newData);
      
      // Check for thresholds and trigger alerts
      if (newData.power / 1000 > settings.powerThreshold) {
        const alertId = `power-${Date.now()}`;
        const newAlert = {
          id: alertId,
          title: "High Power Consumption",
          message: `Current power usage (${(newData.power / 1000).toFixed(2)} kW) exceeds the threshold of ${settings.powerThreshold} kW`,
          variant: newData.power / 1000 > settings.powerThreshold * 1.5 ? 'critical' : 'high'
        } as const;
        
        setAlerts(prev => [...prev, newAlert]);
      }
      
      if (newData.energy > settings.monthlyLimit) {
        const alertId = `energy-${Date.now()}`;
        setAlerts(prev => [
          ...prev, 
          {
            id: alertId,
            title: "Monthly Energy Limit Exceeded",
            message: `Energy usage (${newData.energy.toFixed(2)} kWh) has exceeded your monthly limit of ${settings.monthlyLimit} kWh`,
            variant: 'critical'
          }
        ]);
      }
      
    }, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, [socketOn, settings]);
  
  // Update historical data less frequently
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update if socket is on
      if (socketOn) {
        const newHistData = [...historicalData];
        
        // Remove oldest entry and add newest
        newHistData.shift();
        newHistData.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          power: realTimeData.power
        });
        
        setHistoricalData(newHistData);
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [historicalData, socketOn, realTimeData]);
  
  // Handle socket toggle
  const handleSocketToggle = () => {
    setSocketOn(!socketOn);
    
    toast({
      title: socketOn ? "Socket Turned Off" : "Socket Turned On",
      description: socketOn 
        ? "The smart socket has been turned off." 
        : "The smart socket has been turned on.",
      duration: 3000
    });
  };
  
  // Handle settings update
  const handleSettingsUpdate = (newSettings: typeof settings) => {
    setSettings(newSettings);
    
    toast({
      title: "Settings Updated",
      description: "Your smart socket settings have been updated.",
      duration: 3000
    });
  };
  
  // Handle monthly reset
  const handleMonthlyReset = () => {
    // In a real app, this would call an API to reset energy values
    toast({
      title: "Monthly Usage Reset",
      description: "Your monthly energy usage has been reset to zero.",
      duration: 3000
    });
  };
  
  // Handle bill download
  const handleDownloadBill = () => {
    // In a real app, this would generate a PDF via a server call
    const pdfUrl = generateBillPDF(
      new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      realTimeData.energy,
      realTimeData.energy * settings.unitCost
    );
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Energy-Bill-${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Bill Downloaded",
      description: "Your energy bill PDF has been downloaded.",
      duration: 3000
    });
  };
  
  // Handle payment completion
  const handlePaymentComplete = () => {
    toast({
      title: "Payment Successful",
      description: "Thank you! Your payment has been processed.",
      duration: 5000
    });
  };
  
  // Handle alert dismissal
  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };
  
  // Find peak usage from historical data
  const peakPower = findPeakUsage(historicalData);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header section */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-energy-low mr-2" />
              <h1 className="text-2xl font-bold">Smart Socket Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
              <Button 
                variant={socketOn ? "default" : "outline"}
                onClick={handleSocketToggle}
                className={socketOn ? "bg-energy-low hover:bg-energy-low/90" : ""}
              >
                {socketOn ? "Socket On" : "Socket Off"}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert banners */}
        {alerts.map((alert) => (
          <AlertBanner
            key={alert.id}
            title={alert.title}
            message={alert.message}
            variant={alert.variant}
            onClose={() => dismissAlert(alert.id)}
          />
        ))}
        
        {/* Tabs */}
        <Tabs defaultValue="monitor" className="space-y-8">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="monitor">Monitor</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            {socketOn && (
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-energy-low animate-pulse mr-2"></div>
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
            )}
          </div>
          
          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <EnergyMeter 
                title="Voltage" 
                value={realTimeData.voltage} 
                unit="V" 
                icon="voltage" 
                max={250} 
              />
              <EnergyMeter 
                title="Current" 
                value={realTimeData.current} 
                unit="A" 
                icon="current" 
                max={10} 
              />
              <EnergyMeter 
                title="Power" 
                value={realTimeData.power} 
                unit="W" 
                icon="power" 
                max={2500} 
                thresholdPercent={80}
              />
              <SocketControl 
                isOn={socketOn} 
                onToggle={handleSocketToggle} 
              />
            </div>
            
            <EnergyChart 
              title="Power Consumption (Last 24 hours)" 
              data={historicalData} 
            />
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-sm text-muted-foreground">
                <p className="flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-2 text-energy-high" />
                  Peak power usage: <strong className="ml-1">{peakPower?.power || 0} W</strong> at {peakPower?.time || "N/A"}
                </p>
                <p className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-energy-low" />
                  Current energy consumption: <strong className="ml-1">{realTimeData.energy.toFixed(2)} kWh</strong> this month
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <EnergyChart 
                  title="Energy Usage History" 
                  data={historicalData.map(item => ({ ...item, power: item.power / 50 }))} // Convert to kWh for display
                  height={280}
                />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium mb-2">Energy Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Current Period:</span>
                        <span>{getBillingPeriod()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Usage:</span>
                        <span>{realTimeData.energy.toFixed(2)} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Monthly:</span>
                        <span>{(realTimeData.energy * 2).toFixed(2)} kWh</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-medium mb-2">Payment Methods</h3>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        You can pay your bill using credit card or bank transfer.
                      </p>
                      <Button onClick={() => setShowPaymentModal(true)}>
                        Make Payment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <BillingCard 
                  currentUsage={realTimeData.energy} 
                  unitCost={settings.unitCost}
                  billingPeriod={getBillingPeriod()}
                  onDownloadBill={handleDownloadBill}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsPanel 
                unitCost={settings.unitCost}
                powerThreshold={settings.powerThreshold}
                monthlyLimit={settings.monthlyLimit}
                onUpdate={handleSettingsUpdate}
                onReset={handleMonthlyReset}
              />
              
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium mb-4">System Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Device ID:</span>
                      <span>SMARTSOCKET_001</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Firmware Version:</span>
                      <span>v1.2.5</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Connection Status:</span>
                      <span className={socketOn ? "text-energy-low" : "text-muted-foreground"}>
                        {socketOn ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span>{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Firebase Path:</span>
                      <span className="font-mono">/smart_socket_1/</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium mb-4">About</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This dashboard displays the simulated data from a Smart Socket IoT device. 
                    The actual implementation would connect to Arduino Uno R3 through TinkerCAD, 
                    Blynk Cloud, and a Firebase Realtime Database.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Project developed for academic purposes to demonstrate IoT-based 
                    energy monitoring and billing systems.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={realTimeData.energy * settings.unitCost}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default Index;
