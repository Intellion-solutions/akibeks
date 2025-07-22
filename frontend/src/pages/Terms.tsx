
import { FileText, Scale, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <>
      <SEOHead 
        title="Terms of Service - AKIBEKS Engineering Solutions"
        description="Read the terms and conditions for using AKIBEKS Engineering Solutions services. Understand your rights and responsibilities."
        keywords={["terms of service", "terms and conditions", "AKIBEKS terms", "engineering terms", "construction terms"]}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-xl text-gray-600">
                Please read these terms carefully before using our services.
              </p>
              <div className="w-24 h-1 bg-blue-600 mx-auto mt-6"></div>
            </div>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Service Agreement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    By engaging AKIBEKS Engineering Solutions, you agree to these terms. Our services include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Civil and structural engineering design</li>
                    <li>Construction supervision and management</li>
                    <li>Project consultation and planning</li>
                    <li>Technical drawings and specifications</li>
                    <li>Site visits and inspections</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-blue-600" />
                    Client Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    As our client, you agree to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Provide accurate and complete project information</li>
                    <li>Make timely payments according to agreed terms</li>
                    <li>Obtain necessary permits and approvals</li>
                    <li>Provide safe site access for our team</li>
                    <li>Communicate changes or concerns promptly</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                    Payment Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Our standard payment terms include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>30% deposit required to commence work</li>
                    <li>Progress payments as per agreed milestones</li>
                    <li>Final payment due within 30 days of completion</li>
                    <li>Late payment charges of 2% per month</li>
                    <li>All payments in Kenyan Shillings unless otherwise agreed</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    Limitations and Liability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Please note the following limitations:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>We provide professional services based on current standards</li>
                    <li>Liability is limited to the value of services provided</li>
                    <li>We are not responsible for third-party actions</li>
                    <li>Force majeure events may affect project timelines</li>
                    <li>All designs remain our intellectual property until full payment</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-amber-50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty & Support</h3>
                  <p className="text-gray-700 mb-4">
                    We stand behind our work with:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>12-month warranty on design work</li>
                    <li>Free consultation for clarifications</li>
                    <li>Ongoing support for approved projects</li>
                    <li>Professional indemnity insurance coverage</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <p className="text-gray-700 mb-4">
                    Questions about these terms? Contact us:
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> legal@akibeks.co.ke</p>
                    <p><strong>Phone:</strong> +254 710 245 118</p>
                    <p><strong>Address:</strong> Nairobi, Kenya</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default Terms;
