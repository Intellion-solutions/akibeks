
import { Shield, Lock, Eye, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <>
      <SEOHead 
        title="Privacy Policy - AKIBEKS Engineering Solutions"
        description="Learn how AKIBEKS Engineering Solutions protects your privacy and handles your personal information. Comprehensive privacy policy and data protection details."
        keywords="privacy policy, data protection, AKIBEKS privacy, engineering privacy, construction privacy"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-xl text-gray-600">
                Your privacy is important to us. Learn how we protect your information.
              </p>
              <div className="w-24 h-1 bg-blue-600 mx-auto mt-6"></div>
            </div>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                    Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    We collect information you provide directly to us, such as when you:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Request a quote or consultation</li>
                    <li>Contact us through our website or phone</li>
                    <li>Subscribe to our newsletter</li>
                    <li>Participate in surveys or feedback forms</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-blue-600" />
                    How We Use Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Provide and improve our engineering services</li>
                    <li>Respond to your inquiries and requests</li>
                    <li>Send you project updates and communications</li>
                    <li>Comply with legal obligations</li>
                    <li>Analyze and improve our website performance</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-blue-600" />
                    Information Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>With your explicit consent</li>
                    <li>To trusted partners who assist in our operations</li>
                    <li>When required by law or legal process</li>
                    <li>To protect our rights and safety</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                    Your Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Access and review your personal information</li>
                    <li>Request corrections to inaccurate data</li>
                    <li>Request deletion of your personal information</li>
                    <li>Opt-out of marketing communications</li>
                    <li>File a complaint with relevant authorities</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
                  <p className="text-gray-700 mb-4">
                    If you have questions about this Privacy Policy or our privacy practices, contact us:
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> privacy@akibeks.co.ke</p>
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

export default Privacy;
