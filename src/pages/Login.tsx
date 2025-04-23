
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/database";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoggingIn(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Login Successful",
      description: "Redirecting to your dashboard...",
      duration: 2000,
    });
    
    // Fetch the user's role from profile
    setTimeout(async () => {
      try {
        // Using type assertion to bypass the TypeScript error
        const { data: profileData } = await (supabase
          .from('profiles') as any)
          .select('role')
          .eq('id', data.user?.id)
          .maybeSingle();
          
        const profile = profileData as Profile | null;

        if (profile?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Default to user route if profile fetch fails
        navigate("/user");
      }
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-energy-low via-white to-gray-200">
      <Card className="max-w-sm w-full p-0 animate-scale-in">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              type="email"
            />
            <Input
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              type="password"
            />
            <Button className="w-full mt-2" type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
            <div className="text-xs text-muted-foreground text-center mt-2">
              Use your registered email and password.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default Login;
