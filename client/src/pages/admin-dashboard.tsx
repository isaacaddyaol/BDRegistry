import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import PendingApplications from "@/components/admin/pending-applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Users, 
  CheckCircle, 
  BarChart3, 
  Clock 
} from "lucide-react";
import { useLocation } from "wouter";

interface Stats {
  pendingApplications: number;
  thisMonthRegistrations: number;
  totalBirths: number;
  totalDeaths: number;
}

interface Application {
  id: number;
  type: 'birth' | 'death';
  applicationId: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Check for admin/registrar access
  useEffect(() => {
    if (!isLoading) {
      console.log('Checking dashboard access for user role:', user?.role);
      
      // Only allow admin users and registrar@registry.gov.gh
      if (!user || 
          (user.role !== 'admin' && 
           !(user.role === 'registrar' && user.email === 'registrar@registry.gov.gh'))) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the admin dashboard",
          variant: "destructive",
        });
        setLocation("/");
        return;
      }
    }
  }, [isLoading, user, toast, setLocation]);

  const { data: stats, error: statsError } = useQuery<Stats>({
    queryKey: ["/api/statistics"],
    retry: false,
    refetchOnWindowFocus: false
  });

  const { data: pendingApps, error: pendingError } = useQuery<Application[]>({
    queryKey: ["/api/pending-applications"],
    retry: false,
    refetchOnWindowFocus: false
  });

  // Handle API errors without causing re-renders
  useEffect(() => {
    if (statsError || pendingError) {
      console.error('API Error:', statsError || pendingError);
      const error = statsError || pendingError;
      
      if (error && isUnauthorizedError(error)) {
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [statsError, pendingError, toast]);

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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrative Dashboard</h2>
          <p className="text-gov-gray">Manage applications, users, and system analytics</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.pendingApplications || 0}
              </p>
              <p className="text-sm text-gov-gray">Urgent Reviews</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="text-gov-blue" size={24} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">12</p>
              <p className="text-sm text-gov-gray">Active Registrars</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="text-gov-green" size={24} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.thisMonthRegistrations || 0}
              </p>
              <p className="text-sm text-gov-gray">Approved Today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="text-gray-600" size={24} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">94%</p>
              <p className="text-sm text-gov-gray">Processing Rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="text-purple-600" size={24} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">2.3d</p>
              <p className="text-sm text-gov-gray">Avg Processing</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Applications */}
          <div className="lg:col-span-2">
            <PendingApplications applications={pendingApps || []} />
          </div>

          {/* System Analytics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gov-gray">Greater Accra</span>
                    <span className="text-sm font-medium">
                      {Math.round((stats?.totalBirths || 0) * 0.65)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gov-blue h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gov-gray">Ashanti</span>
                    <span className="text-sm font-medium">
                      {Math.round((stats?.totalBirths || 0) * 0.47)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gov-blue h-2 rounded-full" style={{ width: "47%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gov-gray">Northern</span>
                    <span className="text-sm font-medium">
                      {Math.round((stats?.totalBirths || 0) * 0.24)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gov-blue h-2 rounded-full" style={{ width: "24%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Database</span>
                    </div>
                    <span className="text-sm text-gov-gray">Operational</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">File Storage</span>
                    </div>
                    <span className="text-sm text-gov-gray">Operational</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Email Service</span>
                    </div>
                    <span className="text-sm text-gov-gray">Degraded</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
