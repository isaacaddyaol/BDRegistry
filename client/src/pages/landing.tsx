import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IdCard, Shield, Users, FileCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gov-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gov-blue rounded-lg flex items-center justify-center">
                <IdCard className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Ghana Registry</h1>
                <p className="text-sm text-gov-gray">Birth & Death Registration</p>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-gov-blue hover:bg-blue-700 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Ghana Birth & Death
            <span className="block text-gov-blue">Registration System</span>
          </h1>
          <p className="text-xl text-gov-gray max-w-3xl mx-auto mb-8">
            A secure, digital platform for registering vital events, verifying certificates, 
            and ensuring accurate record-keeping for all Ghanaians.
          </p>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            size="lg"
            className="bg-gov-blue hover:bg-blue-700 text-white px-8 py-4"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gov-blue bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <IdCard className="text-gov-blue" size={32} />
              </div>
              <CardTitle className="text-lg">Digital Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gov-gray">
                Submit birth and death registrations online with ease and convenience.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gov-green bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-gov-green" size={32} />
              </div>
              <CardTitle className="text-lg">Secure Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gov-gray">
                Verify the authenticity of certificates using unique IDs and QR codes.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gov-orange bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-gov-orange" size={32} />
              </div>
              <CardTitle className="text-lg">Multi-Role Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gov-gray">
                Role-based access for citizens, health workers, registrars, and administrators.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gov-gray bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileCheck className="text-gov-gray" size={32} />
              </div>
              <CardTitle className="text-lg">Instant Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gov-gray">
                Download digital certificates immediately upon approval with QR verification.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Process Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Simple Registration Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gov-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Submit Application</h3>
              <p className="text-gov-gray">
                Complete the registration form with required information and upload supporting documents.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gov-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Review & Approval</h3>
              <p className="text-gov-gray">
                Trained registrars verify the information and approve valid applications.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gov-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Receive IdCard</h3>
              <p className="text-gov-gray">
                Download your official digital certificate with unique verification code.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gov-gray">
            © 2024 Ghana Birth & Death Registry. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
