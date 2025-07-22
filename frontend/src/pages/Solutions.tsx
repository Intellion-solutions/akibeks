
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, Factory, Home, Zap, Wrench, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import ModernHero from "@/components/ModernHero";
import Footer from "@/components/Footer";

const Solutions = () => {
  const solutions = [
    {
      icon: Building,
      title: "Commercial Construction",
      description: "Complete commercial building solutions from concept to completion",
      features: ["Office complexes", "Retail spaces", "Industrial facilities", "Mixed-use developments"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Home,
      title: "Residential Projects",
      description: "Custom homes and residential developments tailored to your lifestyle",
      features: ["Custom homes", "Residential estates", "Apartment complexes", "Villa projects"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: Factory,
      title: "Industrial Engineering",
      description: "Specialized industrial solutions for manufacturing and processing",
      features: ["Manufacturing plants", "Warehouses", "Processing facilities", "Infrastructure"],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Zap,
      title: "Smart Building Systems",
      description: "Modern automation and smart technology integration",
      features: ["Home automation", "Smart HVAC", "Security systems", "Energy management"],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Wrench,
      title: "Maintenance & Support",
      description: "Ongoing maintenance and technical support services",
      features: ["Preventive maintenance", "Emergency repairs", "System upgrades", "24/7 support"],
      color: "from-red-500 to-red-600"
    },
    {
      icon: Shield,
      title: "Safety & Compliance",
      description: "Ensuring all projects meet safety standards and regulations",
      features: ["Safety audits", "Compliance consulting", "Risk assessment", "Training programs"],
      color: "from-teal-500 to-teal-600"
    }
  ];

  return (
    <>
      <SEOHead
        title="Engineering Solutions - AKIBEKS Engineering"
        description="Comprehensive engineering solutions for commercial, residential, and industrial projects. From smart building systems to maintenance and safety compliance."
        keywords={["engineering solutions", "commercial construction", "residential projects", "industrial engineering", "smart buildings", "maintenance services"]}
      />

      <ModernHero
        title="Comprehensive Engineering Solutions"
        subtitle="From concept to completion, we deliver innovative engineering solutions that exceed expectations and build lasting value."
        ctaText="Explore Solutions"
        ctaLink="#solutions"
        backgroundImage="/placeholder.svg"
      />

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Engineering Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a comprehensive range of engineering services designed to meet the unique needs of every project, from residential homes to large-scale industrial facilities.
            </p>
          </div>

          <div id="solutions" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-r ${solution.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <solution.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {solution.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {solution.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <ArrowRight className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Link to="/contact">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Let's discuss how our engineering solutions can bring your vision to life. Contact us today for a consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/request-quote">
                Get Quote
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              <Link to="/contact">
                Contact Us
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Solutions;
