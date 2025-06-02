import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { 
  Baby, 
  Cross,
  FileText, 
  Shield, 
  Clock, 
  CheckCircle2,
  Users,
  QrCode,
  ArrowRight,
  AlertCircle,
  IdCard,
  Search
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [certificateNumber, setCertificateNumber] = useState("");

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

  const handleQuickVerify = () => {
    if (certificateNumber.trim()) {
      setLocation(`/verify?cert=${encodeURIComponent(certificateNumber)}`);
    } else {
      setLocation("/verify");
    }
  };

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gov-light">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="hero-gradient rounded-2xl p-12 mb-8 text-white shadow-2xl border border-blue-400/20">
          <div className="max-w-5xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 hero-text-shadow leading-tight">
              {getGreeting()}, <span className="text-blue-200">{user?.firstName || "User"}</span>
            </h1>
            <p className="text-blue-50 text-2xl mb-8 font-medium leading-relaxed">
              Welcome to Ghana's digital registry system. Manage vital records with confidence and security.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 border border-white/20">
                <Shield size={24} className="text-blue-200" />
                <span className="text-lg font-semibold">Secure & Verified</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 border border-white/20">
                <Clock size={24} className="text-blue-200" />
                <span className="text-lg font-semibold">24/7 Available</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 border border-white/20">
                <CheckCircle2 size={24} className="text-blue-200" />
                <span className="text-lg font-semibold">Government Approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <StatsCards stats={stats} />

        {/* Service Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gov-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Baby className="text-gov-blue" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Birth Registration</h3>
              <p className="text-sm text-gov-gray mb-4">
                Register newborns and obtain official birth certificates
              </p>
              <Badge variant="outline" className="text-xs">
                Digital Process
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cross className="text-gray-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Death Registration</h3>
              <p className="text-sm text-gov-gray mb-4">
                Register deaths and obtain official death certificates
              </p>
              <Badge variant="outline" className="text-xs">
                Required Documents
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gov-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-gov-green" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Certificate Verification</h3>
              <p className="text-sm text-gov-gray mb-4">
                Verify authenticity of issued certificates instantly
              </p>
              <Badge variant="outline" className="text-xs">
                QR Code Support
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gov-orange bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-gov-orange" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Document Management</h3>
              <p className="text-sm text-gov-gray mb-4">
                Secure storage and retrieval of all vital documents
              </p>
              <Badge variant="outline" className="text-xs">
                Cloud Storage
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Registration Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="text-gov-blue" size={20} />
                  <span>Start New Registration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Link href="/register/birth">
                  <Button className="w-full bg-gov-blue hover:bg-blue-700 text-white h-auto p-6 justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <Baby size={24} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg">Birth Registration</div>
                        <div className="text-sm opacity-90">
                          Register a new birth and obtain official certificate
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          Required: Medical certificate, Parent IDs
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link href="/register/death">
                  <Button className="w-full bg-gov-gray hover:bg-gray-700 text-white h-auto p-6 justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <Cross size={24} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg">Death Registration</div>
                        <div className="text-sm opacity-90">
                          Register a death and obtain official certificate
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          Required: Medical certificate, Next of kin details
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Verification */}
          <div>
            <Card>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="text-gov-green" size={20} />
                  <span>Quick Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Certificate Number
                  </label>
                  <div className="flex space-x-2">
                    <Input 
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                      placeholder="BC123456789" 
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleQuickVerify}
                      className="bg-gov-green hover:bg-green-700 text-white"
                    >
                      <Search size={16} />
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span className="text-sm text-gov-gray">OR</span>
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-gov-blue border-gov-blue hover:bg-blue-50"
                    onClick={() => setLocation("/verify")}
                  >
                    <QrCode className="mr-2" size={16} />
                    Advanced Verification
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="text-blue-600 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Verification Tips</p>
                      <p className="text-xs text-blue-800 mt-1">
                        Enter the complete certificate number as shown on your document for instant verification.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Applications */}
        <RecentApplications />
      </div>
    </div>
  );
}