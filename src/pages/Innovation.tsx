import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cpu, 
  Smartphone, 
  Zap, 
  Cog,
  Monitor,
  Database,
  Wifi,
  Shield,
  Lightbulb,
  Rocket,
  Brain,
  Settings,
  ArrowRight,
  Play,
  Download,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Innovation = () => {
  const [activeTab, setActiveTab] = useState('technology');

  const innovations = [
    {
      category: 'technology',
      title: 'Building Information Modeling (BIM)',
      description: 'Advanced 3D modeling and project visualization for precise planning and execution.',
      icon: <Monitor className="h-12 w-12 text-blue-600" />,
      benefits: [
        'Reduced construction errors by 40%',
        'Improved project coordination',
        'Real-time collaboration',
        'Cost optimization'
      ],
      status: 'Implemented',
      image: '/api/placeholder/400/300'
    },
    {
      category: 'technology',
      title: 'IoT Construction Monitoring',
      description: 'Smart sensors and IoT devices for real-time construction site monitoring and safety.',
      icon: <Wifi className="h-12 w-12 text-green-600" />,
      benefits: [
        '24/7 site monitoring',
        'Predictive maintenance',
        'Safety incident prevention',
        'Environmental monitoring'
      ],
      status: 'Active',
      image: '/api/placeholder/400/300'
    },
    {
      category: 'technology',
      title: 'Drone Survey & Inspection',
      description: 'Aerial surveying and inspection using advanced drone technology for accuracy and safety.',
      icon: <Zap className="h-12 w-12 text-purple-600" />,
      benefits: [
        'Precise site surveying',
        'Safety inspection',
        'Progress monitoring',
        'Cost-effective mapping'
      ],
      status: 'Expanding',
      image: '/api/placeholder/400/300'
    },
    {
      category: 'methods',
      title: 'Prefabricated Construction',
      description: 'Modern prefabrication techniques for faster, more efficient construction delivery.',
      icon: <Cog className="h-12 w-12 text-orange-600" />,
      benefits: [
        '50% faster construction',
        'Higher quality control',
        'Reduced waste',
        'Weather-independent'
      ],
      status: 'Scaling',
      image: '/api/placeholder/400/300'
    },
    {
      category: 'methods',
      title: 'Lean Construction Methods',
      description: 'Streamlined processes that eliminate waste and maximize value in every project.',
      icon: <TrendingUp className="h-12 w-12 text-red-600" />,
      benefits: [
        'Waste reduction by 30%',
        'Improved efficiency',
        'Cost savings',
        'Quality enhancement'
      ],
      status: 'Standard',
      image: '/api/placeholder/400/300'
    },
    {
      category: 'methods',
      title: 'Modular Construction',
      description: 'Innovative modular building systems for scalable and sustainable construction.',
      icon: <Database className="h-12 w-12 text-cyan-600" />,
      benefits: [
        'Rapid deployment',
        'Scalable solutions',
        'Quality assurance',
        'Sustainable materials'
      ],
      status: 'Growing',
      image: '/api/placeholder/400/300'
    },
    {
      category: 'smart',
      title: 'Smart Building Automation',
      description: 'Integrated building management systems for intelligent facility operations.',
      icon: <Brain className="h-12 w-12 text-indigo-600" />,
      benefits: [
        'Energy optimization',
        'Automated controls',
        'Predictive maintenance',
        'User comfort'
      ],
      status: 'Advanced',
      image: '/api/placeholder/400/300'
    },
    {
      category: 'smart',
      title: 'AI-Powered Project Management',
      description: 'Artificial intelligence for optimized project scheduling and resource allocation.',
      icon: <Cpu className="h-12 w-12 text-pink-600" />,
      benefits: [
        'Optimized scheduling',
        'Resource efficiency',
        'Risk prediction',
        'Decision support'
      ],
      status: 'Pilot',
      image: '/api/placeholder/400/300'
    },
    {
      category: 'smart',
      title: 'Mobile Project Apps',
      description: 'Custom mobile applications for real-time project management and communication.',
      icon: <Smartphone className="h-12 w-12 text-teal-600" />,
      benefits: [
        'Real-time updates',
        'Mobile accessibility',
        'Team coordination',
        'Digital documentation'
      ],
      status: 'Deployed',
      image: '/api/placeholder/400/300'
    }
  ];

  const stats = [
    { number: '85%', label: 'Efficiency Improvement', description: 'Through digital innovation' },
    { number: '60%', label: 'Faster Delivery', description: 'With modern methods' },
    { number: '40%', label: 'Cost Reduction', description: 'Through optimization' },
    { number: '99%', label: 'Safety Record', description: 'With smart monitoring' }
  ];

  const researchAreas = [
    {
      title: 'Sustainable Materials',
      description: 'Researching eco-friendly building materials from local Kenyan resources.',
      progress: 75,
      timeline: 'Q2 2024'
    },
    {
      title: 'Climate-Resilient Design',
      description: 'Developing construction methods adapted to Kenya\'s changing climate.',
      progress: 60,
      timeline: 'Q3 2024'
    },
    {
      title: 'Affordable Housing Tech',
      description: 'Innovative solutions for cost-effective housing across Kenya.',
      progress: 90,
      timeline: 'Q1 2024'
    },
    {
      title: 'Digital Twin Technology',
      description: 'Virtual building models for lifecycle management and optimization.',
      progress: 45,
      timeline: 'Q4 2024'
    }
  ];

  const partnerships = [
    {
      name: 'University of Nairobi',
      type: 'Research Partnership',
      focus: 'Construction Technology Research',
      logo: '/api/placeholder/100/60'
    },
    {
      name: 'Kenya Bureau of Standards',
      type: 'Standards Development',
      focus: 'Building Code Innovation',
      logo: '/api/placeholder/100/60'
    },
    {
      name: 'Strathmore University',
      type: 'Innovation Lab',
      focus: 'Digital Construction Tools',
      logo: '/api/placeholder/100/60'
    },
    {
      name: 'National Construction Authority',
      type: 'Industry Collaboration',
      focus: 'Best Practices Development',
      logo: '/api/placeholder/100/60'
    }
  ];

  const getFilteredInnovations = () => {
    return innovations.filter(innovation => innovation.category === activeTab);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Implemented': case 'Active': case 'Standard': case 'Advanced': case 'Deployed':
        return 'bg-green-100 text-green-800';
      case 'Expanding': case 'Scaling': case 'Growing':
        return 'bg-blue-100 text-blue-800';
      case 'Pilot':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-100 p-4 rounded-full">
                <Lightbulb className="h-16 w-16 text-indigo-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Innovation in Construction
              <span className="text-indigo-600 block">Transforming Kenya's Future</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Leading Kenya's construction industry into the digital age with cutting-edge 
              technology, innovative methods, and smart solutions that deliver superior 
              results for our clients and communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request-quote">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Explore Innovation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Innovation Impact
            </h2>
            <p className="text-lg text-gray-600">
              Measurable improvements through technology and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 shadow-lg">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">
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

      {/* Innovation Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Innovation Portfolio
            </h2>
            <p className="text-lg text-gray-600">
              Explore our comprehensive approach to construction innovation across 
              technology, methods, and smart solutions.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="technology" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Technology
              </TabsTrigger>
              <TabsTrigger value="methods" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Methods
              </TabsTrigger>
              <TabsTrigger value="smart" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Smart Solutions
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredInnovations().map((innovation, index) => (
                  <Card key={index} className="hover:shadow-xl transition-shadow border-2 hover:border-indigo-200">
                    <div className="aspect-video bg-gray-200 relative">
                      <img 
                        src={innovation.image} 
                        alt={innovation.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={getStatusColor(innovation.status)}>
                          {innovation.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader className="text-center pb-2">
                      <div className="flex justify-center mb-4">
                        {innovation.icon}
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900">
                        {innovation.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">
                        {innovation.description}
                      </p>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 text-sm">Key Benefits:</h4>
                        {innovation.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-700">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="sm">
                          Learn More
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Research & Development */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Research & Development
              </h2>
              <p className="text-lg text-gray-600">
                Ongoing research initiatives to advance construction innovation in Kenya
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {researchAreas.map((area, index) => (
                <Card key={index} className="border-2 hover:border-indigo-200 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-bold text-gray-900">
                        {area.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {area.timeline}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {area.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-2 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-indigo-600">{area.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${area.progress}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partnerships */}
      <section className="py-16 bg-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Innovation Partnerships
            </h2>
            <p className="text-lg text-gray-600">
              Collaborating with leading institutions to drive construction innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerships.map((partner, index) => (
              <Card key={index} className="text-center bg-white border-2 hover:border-indigo-200 transition-colors">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <img 
                      src={partner.logo} 
                      alt={partner.name}
                      className="h-12 mx-auto object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {partner.name}
                  </h3>
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {partner.type}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {partner.focus}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Lab */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  AKIBEKS Innovation Lab
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Our dedicated innovation lab in Nairobi serves as the hub for 
                    developing and testing cutting-edge construction technologies 
                    tailored for the Kenyan market.
                  </p>
                  <p>
                    From 3D printing of building components to testing sustainable 
                    materials made from local resources, our lab is where the future 
                    of Kenyan construction is being built today.
                  </p>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center">
                      <Rocket className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>Next-generation building materials testing</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>Safety technology development and validation</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>Energy-efficient building system prototyping</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Lab Capabilities
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-semibold">Material Testing</div>
                      <div className="text-sm text-gray-600">Advanced testing for strength, durability, and sustainability</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-semibold">Digital Prototyping</div>
                      <div className="text-sm text-gray-600">VR/AR visualization and BIM modeling</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-semibold">IoT Development</div>
                      <div className="text-sm text-gray-600">Smart building sensors and monitoring systems</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Schedule Lab Tour
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Partner with Innovation Leaders
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the future of construction today. Let's build your project 
            with the latest innovations and technologies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/request-quote">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Start Innovation Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
              <Download className="mr-2 h-5 w-5" />
              Innovation Brochure
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Innovation;