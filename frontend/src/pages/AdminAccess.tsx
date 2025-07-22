
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, User, Eye, EyeOff, Shield, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import SecurityHeaders from "@/components/SecurityHeaders";

const AdminAccess = () => {
  const [credentials, setCredentials] = useState({
    email: "admin@akibeks.com",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, isAuthenticated, loginAttempts, isLocked } = useAdmin();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast({
        title: "Account Locked",
        description: "Please wait before attempting to login again.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const success = await login(credentials.email, credentials.password);
      if (success) {
        navigate("/admin");
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SecurityHeaders />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(156,146,172)_2px,transparent_2px)] bg-[length:30px_30px]"></div>
        </div>
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Admin Portal</h2>
            <p className="text-gray-600">
              Secure access to your administration panel
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Lock className="w-6 h-6 text-blue-600" />
                Admin Login
              </CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLocked && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Account Temporarily Locked</p>
                    <p className="text-sm text-red-700 mt-1">
                      Too many failed login attempts. Please wait before trying again.
                    </p>
                  </div>
                </div>
              )}

              {loginAttempts > 0 && !isLocked && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {5 - loginAttempts} login attempts remaining
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">Account will be locked after 5 failed attempts.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      placeholder="admin@akibeks.com"
                      required
                      disabled={isLocked}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-11 pr-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      placeholder="Enter your password"
                      required
                      disabled={isLocked}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLocked}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50" 
                  disabled={loading || isLocked}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In Securely
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-blue-800">
                        <span className="font-medium">Email:</span> admin@akibeks.com
                      </p>
                      <p className="text-blue-800">
                        <span className="font-medium">Password:</span> admin123
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>Protected by advanced security measures</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminAccess;
