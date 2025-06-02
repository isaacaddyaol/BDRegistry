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
import { Baby, Cross, Search, QrCode, ArrowRight } from "lucide-react";
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Register New Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/register/birth">
                <Button className="w-full bg-gov-blue hover:bg-blue-700 text-white h-auto p-6 justify-between">
                  <div className="flex items-center space-x-3">
                    <Baby size={24} />
                    <div className="text-left">
                      <div className="font-medium">Birth Registration</div>
                      <div className="text-sm opacity-90">Register a new birth certificate</div>
                    </div>
                  </div>
                  <ArrowRight size={20} />
                </Button>
              </Link>
              
              <Link href="/register/death">
                <Button className="w-full bg-gov-gray hover:bg-gray-700 text-white h-auto p-6 justify-between">
                  <div className="flex items-center space-x-3">
                    <Cross size={24} />
                    <div className="text-left">
                      <div className="font-medium">Death Registration</div>
                      <div className="text-sm opacity-90">Register a death certificate</div>
                    </div>
                  </div>
                  <ArrowRight size={20} />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Verify Certificate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="certificateId" className="text-sm font-medium text-gray-700">
                  Certificate ID
                </Label>
                <div className="flex space-x-2 mt-2">
                  <Input 
                    id="certificateId"
                    placeholder="Enter certificate number" 
                    className="flex-1"
                  />
                  <Link href="/verify">
                    <Button className="bg-gov-green hover:bg-green-700 text-white">
                      <Search size={16} />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gov-gray mb-4">Or scan QR code</p>
                <Button variant="outline" className="text-gov-gray hover:bg-gray-50">
                  <QrCode className="mr-2" size={16} />
                  Scan QR Code
                </Button>
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
