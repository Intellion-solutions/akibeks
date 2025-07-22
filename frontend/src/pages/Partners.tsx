import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  Zap, 
  Users, 
  Trophy, 
  Star,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  CheckCircle,
  Building,
  Target,
  Briefcase
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Partners = () => {
  const technologyPartners = [
    {
      name: 'Slack',
      category: 'Communication',
      description: 'Seamless integration with Slack for real-time project notifications and team collaboration.',
      logo: '/api/placeholder/150/80',
      features: ['Real-time notifications', 'Task updates', 'Channel integration'],
      status: 'active'
    },
    {
      name: 'Microsoft Teams',
      category: 'Communication',
      description: 'Connect your projects with Microsoft Teams for enhanced team collaboration and communication.',
      logo: '/api/placeholder/150/80',
      features: ['Team notifications', 'File sharing', 'Meeting integration'],
      status: 'active'
    },
    {
      name: 'Google Workspace',
      category: 'Productivity',
      description: 'Integrate with Google Drive, Gmail, and Calendar for complete productivity suite integration.',
      logo: '/api/placeholder/150/80',
      features: ['Calendar sync', 'Drive integration', 'Gmail notifications'],
      status: 'active'
    },
    {
      name: 'Jira',
      category: 'Development',
      description: 'Sync your development workflow with Jira for comprehensive project and issue tracking.',
      logo: '/api/placeholder/150/80',
      features: ['Issue tracking', 'Sprint planning', 'Workflow automation'],
      status: 'active'
    },
    {
      name: 'GitHub',
      category: 'Development',
      description: 'Connect your repositories for automatic project updates based on code commits and releases.',
      logo: '/api/placeholder/150/80',
      features: ['Commit tracking', 'Release management', 'Code reviews'],
      status: 'active'
    },
    {
      name: 'Salesforce',
      category: 'CRM',
      description: 'Integrate with Salesforce to sync client data and manage customer projects seamlessly.',
      logo: '/api/placeholder/150/80',
      features: ['Client sync', 'Opportunity tracking', 'Sales pipeline'],
      status: 'coming_soon'
    }
  ];

  const partnershipTiers = [
    {
      name: 'Technology Partner',
      description: 'Integrate your platform with our project management solution',
      benefits: [
        'API access and documentation',
        'Technical support',
        'Co-marketing opportunities',
        'Partner directory listing'
      ],
      requirements: [
        'Active software platform',
        'Complementary functionality',
        'Technical integration capability'
      ],
      icon: Zap
    },
    {
      name: 'Solution Partner',
      description: 'Provide implementation and consulting services to our customers',
      benefits: [
        'Certified partner status',
        'Lead referrals',
        'Training and certification',
        'Marketing support'
      ],
      requirements: [
        'Proven implementation experience',
        'Certified team members',
        'Customer references'
      ],
      icon: Target
    },
    {
      name: 'Reseller Partner',
      description: 'Sell our platform to your customer base with attractive margins',
      benefits: [
        'Competitive pricing',
        'Sales support',
        'Training materials',
        'Revenue sharing'
      ],
      requirements: [
        'Established sales channel',
        'Customer base alignment',
        'Sales team training'
      ],
      icon: Briefcase
    }
  ];

  const successStories = [
    {
      partner: 'TechCorp Solutions',
      type: 'Solution Partner',
      story: 'Helped 50+ enterprises implement our platform, resulting in 40% improvement in project delivery times.',
      results: ['50+ implementations', '40% faster delivery', '95% customer satisfaction'],
      testimonial: 'The partnership program has been instrumental in growing our consulting business.'
    },
    {
      partner: 'CloudSync Inc',
      type: 'Technology Partner',
      story: 'Integrated their file sync solution with our platform, serving 10,000+ joint customers.',
      results: ['10,000+ joint customers', '99.9% uptime', '30% feature adoption'],
      testimonial: 'Our integration with the platform has opened new market opportunities.'
    },
    {
      partner: 'Global Business Systems',
      type: 'Reseller Partner',
      story: 'Expanded into project management market, achieving $2M in annual revenue within 18 months.',
      results: ['$2M annual revenue', '200+ customers', '85% retention rate'],
      testimonial: 'This partnership has transformed our business and opened new revenue streams.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Partners - Project Management Platform</title>
        <meta name="description" content="Explore our technology partnerships, integrations, and partnership opportunities. Join our partner ecosystem to grow your business." />
        <meta name="keywords" content="partners, integrations, technology partners, resellers, solutions partners, API" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                <Heart className="h-8 w-8" />
              </div>
              <h1 className="text-5xl font-bold mb-6">
                Partner Ecosystem
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Join our growing network of technology partners, solution providers, and resellers. 
                Together, we're building the future of project management.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" variant="secondary">
                  <Users className="h-5 w-5 mr-2" />
                  Become a Partner
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                  <Globe className="h-5 w-5 mr-2" />
                  View Integrations
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Stats */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Technology Partners', value: '50+' },
                { label: 'Integrations Available', value: '100+' },
                { label: 'Solution Partners', value: '200+' },
                { label: 'Countries Covered', value: '45+' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technology Partners */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Technology Partners</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Seamlessly integrate with the tools your team already uses and loves.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {technologyPartners.map((partner, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                            {partner.status === 'active' ? 'Active' : 'Coming Soon'}
                          </Badge>
                          {partner.status === 'active' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{partner.name}</h3>
                      <Badge variant="outline" className="mb-3">{partner.category}</Badge>
                      <p className="text-gray-600 text-sm mb-4">{partner.description}</p>
                      <div className="space-y-1 mb-4">
                        {partner.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full" 
                        variant={partner.status === 'active' ? 'default' : 'outline'}
                        disabled={partner.status !== 'active'}
                      >
                        {partner.status === 'active' ? 'Configure Integration' : 'Notify When Available'}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Partnership Opportunities */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Partnership Opportunities</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Join our partner program and grow your business while helping organizations succeed.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {partnershipTiers.map((tier, index) => (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                        <tier.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle>{tier.name}</CardTitle>
                      <p className="text-gray-600 text-sm">{tier.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-green-600">Benefits</h4>
                          <ul className="space-y-2">
                            {tier.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-center text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-blue-600">Requirements</h4>
                          <ul className="space-y-2">
                            {tier.requirements.map((requirement, idx) => (
                              <li key={idx} className="flex items-center text-sm">
                                <Star className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                                {requirement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <Button className="w-full mt-6">
                        Apply Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Partner Success Stories</h2>
                <p className="text-gray-600">
                  See how our partners are growing their businesses and serving customers better.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {successStories.map((story, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{story.partner}</h3>
                        <Badge variant="outline">{story.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">{story.story}</p>
                      <div className="space-y-2 mb-4">
                        {story.results.map((result, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <Trophy className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                            {result}
                          </div>
                        ))}
                      </div>
                      <blockquote className="text-sm italic text-gray-700 border-l-4 border-blue-200 pl-4">
                        "{story.testimonial}"
                      </blockquote>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Partnership Application Form */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Become a Partner</CardTitle>
                  <p className="text-center text-gray-600">
                    Ready to join our partner ecosystem? Fill out the form below to get started.
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Company Name</label>
                        <Input placeholder="Your company name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Partnership Type</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option>Select partnership type</option>
                          <option>Technology Partner</option>
                          <option>Solution Partner</option>
                          <option>Reseller Partner</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Contact Name</label>
                        <Input placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input type="email" placeholder="your.email@company.com" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <Input placeholder="+1 (555) 123-4567" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <Input placeholder="https://yourcompany.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Description</label>
                      <Textarea 
                        placeholder="Tell us about your company, what you do, and how you can help our customers..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Partnership Interest</label>
                      <Textarea 
                        placeholder="Describe your interest in partnering with us and how you envision the partnership working..."
                        rows={4}
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Submit Partnership Application
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Partner Resources */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Partner Resources</h2>
                <p className="text-gray-600">
                  Everything you need to succeed as our partner.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'API Documentation', description: 'Complete API reference and integration guides', icon: Globe },
                  { title: 'Marketing Materials', description: 'Co-branded materials and marketing resources', icon: Star },
                  { title: 'Training Center', description: 'Certification programs and training materials', icon: Users },
                  { title: 'Partner Portal', description: 'Access to leads, resources, and support', icon: Building }
                ].map((resource, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                        <resource.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">{resource.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                      <Button variant="outline" size="sm">
                        Access Resource
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Questions About Our Partner Program?</h2>
              <p className="text-gray-600 mb-8">
                Our partner team is here to help you understand the opportunities and get started.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <Mail className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <p className="text-gray-600 text-sm">partners@company.com</p>
                </div>
                <div className="text-center">
                  <Phone className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <p className="text-gray-600 text-sm">+1 (555) 123-4567</p>
                </div>
                <div className="text-center">
                  <Globe className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Partner Portal</h3>
                  <p className="text-gray-600 text-sm">portal.company.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Partners;