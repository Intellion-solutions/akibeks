import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Leaf, 
  Recycle, 
  Sun, 
  Droplets, 
  Wind, 
  TreePine,
  Target,
  Award,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Sustainability = () => {
  const sustainabilityPractices = [
    {
      icon: <Leaf className="h-12 w-12 text-green-600" />,
      title: "Green Building Materials",
      description: "We use eco-friendly, locally sourced materials that reduce environmental impact and support Kenyan suppliers.",
      features: ["Recycled concrete", "Bamboo construction", "Local timber", "Low-emission paints"]
    },
    {
      icon: <Sun className="h-12 w-12 text-yellow-600" />,
      title: "Solar Energy Integration",
      description: "Solar-powered construction sites and renewable energy solutions for all our projects.",
      features: ["Solar panel installation", "Energy-efficient lighting", "Solar water heating", "Grid-tie systems"]
    },
    {
      icon: <Droplets className="h-12 w-12 text-blue-600" />,
      title: "Water Conservation",
      description: "Advanced water management systems to conserve Kenya's precious water resources.",
      features: ["Rainwater harvesting", "Greywater recycling", "Efficient irrigation", "Water-saving fixtures"]
    },
    {
      icon: <Recycle className="h-12 w-12 text-green-700" />,
      title: "Waste Management",
      description: "Zero-waste construction sites with comprehensive recycling and waste reduction programs.",
      features: ["Material recycling", "Waste sorting", "Composting programs", "Circular economy practices"]
    },
    {
      icon: <Wind className="h-12 w-12 text-gray-600" />,
      title: "Air Quality",
      description: "Dust control and air quality management during construction to protect local communities.",
      features: ["Dust suppression", "Air quality monitoring", "Clean construction methods", "Community protection"]
    },
    {
      icon: <TreePine className="h-12 w-12 text-green-800" />,
      title: "Biodiversity Protection",
      description: "Protecting Kenya's unique ecosystems and promoting biodiversity in our construction projects.",
      features: ["Native landscaping", "Wildlife corridors", "Ecosystem restoration", "Green spaces"]
    }
  ];

  const certifications = [
    {
      title: "LEED Certified",
      description: "Leadership in Energy and Environmental Design",
      icon: <Award className="h-8 w-8 text-green-600" />
    },
    {
      title: "Kenya Green Building",
      description: "Certified by Kenya Green Building Society",
      icon: <Award className="h-8 w-8 text-green-600" />
    },
    {
      title: "ISO 14001",
      description: "Environmental Management Systems",
      icon: <Award className="h-8 w-8 text-green-600" />
    },
    {
      title: "NEMA Compliance",
      description: "National Environment Management Authority",
      icon: <Award className="h-8 w-8 text-green-600" />
    }
  ];

  const impactStats = [
    { number: "40%", label: "Carbon Footprint Reduction", description: "Compared to traditional construction" },
    { number: "60%", label: "Water Conservation", description: "Through efficient systems" },
    { number: "85%", label: "Waste Recycling Rate", description: "On our construction sites" },
    { number: "500+", label: "Trees Planted", description: "As part of our green initiatives" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <Leaf className="h-16 w-16 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Sustainable Construction
              <span className="text-green-600 block">for Kenya's Future</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Building a greener Kenya through eco-friendly construction practices, 
              renewable energy integration, and environmental stewardship that 
              protects our beautiful nation for future generations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request-quote">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Get Green Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Environmental Commitment
            </h2>
            <p className="text-lg text-gray-600">
              At AKIBEKS, we believe that construction and environmental protection 
              go hand in hand. We're committed to building Kenya's infrastructure 
              while preserving the natural beauty and resources of our homeland.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sustainabilityPractices.map((practice, index) => (
              <Card key={index} className="border-2 hover:border-green-200 transition-colors">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {practice.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {practice.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {practice.description}
                  </p>
                  <ul className="space-y-2">
                    {practice.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Environmental Impact
            </h2>
            <p className="text-lg text-gray-600">
              Measurable results in sustainable construction across Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Green Building Certifications
            </h2>
            <p className="text-lg text-gray-600">
              Recognized for our commitment to sustainable construction practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="text-center border-2 hover:border-green-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {cert.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {cert.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Kenya Focus */}
      <section className="py-16 bg-gradient-to-r from-green-100 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Protecting Kenya's Natural Heritage
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Kenya's diverse ecosystems - from the savannas of Maasai Mara to 
                    the coastal forests of Mombasa - inspire our commitment to 
                    sustainable construction practices.
                  </p>
                  <p>
                    We work closely with local communities, environmental groups, 
                    and government agencies to ensure our projects enhance rather 
                    than harm Kenya's natural beauty.
                  </p>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-green-600 mr-3" />
                      <span>Supporting Kenya's Vision 2030 sustainability goals</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-green-600 mr-3" />
                      <span>Contributing to UN Sustainable Development Goals</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-green-600 mr-3" />
                      <span>Promoting green jobs and skills development</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Our Green Promise
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-semibold">Carbon Neutral by 2030</div>
                      <div className="text-sm text-gray-600">Offsetting all construction emissions</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-semibold">Zero Waste Sites</div>
                      <div className="text-sm text-gray-600">100% waste diversion from landfills</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-semibold">Community First</div>
                      <div className="text-sm text-gray-600">Local sourcing and employment</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link to="/contact">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Discuss Your Green Project
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Sustainably?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join us in creating a greener Kenya. Get a free consultation 
            for your eco-friendly construction project today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/request-quote">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Start Your Green Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                Contact Our Green Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Sustainability;