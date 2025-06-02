import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentApplications from "@/components/dashboard/recent-applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Baby, Cross, Search, QrCode, ArrowRight, IdCard, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/statistics"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gov-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-blue mx-auto mb-4"></div>
          <p className="text-gov-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gov-light">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <StatsCards stats={stats} />

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-l-4 border-l-gov-blue">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gov-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                  <IdCard className="text-gov-blue" size={24} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Register New Event
                  </CardTitle>
                  <p className="text-sm text-gov-gray mt-1">
                    Submit birth or death registration applications
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/register/birth">
                <div className="group w-full border-2 border-dashed border-gov-blue border-opacity-30 hover:border-opacity-60 rounded-lg p-6 transition-all duration-200 hover:bg-gov-blue hover:bg-opacity-5 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gov-blue bg-opacity-10 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-colors">
                        <Baby className="text-gov-blue" size={28} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 text-lg">Birth Registration</div>
                        <div className="text-sm text-gov-gray mt-1">
                          Register a newborn child with the national registry
                        </div>
                        <div className="text-xs text-gov-blue mt-2 font-medium">
                          Required: Hospital certificate, Parent IDs
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="text-gov-blue group-hover:translate-x-1 transition-transform" size={20} />
                  </div>
                </div>
              </Link>
              
              <Link href="/register/death">
                <div className="group w-full border-2 border-dashed border-gov-gray border-opacity-30 hover:border-opacity-60 rounded-lg p-6 transition-all duration-200 hover:bg-gov-gray hover:bg-opacity-5 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gov-gray bg-opacity-10 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-colors">
                        <Cross className="text-gov-gray" size={28} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 text-lg">Death Registration</div>
                        <div className="text-sm text-gov-gray mt-1">
                          Register a deceased person with the national registry
                        </div>
                        <div className="text-xs text-gov-gray mt-2 font-medium">
                          Required: Medical certificate, Next of kin ID
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="text-gov-gray group-hover:translate-x-1 transition-transform" size={20} />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gov-green">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gov-green bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Shield className="text-gov-green" size={24} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Verify Certificate
                  </CardTitle>
                  <p className="text-sm text-gov-gray mt-1">
                    Check authenticity of issued certificates
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="certificateId" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Search size={16} className="text-gov-green" />
                  <span>Certificate Number</span>
                </Label>
                <div className="flex space-x-2 mt-2">
                  <Input 
                    id="certificateId"
                    placeholder="BC123456789 or DC123456789" 
                    className="flex-1 h-11"
                  />
                  <Link href="/verify">
                    <Button className="bg-gov-green hover:bg-green-700 text-white h-11 px-6">
                      <Search size={16} />
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-gov-gray mt-2">
                  Enter the certificate number found on your document
                </p>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gov-gray">OR</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="border-2 border-dashed border-gov-green border-opacity-30 hover:border-opacity-60 rounded-lg p-4 transition-colors group cursor-pointer">
                  <QrCode className="mx-auto text-gov-green mb-2 group-hover:scale-110 transition-transform" size={32} />
                  <p className="text-sm font-medium text-gray-900 mb-1">Scan QR Code</p>
                  <p className="text-xs text-gov-gray">
                    Use your device camera to scan the QR code on the certificate
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="text-gov-green mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-green-900">Instant Verification</p>
                    <p className="text-xs text-green-700 mt-1">
                      Get immediate confirmation of certificate authenticity and issuing details
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <RecentApplications />
      </div>
    </div>
  );
}
