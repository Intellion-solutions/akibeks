
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Users, Target, Lightbulb } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const Consulting = () => {
  const services = [
    {
      title: "Project Planning & Design",
      description: "Comprehensive project planning from concept to completion with detailed architectural and engineering designs.",
      features: ["Site Analysis", "Design Development", "3D Modeling", "Permit Processing"]
    },
    {
      title: "Construction Management",
      description: "Professional oversight of construction projects ensuring quality, timeline, and budget compliance.",
      features: ["Project Scheduling", "Quality Control", "Budget Management", "Safety Compliance"]
    },
    {
      title: "Engineering Solutions",
      description: "Expert engineering consultation for structural, civil, and mechanical systems.",
      features: ["Structural Analysis", "MEP Systems", "Code Compliance", "Technical Reviews"]
    }
  ];

  return (
    <>
      <SEOHead 
        title="Construction Consulting Services | Expert Project Guidance"
        description="Professional construction consulting services including project planning, design, and management expertise for residential and commercial projects."
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Expert Construction Consulting
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Transform your vision into reality with our comprehensive consulting services. 
              From initial planning to project completion, we guide you every step of the way.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <a href="/request-quote">Get Consultation</a>
            </Button>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Consulting Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive consulting solutions tailored to your project needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" asChild>
                      <a href="/contact">
                        Learn More <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Consulting?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the difference of working with seasoned professionals
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
                <p className="text-gray-600">15+ years of combined experience in construction and engineering</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
                <p className="text-gray-600">Successfully completed 200+ projects on time and within budget</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">Latest technology and methods for efficient project delivery</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Get expert consultation for your construction project. Let's discuss your vision and create a plan for success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="/request-quote">Request Consultation</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Consulting;
