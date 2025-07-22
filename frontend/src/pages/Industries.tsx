
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Factory, Home, Zap, Droplets, Car, Wrench, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";

const Industries = () => {
  const industries = [
    {
      icon: Building2,
      title: "Commercial Real Estate",
      description: "Office buildings, shopping centers, and mixed-use developments",
      projects: "150+ Projects",
      color: "from-blue-500 to-blue-600",
      image: "/placeholder.svg"
    },
    {
      icon: Factory,
      title: "Manufacturing & Industrial",
      description: "Production facilities, warehouses, and processing plants",
      projects: "85+ Projects",
      color: "from-purple-500 to-purple-600",
      image: "/placeholder.svg"
    },
    {
      icon: Home,
      title: "Residential Development",
      description: "Luxury homes, estates, and residential communities",
      projects: "200+ Projects",
      color: "from-green-500 to-green-600",
      image: "/placeholder.svg"
    },
    {
      icon: Zap,
      title: "Energy & Utilities",
      description: "Power generation, solar installations, and utility infrastructure",
      projects: "45+ Projects",
      color: "from-yellow-500 to-yellow-600",
      image: "/placeholder.svg"
    },
    {
      icon: Droplets,
      title: "Water & Environment",
      description: "Water treatment, waste management, and environmental projects",
      projects: "60+ Projects",
      color: "from-cyan-500 to-cyan-600",
      image: "/placeholder.svg"
    },
    {
      icon: Car,
      title: "Transportation",
      description: "Roads, bridges, airports, and transportation infrastructure",
      projects: "30+ Projects",
      color: "from-red-500 to-red-600",
      image: "/placeholder.svg"
    },
    {
      icon: Wrench,
      title: "Oil & Gas",
      description: "Refineries, pipelines, and petrochemical facilities",
      projects: "25+ Projects",
      color: "from-orange-500 to-orange-600",
      image: "/placeholder.svg"
    },
    {
      icon: Shield,
      title: "Government & Public",
      description: "Public buildings, schools, hospitals, and civic centers",
      projects: "40+ Projects",
      color: "from-indigo-500 to-indigo-600",
      image: "/placeholder.svg"
    }
  ];

  return (
    <>
      <SEOHead
        title="Industries We Serve - AKIBEKS Engineering"
        description="AKIBEKS Engineering serves diverse industries including commercial real estate, manufacturing, residential development, energy, water treatment, and transportation infrastructure."
        keywords={["engineering industries", "commercial construction", "manufacturing facilities", "residential development", "energy projects", "transportation infrastructure"]}
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-24">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Industries We Serve
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
            Delivering specialized engineering solutions across diverse sectors with proven expertise and innovation
          </p>
        </div>
      </div>

      {/* Industries Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Expertise Across Industries</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              With over a decade of experience, we've successfully delivered projects across multiple industries, 
              each with unique challenges and requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industries.map((industry, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${industry.color}`}></div>
                <CardContent className="p-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${industry.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <industry.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {industry.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {industry.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      {industry.projects}
                    </span>
                    <Button variant="ghost" size="sm" className="p-0 h-auto group-hover:text-blue-600">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Track Record</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">635+</div>
              <div className="text-gray-600">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">8</div>
              <div className="text-gray-600">Industries Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">12+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Discuss Your Industry-Specific Needs?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our industry experts are ready to provide tailored solutions for your specific sector requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/request-quote">
                Get Industry Quote
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              <Link to="/contact">
                Schedule Consultation
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

export default Industries;
