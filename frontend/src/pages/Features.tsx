
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Star, ArrowRight, Zap, Shield, Users, Briefcase, Building2, Hammer, Wrench, Clock, DollarSign, Award, Target, Lightbulb, Phone } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const Features = () => {
  const [activeTab, setActiveTab] = useState("construction");

  const constructionFeatures = [
    {
      icon: Building2,
      title: "Residential Construction",
      description: "Complete home building services from foundation to finishing",
      highlights: ["Custom home design", "Energy-efficient construction", "Modern amenities", "Quality materials"],
      image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: Briefcase,
      title: "Commercial Projects",
      description: "Large-scale commercial and industrial construction solutions",
      highlights: ["Office complexes", "Retail spaces", "Warehouses", "Industrial facilities"],
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: Hammer,
      title: "Infrastructure Development",
      description: "Critical infrastructure projects for communities and businesses",
      highlights: ["Road construction", "Bridge building", "Water systems", "Utilities installation"],
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const engineeringFeatures = [
    {
      icon: Target,
      title: "Structural Engineering",
      description: "Advanced structural design and analysis for safe, durable buildings",
      highlights: ["Seismic design", "Load analysis", "Material optimization", "Safety compliance"],
      premium: true
    },
    {
      icon: Lightbulb,
      title: "MEP Engineering",
      description: "Mechanical, Electrical, and Plumbing systems design",
      highlights: ["HVAC systems", "Electrical design", "Plumbing layouts", "Fire safety systems"],
      premium: true
    },
    {
      icon: Wrench,
      title: "Civil Engineering",
      description: "Comprehensive civil engineering for infrastructure projects",
      highlights: ["Site development", "Drainage systems", "Transportation planning", "Environmental impact"],
      premium: false
    }
  ];

  const serviceFeatures = [
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support and emergency services",
      color: "text-blue-600"
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Rigorous quality control and testing at every stage",
      color: "text-green-600"
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "Clear, upfront pricing with no hidden costs",
      color: "text-purple-600"
    },
    {
      icon: Award,
      title: "Certified Professionals",
      description: "Licensed engineers and certified construction professionals",
      color: "text-orange-600"
    },
    {
      icon: Users,
      title: "Dedicated Team",
      description: "Experienced project managers and skilled craftspeople",
      color: "text-teal-600"
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Efficient project execution with on-time delivery",
      color: "text-red-600"
    }
  ];

  const technologyFeatures = [
    {
      title: "3D Modeling & Visualization",
      description: "Advanced 3D modeling software for accurate project visualization",
      benefits: ["Better client understanding", "Reduced errors", "Faster approvals", "Cost savings"]
    },
    {
      title: "Project Management Software",
      description: "State-of-the-art project tracking and management systems",
      benefits: ["Real-time updates", "Resource optimization", "Timeline tracking", "Budget monitoring"]
    },
    {
      title: "Quality Control Systems",
      description: "Digital quality assurance and inspection tools",
      benefits: ["Consistent quality", "Documentation", "Compliance tracking", "Issue resolution"]
    },
    {
      title: "Environmental Monitoring",
      description: "Advanced environmental impact assessment and monitoring",
      benefits: ["Sustainable practices", "Regulatory compliance", "Impact minimization", "Green building"]
    }
  ];

  return (
    <>
      <SEOHead 
        title="Features & Services - Comprehensive Construction & Engineering Solutions"
        description="Explore our comprehensive range of construction and engineering features including residential, commercial, infrastructure projects, and advanced technology solutions."
        keywords={["construction features", "engineering services", "residential construction", "commercial projects", "infrastructure development", "Kenya construction"]}
      />
      
      <div className="min-h-screen bg-white">
        <Navbar />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
                Powerful <span className="text-orange-400">Features</span>
              </h1>
              <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 opacity-90 animate-fade-in">
                Discover our comprehensive suite of construction and engineering features 
                designed to deliver exceptional results for every project
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300">
                  Explore Features
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300">
                  Request Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Core Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From residential homes to large infrastructure projects, we offer comprehensive solutions
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-12">
                <TabsTrigger value="construction">Construction</TabsTrigger>
                <TabsTrigger value="engineering">Engineering</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="technology">Technology</TabsTrigger>
              </TabsList>

              <TabsContent value="construction" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {constructionFeatures.map((feature, index) => (
                    <Card key={index} className="hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={feature.image} 
                          alt={feature.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-gray-600 mb-4">{feature.description}</p>
                        <div className="space-y-2">
                          {feature.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="engineering" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {engineeringFeatures.map((feature, index) => (
                    <Card key={index} className="hover:shadow-2xl transition-all duration-500 relative">
                      {feature.premium && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            Premium
                          </Badge>
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <feature.icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{feature.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{feature.description}</p>
                        <div className="space-y-2">
                          {feature.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <Star className="w-4 h-4 text-yellow-500 mr-2" />
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceFeatures.map((feature, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300`}>
                            <feature.icon className={`w-6 h-6 ${feature.color} group-hover:text-white transition-colors duration-300`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="technology" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {technologyFeatures.map((feature, index) => (
                    <Card key={index} className="hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center">
                          <Zap className="w-6 h-6 mr-3 text-blue-600" />
                          {feature.title}
                        </CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {feature.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center p-2 bg-green-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span className="text-sm font-medium">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Features?
              </h2>
              <p className="text-xl text-gray-600">
                See how our features compare to industry standards
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Feature</th>
                    <th className="px-6 py-4 text-center">Industry Standard</th>
                    <th className="px-6 py-4 text-center">Our Solution</th>
                    <th className="px-6 py-4 text-center">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">Project Timeline</td>
                    <td className="px-6 py-4 text-center">6-12 months</td>
                    <td className="px-6 py-4 text-center font-semibold text-green-600">4-8 months</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-green-100 text-green-800">30% Faster</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">Quality Assurance</td>
                    <td className="px-6 py-4 text-center">Basic inspections</td>
                    <td className="px-6 py-4 text-center font-semibold text-green-600">Advanced QA System</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-blue-100 text-blue-800">Superior Quality</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">Cost Efficiency</td>
                    <td className="px-6 py-4 text-center">Standard pricing</td>
                    <td className="px-6 py-4 text-center font-semibold text-green-600">15% Cost Savings</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-purple-100 text-purple-800">Value Leader</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">Customer Support</td>
                    <td className="px-6 py-4 text-center">Business hours</td>
                    <td className="px-6 py-4 text-center font-semibold text-green-600">24/7 Support</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-orange-100 text-orange-800">Always Available</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Experience Our Features?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Get started with our comprehensive construction and engineering solutions today.
              Contact us for a personalized consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300">
                <ArrowRight className="w-5 h-5 mr-2" />
                View Projects
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Features;
