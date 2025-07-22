
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, X, Star, Calculator, Phone, Mail, ArrowRight, Building, Home, Factory, Wrench, Zap, Award } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("residential");

  const pricingPlans = {
    residential: [
      {
        name: "Starter Home",
        description: "Perfect for small residential projects",
        price: { monthly: 850000, annual: 750000 },
        features: [
          "Up to 1,500 sq ft",
          "Basic architectural design",
          "Standard materials",
          "3-month completion",
          "1-year warranty",
          "Basic electrical & plumbing"
        ],
        excluded: [
          "Custom designs",
          "Premium materials",
          "Landscaping"
        ],
        popular: false,
        color: "border-gray-200"
      },
      {
        name: "Family Home",
        description: "Ideal for medium-sized family homes",
        price: { monthly: 1500000, annual: 1350000 },
        features: [
          "Up to 2,500 sq ft",
          "Custom architectural design",
          "Quality materials",
          "5-month completion",
          "2-year warranty",
          "Modern electrical & plumbing",
          "Basic landscaping",
          "Interior design consultation"
        ],
        excluded: [
          "Swimming pool",
          "Solar systems"
        ],
        popular: true,
        color: "border-blue-500"
      },
      {
        name: "Luxury Villa",
        description: "Premium homes with all amenities",
        price: { monthly: 3500000, annual: 3200000 },
        features: [
          "Up to 5,000 sq ft",
          "Premium architectural design",
          "High-end materials",
          "8-month completion",
          "5-year warranty",
          "Smart home systems",
          "Complete landscaping",
          "Interior design & furnishing",
          "Swimming pool option",
          "Solar power systems"
        ],
        excluded: [],
        popular: false,
        color: "border-purple-500"
      }
    ],
    commercial: [
      {
        name: "Small Office",
        description: "For small business spaces",
        price: { monthly: 2500000, annual: 2250000 },
        features: [
          "Up to 3,000 sq ft",
          "Open floor plans",
          "Basic HVAC systems", 
          "Standard electrical",
          "6-month completion",
          "2-year warranty"
        ],
        excluded: [
          "Custom layouts",
          "Advanced security"
        ],
        popular: false,
        color: "border-gray-200"
      },
      {
        name: "Business Complex",
        description: "Multi-unit commercial buildings",
        price: { monthly: 8500000, annual: 7800000 },
        features: [
          "Up to 15,000 sq ft",
          "Custom floor plans",
          "Advanced HVAC systems",
          "Commercial-grade electrical",
          "12-month completion",
          "3-year warranty",
          "Parking facilities",
          "Security systems"
        ],
        excluded: [
          "Specialty equipment"
        ],
        popular: true,
        color: "border-green-500"
      },
      {
        name: "Enterprise Facility",
        description: "Large-scale commercial projects",
        price: { monthly: 25000000, annual: 22000000 },
        features: [
          "50,000+ sq ft",
          "Specialized designs",
          "Industrial-grade systems",
          "Advanced automation",
          "18-month completion",
          "5-year warranty",
          "Complete infrastructure",
          "24/7 support",
          "Compliance management"
        ],
        excluded: [],
        popular: false,
        color: "border-orange-500"
      }
    ],
    engineering: [
      {
        name: "Basic Consultation",
        description: "Engineering consultation services",
        price: { monthly: 150000, annual: 135000 },
        features: [
          "Site assessment",
          "Basic structural analysis",
          "Permit assistance",
          "Design recommendations",
          "2-week turnaround"
        ],
        excluded: [
          "Detailed drawings",
          "Construction oversight"
        ],
        popular: false,
        color: "border-gray-200"
      },
      {
        name: "Full Engineering",
        description: "Complete engineering services",
        price: { monthly: 450000, annual: 400000 },
        features: [
          "Comprehensive site analysis",
          "Detailed structural design",
          "MEP system design",
          "Construction drawings",
          "Permit processing",
          "Construction oversight",
          "1-month completion"
        ],
        excluded: [
          "Specialized systems"
        ],
        popular: true,
        color: "border-blue-500"
      },
      {
        name: "Specialized Engineering",
        description: "Advanced engineering solutions",
        price: { monthly: 850000, annual: 750000 },
        features: [
          "Advanced structural analysis",
          "Seismic design",
          "Environmental impact study",
          "Specialized systems design",
          "Advanced modeling",
          "Ongoing consultation",
          "Priority support",
          "Compliance certification"
        ],
        excluded: [],
        popular: false,
        color: "border-purple-500"
      }
    ]
  };

  const additionalServices = [
    { name: "Project Management", price: "10% of project cost", description: "Dedicated project manager" },
    { name: "Extended Warranty", price: "KSh 50,000/year", description: "Additional warranty coverage" },
    { name: "Maintenance Package", price: "KSh 25,000/month", description: "Regular maintenance visits" },
    { name: "Rush Delivery", price: "20% surcharge", description: "Accelerated timeline" },
    { name: "Premium Materials", price: "15-30% premium", description: "High-end material upgrades" },
    { name: "Smart Home Integration", price: "KSh 200,000+", description: "IoT and automation systems" }
  ];

  const currentPlans = pricingPlans[selectedCategory as keyof typeof pricingPlans];

  return (
    <>
      <SEOHead 
        title="Pricing - Transparent Construction & Engineering Costs in Kenya"
        description="Explore our transparent pricing for residential, commercial construction and engineering services. Get quality construction at competitive rates with clear pricing structure."
        keywords={["construction pricing Kenya", "building costs", "engineering rates", "residential construction price", "commercial building costs"]}
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
                Transparent <span className="text-orange-400">Pricing</span>
              </h1>
              <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 opacity-90 animate-fade-in">
                Clear, competitive pricing for all your construction and engineering needs. 
                No hidden costs, no surprises - just honest pricing you can trust.
              </p>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-lg font-medium ${!isAnnual ? 'text-orange-400' : 'text-white/70'}`}>
                  Project Based
                </span>
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  className="data-[state=checked]:bg-orange-500"
                />
                <span className={`text-lg font-medium ${isAnnual ? 'text-orange-400' : 'text-white/70'}`}>
                  Annual Contract
                </span>
                {isAnnual && (
                  <Badge className="bg-orange-500 text-white ml-2">
                    Save 10%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Categories */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Choose Your Category
              </h2>
              <p className="text-xl text-gray-600">
                Select the type of project that matches your needs
              </p>
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-12">
                <TabsTrigger value="residential" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Residential
                </TabsTrigger>
                <TabsTrigger value="commercial" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Commercial
                </TabsTrigger>
                <TabsTrigger value="engineering" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Engineering
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {currentPlans.map((plan, index) => (
                    <Card 
                      key={index} 
                      className={`relative hover:shadow-2xl transition-all duration-500 ${plan.color} ${plan.popular ? 'scale-105 shadow-xl' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 text-sm font-semibold">
                            <Star className="w-4 h-4 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-8">
                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                        <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                        <div className="mt-6">
                          <div className="text-4xl font-bold text-gray-900">
                            KSh {(isAnnual ? plan.price.annual : plan.price.monthly).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {isAnnual ? 'per year' : 'per project'}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4 mb-8">
                          <div>
                            <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Included Features
                            </h4>
                            <ul className="space-y-2">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {plan.excluded.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                                <X className="w-4 h-4 mr-2" />
                                Not Included
                              </h4>
                              <ul className="space-y-2">
                                {plan.excluded.map((feature, idx) => (
                                  <li key={idx} className="flex items-start text-sm">
                                    <X className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-600">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' : ''}`}
                          size="lg"
                        >
                          Get Quote
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Additional Services */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Additional Services
              </h2>
              <p className="text-xl text-gray-600">
                Enhance your project with our optional add-on services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalServices.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                      <Zap className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    </div>
                    <div className="text-xl font-bold text-blue-600">{service.price}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Cost Calculator */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Need a Custom Quote?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Use our cost calculator to get an accurate estimate for your specific project
            </p>
            
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <Calculator className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Project Cost Calculator</h3>
                <p className="text-gray-600 mb-6">
                  Get an instant estimate based on your project requirements, location, and timeline preferences.
                </p>
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Calculator className="w-5 h-5 mr-2" />
                  Launch Calculator
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Pricing FAQ
              </h2>
              <p className="text-xl text-gray-600">
                Common questions about our pricing structure
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "Are there any hidden costs?",
                  answer: "No, our pricing is completely transparent. All costs are clearly outlined in your quote, including materials, labor, permits, and any additional services."
                },
                {
                  question: "Can I get a payment plan?",
                  answer: "Yes, we offer flexible payment plans. Typically, we require 30% upfront, 40% at 50% completion, and 30% upon project completion."
                },
                {
                  question: "What's included in the warranty?",
                  answer: "Our warranty covers structural defects, workmanship issues, and material failures. The warranty period varies by project type and is clearly specified in your contract."
                },
                {
                  question: "Do prices vary by location?",
                  answer: "Yes, prices may vary based on location due to material transportation costs, local labor rates, and permit fees. We provide location-specific quotes."
                },
                {
                  question: "Can I make changes during construction?",
                  answer: "Changes are possible but may affect the timeline and cost. We provide change order estimates before implementing any modifications to your project."
                }
              ].map((faq, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Contact us today for a detailed quote tailored to your specific project requirements.
              Our team is ready to help bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300">
                <Phone className="w-5 h-5 mr-2" />
                Call for Quote
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300">
                <Mail className="w-5 h-5 mr-2" />
                Email Us
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-sm opacity-80">
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Licensed & Insured
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Quality Guaranteed
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                5-Star Rated
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Pricing;
